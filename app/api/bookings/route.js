import { randomBytes } from "crypto";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { services } from "@/lib/content";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const service = services.find((item) => item.id === body.service);
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const day = String(body.day || "");
  const part = String(body.part || "");
  if (!service) return Response.json({ error: "Choose braids, a manicure, or a pedicure." }, { status: 400 });
  if (!day || Number.isNaN(Date.parse(day))) return Response.json({ error: "Choose a day." }, { status: 400 });
  if (new Date(`${day}T12:00:00`).getDay() === 1) return Response.json({ error: "The bar is closed on Monday." }, { status: 400 });
  if (!["Morning", "Afternoon", "Evening"].includes(part)) return Response.json({ error: "Choose a time of day." }, { status: 400 });
  if (name.length < 2) return Response.json({ error: "Enter your name." }, { status: 400 });
  if (phone.replace(/\D/g, "").length < 10) return Response.json({ error: "Enter a phone number." }, { status: 400 });
  if (!body.deposit) return Response.json({ error: "Acknowledge the deposit." }, { status: 400 });

  const reference = `ACC-${randomBytes(3).toString("hex").toUpperCase()}`;
  const record = {
    reference,
    name,
    phone,
    service: service.id,
    serviceName: service.name,
    day,
    part,
    note: String(body.note || "").trim(),
    createdAt: new Date().toISOString()
  };

  try {
    const file = path.join(process.cwd(), "data", "bookings.json");
    let list = [];
    try {
      list = JSON.parse(await readFile(file, "utf8"));
    } catch {
      list = [];
    }
    list.push(record);
    await writeFile(file, JSON.stringify(list, null, 2));
  } catch {
    // The reference still goes to the guest. WhatsApp is how the bar receives it.
  }

  return Response.json(record);
}
