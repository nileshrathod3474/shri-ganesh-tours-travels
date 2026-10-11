"use strict";

/* ====== Settings ====== */
const COMPANY_WHATSAPP = "919307203474"; // company number, international format (no + or spaces)
const COMPANY_NAME = "SHRI GANESH TOURS AND TRAVELS";

/* ====== Footer year ====== */
document.getElementById("year").textContent = new Date().getFullYear();

/* ====== Mobile navigation ====== */
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.getElementById("site-nav");

function setNav(open) {
  siteNav.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
navToggle.addEventListener("click", () => setNav(!siteNav.classList.contains("is-open")));
siteNav.addEventListener("click", (e) => { if (e.target.closest("a")) setNav(false); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && siteNav.classList.contains("is-open")) { setNav(false); navToggle.focus(); }
});

/* ====== Vehicle image fallback ======
   If images/ertiga.png is missing or fails, show a simple built-in car illustration. */
const CAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 300">
  <ellipse cx="320" cy="262" rx="270" ry="14" fill="rgba(0,0,0,.18)"/>
  <path d="M50 214 V176 Q52 152 86 146 L188 126 Q214 92 258 88 H424 Q474 94 508 140 L568 150 Q596 158 596 186 V214 Z" fill="#E3E8EF" stroke="#9AA6B6" stroke-width="3"/>
  <path d="M222 136 L246 104 H332 V136 Z" fill="#1D3557"/>
  <path d="M344 104 H420 Q454 108 478 136 H344 Z" fill="#1D3557"/>
  <rect x="338" y="104" width="4" height="34" fill="#9AA6B6"/>
  <rect x="566" y="166" width="26" height="12" rx="4" fill="#F28A1E"/>
  <rect x="54" y="170" width="20" height="12" rx="4" fill="#C62828"/>
  <path d="M76 198 H580" stroke="#9AA6B6" stroke-width="2"/>
  <circle cx="170" cy="214" r="38" fill="#1B1F27"/><circle cx="170" cy="214" r="17" fill="#C9D1DC"/>
  <circle cx="470" cy="214" r="38" fill="#1B1F27"/><circle cx="470" cy="214" r="17" fill="#C9D1DC"/>
  <text x="320" y="292" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#6B7788">Illustration. Add your own photo as images/ertiga.png</text>
