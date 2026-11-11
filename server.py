#!/usr/bin/env python3
"""Ani Cocoa Cosmetics: the site, bookings, shelf orders, and job notes."""

import json
import os
import re
import secrets
import sqlite3
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent
# Vercel functions can write only under /tmp, and that disk is ephemeral.
DB_PATH = Path("/tmp/ani-cocoa-shop.db") if os.environ.get("VERCEL") else ROOT / "data" / "shop.db"
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^[0-9+\s()-]{10,18}$")
HOST = "127.0.0.1"
PORT = 8090


def connect():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    DB_PATH.parent.mkdir(exist_ok=True)
    with connect() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY,
                reference TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT NOT NULL,
                service_id TEXT NOT NULL,
                service_name TEXT NOT NULL,
                day TEXT NOT NULL,
                part TEXT NOT NULL,
                note TEXT NOT NULL,
                deposit_ack INTEGER NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY,
                reference TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT NOT NULL,
                note TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY,
                order_id INTEGER NOT NULL REFERENCES orders(id),
                product_id TEXT NOT NULL,
                name TEXT NOT NULL,
                qty INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS applications (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT NOT NULL,
                role TEXT NOT NULL,
                note TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            """
        )


def now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def load_json(name):
    return json.loads((ROOT / "data" / name).read_text())


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/bookings":
            self.lookup("bookings", parse_qs(parsed.query).get("reference", [""])[0])
            return
        if parsed.path == "/api/orders":
            self.lookup("orders", parse_qs(parsed.query).get("reference", [""])[0])
            return
        if parsed.path.startswith("/api/"):
            self.send_json(404, {"error": "Not found."})
            return
        lowered = parsed.path.lower()
        if lowered.startswith("/data/shop.db") or "/.git" in lowered:
            self.send_error(404)
            return
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        length = int(self.headers.get("Content-Length", "0") or 0)
        if length > 80_000:
            self.send_json(413, {"error": "That request is too large."})
            return
        raw = self.rfile.read(length) if length else b""
        try:
            body = json.loads(raw.decode() or "{}")
        except json.JSONDecodeError:
            self.send_json(400, {"error": "Send JSON."})
            return
        if not isinstance(body, dict):
            self.send_json(400, {"error": "Send a JSON object."})
            return
        routes = {
            "/api/bookings": self.create_booking,
            "/api/orders": self.create_order,
            "/api/applications": self.create_application,
        }
        handler = routes.get(parsed.path)
        if not handler:
            self.send_json(404, {"error": "Not found."})
            return
        handler(body)

    def send_json(self, status, payload):
        data = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def person(self, body):
        name = str(body.get("name", "")).strip()
        phone = str(body.get("phone", "")).strip()
        email = str(body.get("email", "")).strip()
        if len(name) < 2:
            return None, "Enter your name."
        digits = re.sub(r"\D", "", phone)
        if len(digits) < 10 or not PHONE_RE.match(phone):
            return None, "Enter a phone number we can call or WhatsApp."
        if email and not EMAIL_RE.match(email):
            return None, "Enter an email address like name@example.com, or leave it blank."
        return {"name": name, "phone": phone, "email": email}, None

    def reference(self, prefix):
        return prefix + "-" + secrets.token_hex(3).upper()

    def create_booking(self, body):
        person, error = self.person(body)
        if error:
            self.send_json(400, {"error": error})
            return
        services = {item["id"]: item for item in load_json("services.json")["services"]}
        service = services.get(str(body.get("service", "")))
        if not service:
            self.send_json(400, {"error": "Choose hair or nails."})
            return
        day = str(body.get("day", "")).strip()
        try:
            chosen = datetime.strptime(day, "%Y-%m-%d")
        except ValueError:
            self.send_json(400, {"error": "Choose a date."})
            return
        today = datetime.now().date()
        if chosen.date() < today:
            self.send_json(400, {"error": "Choose today or a later day."})
            return
        if chosen.weekday() == 0:
            self.send_json(400, {"error": "The bar is closed on Monday. Choose Tuesday to Sunday."})
            return
        part = str(body.get("part", "")).strip()
        if part not in {"Morning", "Afternoon", "Evening"}:
            self.send_json(400, {"error": "Choose morning, afternoon, or evening."})
            return
        if body.get("deposit") is not True:
            self.send_json(400, {"error": "A booking needs the deposit acknowledgement. The deposit is not refundable."})
            return
        note = str(body.get("note", "")).strip()[:500]
        created = now()
        with connect() as connection:
            reference = self.reference("ACC")
            connection.execute(
                """
                INSERT INTO bookings
                    (reference, name, phone, email, service_id, service_name, day, part, note, deposit_ack, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'requested', ?)
                """,
                (reference, person["name"], person["phone"], person["email"], service["id"], service["name"], day, part, note, created),
            )
        self.send_json(201, {
            "reference": reference,
            "service": service["name"],
            "day": day,
            "part": part,
            "status": "requested",
        })

    def create_order(self, body):
        person, error = self.person(body)
        if error:
            self.send_json(400, {"error": error})
            return
        catalog = {item["id"]: item for item in load_json("products.json")["products"]}
        items = body.get("items")
        if not isinstance(items, list) or not items:
            self.send_json(400, {"error": "The bag is empty."})
            return
        lines = []
        for item in items:
            if not isinstance(item, dict):
                self.send_json(400, {"error": "Each line needs a product."})
                return
            product = catalog.get(str(item.get("id", "")))
            if not product:
                self.send_json(400, {"error": "A product in the bag is no longer listed."})
                return
            try:
                qty = int(item.get("qty"))
            except (TypeError, ValueError):
                self.send_json(400, {"error": "Quantity must be a whole number."})
                return
            if qty < 1 or qty > 6:
                self.send_json(400, {"error": "Quantity must be from 1 to 6."})
                return
            lines.append((product["id"], product["name"], qty))
        note = str(body.get("note", "")).strip()[:500]
        created = now()
        with connect() as connection:
            reference = self.reference("SHELF")
            cursor = connection.execute(
                """
                INSERT INTO orders (reference, name, phone, email, note, status, created_at)
                VALUES (?, ?, ?, ?, ?, 'requested', ?)
                """,
                (reference, person["name"], person["phone"], person["email"], note, created),
            )
            order_id = cursor.lastrowid
            connection.executemany(
                "INSERT INTO order_items (order_id, product_id, name, qty) VALUES (?, ?, ?, ?)",
                [(order_id, line[0], line[1], line[2]) for line in lines],
            )
        self.send_json(201, {
            "reference": reference,
            "status": "requested",
            "items": [{"name": line[1], "qty": line[2]} for line in lines],
        })

    def create_application(self, body):
        person, error = self.person(body)
        if error:
            self.send_json(400, {"error": error})
            return
        if not person["email"]:
            self.send_json(400, {"error": "Enter the email you want the studio to reply to."})
            return
        role = str(body.get("role", "")).strip()
        if role not in {"Braider", "Pedicurist"}:
            self.send_json(400, {"error": "Choose braider or pedicurist."})
            return
        note = str(body.get("note", "")).strip()
        if len(note) < 20:
            self.send_json(400, {"error": "Write a short note of at least 20 characters."})
            return
        with connect() as connection:
            connection.execute(
                "INSERT INTO applications (name, phone, email, role, note, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (person["name"], person["phone"], person["email"], role, note[:800], now()),
            )
        self.send_json(201, {"saved": True})

    def lookup(self, table, reference):
        reference = reference.strip()
        if len(reference) < 4:
            self.send_json(400, {"error": "Enter a reference of at least 4 characters."})
            return
        with connect() as connection:
            if table == "bookings":
                row = connection.execute(
                    "SELECT reference, service_name, day, part, status FROM bookings WHERE reference = ? COLLATE NOCASE",
                    (reference,),
                ).fetchone()
            else:
                row = connection.execute(
                    "SELECT id, reference, status FROM orders WHERE reference = ? COLLATE NOCASE",
                    (reference,),
                ).fetchone()
                if row:
                    items = connection.execute(
                        "SELECT name, qty FROM order_items WHERE order_id = ?",
                        (row["id"],),
                    ).fetchall()
                    self.send_json(200, {
                        "reference": row["reference"],
                        "status": row["status"],
                        "kind": "order",
                        "items": [dict(item) for item in items],
                    })
                    return
        if not row:
            self.send_json(404, {"error": "No record matches that reference."})
            return
        self.send_json(200, {
            "reference": row["reference"],
            "status": row["status"],
            "kind": "booking",
            "service": row["service_name"],
            "day": row["day"],
            "part": row["part"],
        })


init_db()

if __name__ == "__main__":
    print(f"Ani Cocoa Cosmetics at http://{HOST}:{PORT}")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
