"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { services, store } from "@/lib/content";

const parts = ["Morning", "Afternoon", "Evening"];

export default function BookForm() {
  const params = useSearchParams();
  const preset = params.get("service");
  const initial = services.some((service) => service.id === preset) ? preset : "braids";
  const [service, setService] = useState(initial);
  const [part, setPart] = useState("Afternoon");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(null);

  const min = useMemo(() => new Date().toISOString().slice(0, 10), []);

  async function onSubmit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (!data.day) return setError("Choose a day.");
    if (new Date(`${data.day}T12:00:00`).getDay() === 1) return setError("The bar is closed on Monday.");
    if (!data.name || data.name.trim().length < 2) return setError("Enter your name.");
    if (!data.phone || data.phone.replace(/\D/g, "").length < 10) return setError("Enter a phone number.");
    if (!event.currentTarget.deposit.checked) return setError("The deposit is required, and it is not refundable.");
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name.trim(),
          phone: data.phone.trim(),
          service,
          day: data.day,
          part,
          note: (data.note || "").trim(),
          deposit: true
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "The request could not be sent.");
      setDone(payload);
    } catch (err) {
      setError(err.message);
      setPending(false);
    }
  }

  if (done) {
    const chosen = services.find((item) => item.id === done.service) || services[0];
    const message = `Hello Ani Cocoa. I would like ${chosen.name} on ${done.day}, ${done.part}. My name is ${done.name}. Reference ${done.reference}.`;
    return (
      <section className="done">
        <p className="kicker">{done.reference}</p>
        <h1>Request received.</h1>
        <p>
          {chosen.name} on {done.day}, {done.part}. The bar still confirms the chair. Send the note on WhatsApp so they see it now.
        </p>
        <a className="btn" href={`${store.whatsapp}?text=${encodeURIComponent(message)}`}>
          Send on WhatsApp
        </a>
      </section>
    );
  }

  return (
    <form className="book" onSubmit={onSubmit} noValidate>
      <p className="kicker">The beauty bar</p>
      <h1>Book the chair.</h1>
      <p className="lede">Braids, a manicure, or a pedicure. The bar confirms the time.</p>

      <fieldset>
        <legend>What would you like?</legend>
        <div className="pick">
          {services.map((item) => (
            <button
              type="button"
              key={item.id}
              aria-pressed={service === item.id}
              onClick={() => setService(item.id)}
            >
              <img src={item.image} alt="" />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <label htmlFor="day">Day</label>
      <input id="day" name="day" type="date" required min={min} />

      <fieldset>
        <legend>Time of day</legend>
        <div className="pills">
          {parts.map((item) => (
            <button type="button" key={item} aria-pressed={part === item} onClick={() => setPart(item)}>
              {item}
            </button>
          ))}
        </div>
      </fieldset>

      <label htmlFor="name">Name</label>
      <input id="name" name="name" autoComplete="name" required />

      <label htmlFor="phone">Phone or WhatsApp</label>
      <input id="phone" name="phone" autoComplete="tel" inputMode="tel" required />

      <label htmlFor="note">Style or finish, if you know it</label>
      <input id="note" name="note" placeholder="Knotless braids, a nude manicure…" />

      <label className="check">
        <input name="deposit" type="checkbox" required />
        <span>A deposit is required. It is not refundable.</span>
      </label>

      {error ? <p className="form-error">{error}</p> : null}
      <button className="btn btn-wide" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Request this appointment"}
      </button>
      <p className="fine">Open {store.hours}. Closed {store.closed}. {store.place}.</p>
    </form>
  );
}
