import { mountShell, escapeHtml } from "./shell.js";

const store = await mountShell("careers");
const form = document.querySelector("[data-apply]");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const summary = form.querySelector(".error-summary");
  const problems = [];
  if (!data.name || data.name.trim().length < 2) problems.push("Enter your name.");
  if (!data.phone || data.phone.replace(/\D/g, "").length < 10) problems.push("Enter a phone number.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((data.email || "").trim())) problems.push("Enter an email address.");
  if (!data.role) problems.push("Choose braider or pedicurist.");
  if (!data.note || data.note.trim().length < 20) problems.push("Write a note of at least 20 characters.");
  if (problems.length) {
    summary.hidden = false;
    summary.querySelector("ul").innerHTML = problems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    summary.focus();
    return;
  }
  const button = form.querySelector("button");
  button.disabled = true;
  try {
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email.trim(),
        role: data.role,
        note: data.note.trim()
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "The note could not be saved.");
    form.hidden = true;
    document.querySelector("[data-applied]").hidden = false;
  } catch (error) {
    summary.hidden = false;
    summary.querySelector("ul").innerHTML = `<li>${escapeHtml(error.message)}</li>`;
    button.disabled = false;
  }
});