</svg>`;
const CAR_FALLBACK = "data:image/svg+xml;utf8," + encodeURIComponent(CAR_SVG);

document.querySelectorAll('img[data-fallback="car"]').forEach((img) => {
  const useFallback = () => {
    if (img.dataset.failed) return;
    img.dataset.failed = "1";
    img.src = CAR_FALLBACK;
  };
  img.addEventListener("error", useFallback);
  // The error may already have happened before this script ran
  if (img.complete && img.naturalWidth === 0) useFallback();
});

/* ====== Booking form ====== */
const form = document.getElementById("booking-form");
const statusEl = document.getElementById("form-status");
const journey = document.getElementById("journey");
const pickupDate = document.getElementById("pickupDate");
const returnDate = document.getElementById("returnDate");
const returnField = document.getElementById("returnField");

/* Today's date in the user's local time (not UTC) as YYYY-MM-DD */
function todayLocal() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

pickupDate.min = todayLocal();
returnDate.min = todayLocal();

pickupDate.addEventListener("change", () => {
  returnDate.min = pickupDate.value || todayLocal();
  if (returnDate.value && returnDate.value < returnDate.min) returnDate.value = "";
});

/* Show the return date only for Round Trip */
function updateReturnField() {
  const isRound = journey.value === "Round Trip";
  returnField.hidden = !isRound;
  returnDate.required = isRound;
  if (!isRound) { returnDate.value = ""; setError(returnDate, ""); }
}
journey.addEventListener("change", updateReturnField);
updateReturnField();

/* ---- Validation helpers ---- */
function setError(input, message) {
  const el = document.getElementById(`${input.id}-error`);
  if (el) el.textContent = message;
  if (message) input.setAttribute("aria-invalid", "true");
  else input.removeAttribute("aria-invalid");
}

/* Accepts 10-digit Indian mobile numbers, optionally with +91, 91 or 0 in front */
function cleanMobile(value) {
  let digits = value.replace(/[\s\-().]/g, "");
  digits = digits.replace(/^\+?91(?=\d{10}$)/, "").replace(/^0(?=\d{10}$)/, "");
  return digits;
}

function validate() {
  let firstInvalid = null;
  const fail = (input, msg) => { setError(input, msg); if (!firstInvalid) firstInvalid = input; };
  const f = form.elements;

  [f.name, f.mobile, f.pickup, f.destination, f.journey, f.pickupDate, f.pickupTime, f.passengers, f.returnDate]
    .forEach((i) => setError(i, ""));

  if (f.name.value.trim().length < 2) fail(f.name, "Enter your full name.");

  if (!/^[6-9]\d{9}$/.test(cleanMobile(f.mobile.value))) fail(f.mobile, "Enter a valid 10-digit mobile number.");

  if (!f.pickup.value.trim()) fail(f.pickup, "Enter the pickup location.");
  if (!f.destination.value.trim()) fail(f.destination, "Enter the destination.");
  if (!f.journey.value) fail(f.journey, "Select a journey type.");

  if (!f.pickupDate.value) fail(f.pickupDate, "Select a pickup date.");
  else if (f.pickupDate.value < todayLocal()) fail(f.pickupDate, "Pickup date cannot be in the past.");

  if (!f.pickupTime.value) fail(f.pickupTime, "Select a pickup time.");
  else if (f.pickupDate.value === todayLocal()) {
    const now = new Date();
    const [h, m] = f.pickupTime.value.split(":").map(Number);
    if (h * 60 + m < now.getHours() * 60 + now.getMinutes()) fail(f.pickupTime, "This time has already passed today.");
  }

  const pax = Number(f.passengers.value);
  if (!Number.isInteger(pax) || pax < 1 || pax > 7) fail(f.passengers, "Enter 1 to 7 passengers.");

  if (f.journey.value === "Round Trip") {
    if (!f.returnDate.value) fail(f.returnDate, "Select a return date.");
    else if (f.pickupDate.value && f.returnDate.value < f.pickupDate.value) fail(f.returnDate, "Return date must be on or after pickup.");
  }

  if (firstInvalid) firstInvalid.focus();
  return !firstInvalid;
}

/* ---- Message formatting ---- */
function formatDate(iso) {            // 2026-10-25 -> 25-10-2026
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}
function formatTime(hhmm) {           // 14:30 -> 02:30 PM
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${String(h % 12 || 12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
}

function buildMessage() {
  const f = form.elements;
  const lines = [
    `NEW BOOKING REQUEST \u2014 ${COMPANY_NAME}`,
    "",
    `Customer Name: ${f.name.value.trim()}`,
    `Customer Mobile: ${cleanMobile(f.mobile.value)}`,
    `Pickup Location: ${f.pickup.value.trim()}`,
    `Destination: ${f.destination.value.trim()}`,
    `Journey Type: ${f.journey.value}`,
    `Pickup Date: ${formatDate(f.pickupDate.value)}`,
  ];
  if (f.journey.value === "Round Trip") lines.push(`Return Date: ${formatDate(f.returnDate.value)}`);
  lines.push(
    `Pickup Time: ${formatTime(f.pickupTime.value)}`,
    `Passengers: ${f.passengers.value}`,
    `Additional Requirements: ${f.notes.value.trim() || "None"}`,
    "",
    "Please confirm availability and provide the fare."
  );
  return lines.join("\n");
}

/* ---- Submit: build the message and open WhatsApp. Nothing is sent to any server. ---- */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  statusEl.classList.remove("is-error");
  statusEl.textContent = "";

  if (!validate()) {
    statusEl.classList.add("is-error");
    statusEl.textContent = "Please fix the highlighted fields and try again.";
    return;
  }

  const url = `https://wa.me/${COMPANY_WHATSAPP}?text=${encodeURIComponent(buildMessage())}`;
  const win = window.open(url, "_blank", "noopener,noreferrer");

  if (win) {
    statusEl.textContent = "WhatsApp is opening with your booking details. Please press Send in WhatsApp. Your booking is confirmed only after the company replies.";
  } else {
    // Pop-up blocked: continue in the same tab
    statusEl.textContent = "Opening WhatsApp. Please press Send there. Your booking is confirmed only after the company replies.";
    window.location.href = url;
  }
});

/* Clear a field's error as soon as the customer edits it */
form.addEventListener("input", (e) => { if (e.target.id) setError(e.target, ""); });
