/* ============================================================
   EDIT THIS BLOCK FIRST
   ============================================================ */
const CONFIG = {
  businessName: "A.B Banquet Hall",
  phone: "+919999999999",          // <-- replace with the hall's real number (with country code)
  whatsapp: "919999999999",        // <-- digits only, country code first, no + or spaces
  email: "",                       // <-- optional, e.g. "info@abbanquet.in"
  pricePerPlate: 500,              // starting veg rate (per listing sites; confirm with owner)
  maxGuests: 450,

  // Dates already booked. Format YYYY-MM-DD. Update this list as bookings come in.
  bookedDates: [
    // "2026-11-22", "2026-12-06"
  ],

  mapsShortLink: "https://maps.app.goo.gl/QsyKicgTjJNgYD2p8",
  lat: 17.3529244, lng: 78.4218211,

  // Photos and videos exported from the hall's Google Maps listing.
  // Save them into /images and /videos with these names (or change the names below).
  media: [
    { type: "image", src: "images/gallery-1.jpg", alt: "Main hall" },
    { type: "image", src: "images/gallery-2.jpg", alt: "Stage setup" },
    { type: "image", src: "images/gallery-3.jpg", alt: "Seating arrangement" },
    { type: "video", src: "videos/tour-1.mp4", poster: "images/gallery-4.jpg", alt: "Hall tour" },
    { type: "image", src: "images/gallery-5.jpg", alt: "Decor" },
    { type: "image", src: "images/gallery-6.jpg", alt: "Entrance" },
    { type: "image", src: "images/gallery-7.jpg", alt: "Dining area" },
    { type: "image", src: "images/gallery-8.jpg", alt: "Evening lighting" }
  ]
};
/* ============================================================ */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const telHref = "tel:" + CONFIG.phone.replace(/[^\d+]/g, "");
const waBase = "https://wa.me/" + CONFIG.whatsapp.replace(/\D/g, "");
const waLink = (text) => waBase + (text ? "?text=" + encodeURIComponent(text) : "");
const todayISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const prettyDate = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const inr = (n) => "₹" + n.toLocaleString("en-IN");

/* ---------- Wire up contact links ---------- */
$$("[data-call]").forEach(a => a.href = telHref);
$$("[data-wa]").forEach(a => a.href = waLink(`Hi ${CONFIG.businessName}, I'd like to enquire about booking the hall.`));
$$("[data-phone-text]").forEach(el => el.textContent = CONFIG.phone.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2"));
if (CONFIG.email) {
  $("#mailRow").href = "mailto:" + CONFIG.email;
  $("[data-email-text]").textContent = CONFIG.email;
} else { $("#mailRow").remove(); $('[data-send="mail"]').remove(); }
$("#mapsPhotos").href = CONFIG.mapsShortLink;
$("#reviewBtn").href = CONFIG.mapsShortLink;
$("#dirBtn").href = `https://www.google.com/maps/dir/?api=1&destination=${CONFIG.lat},${CONFIG.lng}`;
$("#yr").textContent = new Date().getFullYear();

/* ---------- Nav ---------- */
const nav = $("#nav"), menu = $("#menu"), toggle = $("#navToggle");
const onScroll = () => nav.classList.toggle("solid", window.scrollY > 40);
onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
toggle.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
  nav.classList.toggle("menu-open", open);
});
$$("#menu a").forEach(a => a.addEventListener("click", () => {
  menu.classList.remove("open"); toggle.setAttribute("aria-expanded", false); nav.classList.remove("menu-open");
}));

/* ---------- Hero image: only use if it exists, else the gradient stays ---------- */
(() => { const t = new Image(); t.onerror = () => { $("#heroBg").style.backgroundImage =
  "linear-gradient(180deg,rgba(14,59,63,.4),rgba(10,40,43,.95)),radial-gradient(circle at 80% 20%,#1e6e73,#0E3B3F 60%)"; };
  t.src = "images/hero.jpg"; })();

/* ---------- Availability ---------- */
const isBooked = (iso) => CONFIG.bookedDates.includes(iso);
const checkDate = $("#checkDate"), checkResult = $("#checkResult"), checkBook = $("#checkBook");
const dateInput = $("#date");
[checkDate, dateInput].forEach(i => i.min = todayISO());

checkDate.addEventListener("change", () => {
  const v = checkDate.value;
  checkResult.className = "check-result";
  if (!v) { checkResult.textContent = "Choose a date to see availability."; checkBook.hidden = true; return; }
  if (v < todayISO()) { checkResult.textContent = "That date has passed. Pick a future date."; checkResult.classList.add("no"); checkBook.hidden = true; return; }
  if (isBooked(v)) {
    checkResult.textContent = `${prettyDate(v)} is already booked. Try another date.`; checkResult.classList.add("no"); checkBook.hidden = true;
  } else {
    checkResult.textContent = `${prettyDate(v)} looks free. Send an enquiry to hold it.`; checkResult.classList.add("ok"); checkBook.hidden = false;
  }
});
checkBook.addEventListener("click", () => { dateInput.value = checkDate.value; });

/* ---------- Event cards prefill the form ---------- */
$$(".event").forEach(b => b.addEventListener("click", () => {
  $("#eventType").value = b.dataset.event;
  $("#book").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => $("#name").focus({ preventScroll: true }), 600);
}));

/* ---------- Estimator ---------- */
const estG = $("#estGuests"), estGV = $("#estGuestsVal"), estT = $("#estTotal"), estWA = $("[data-wa-estimate]");
estG.max = CONFIG.maxGuests;
const updateEst = () => {
  const g = +estG.value;
  estGV.textContent = g; estT.textContent = inr(g * CONFIG.pricePerPlate);
  estWA.href = waLink(`Hi ${CONFIG.businessName}, I'm planning for about ${g} guests. Please share the exact quote for food and hall rental.`);
};
estG.addEventListener("input", updateEst); updateEst();

/* ---------- Gallery + lightbox ---------- */
const grid = $("#galleryGrid");
CONFIG.media.forEach((m, i) => {
  const b = document.createElement("button");
  b.className = "g-item"; b.type = "button"; b.setAttribute("aria-label", "Open " + (m.alt || "media"));
  const ph = document.createElement("div"); ph.className = "g-ph"; ph.textContent = "Add " + m.src;
  b.appendChild(ph);
  if (m.type === "image") {
    const img = new Image(); img.loading = "lazy"; img.alt = m.alt || ""; img.src = m.src;
    img.onload = () => { ph.remove(); b.prepend(img); };
  } else {
    const t = new Image(); t.alt = m.alt || ""; t.src = m.poster || "";
    t.onload = () => { ph.remove(); b.prepend(t); };
    const p = document.createElement("div"); p.className = "play"; p.innerHTML = "<i>&#9654;</i>"; b.appendChild(p);
  }
  b.addEventListener("click", () => openLB(i));
  grid.appendChild(b);
});

const lb = $("#lightbox"), stage = $("#lbStage"); let cur = 0;
function showLB() {
  const m = CONFIG.media[cur]; stage.innerHTML = "";
  let el;
  if (m.type === "video") { el = document.createElement("video"); el.src = m.src; el.controls = true; el.autoplay = true; el.playsInline = true; }
  else { el = new Image(); el.src = m.src; el.alt = m.alt || ""; }
  el.onerror = () => { stage.innerHTML = `<p style="color:#fff;padding:24px">File not found: ${m.src}</p>`; };
  stage.appendChild(el);
}
function openLB(i) { cur = i; showLB(); lb.hidden = false; document.body.style.overflow = "hidden"; $("#lbClose").focus(); }
function closeLB() { lb.hidden = true; stage.innerHTML = ""; document.body.style.overflow = ""; }
const step = (d) => { cur = (cur + d + CONFIG.media.length) % CONFIG.media.length; showLB(); };
$("#lbClose").onclick = closeLB; $("#lbPrev").onclick = () => step(-1); $("#lbNext").onclick = () => step(1);
lb.addEventListener("click", e => { if (e.target === lb) closeLB(); });
document.addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeLB(); if (e.key === "ArrowLeft") step(-1); if (e.key === "ArrowRight") step(1);
});
let tx = 0;
lb.addEventListener("touchstart", e => tx = e.touches[0].clientX, { passive: true });
lb.addEventListener("touchend", e => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 60) step(dx < 0 ? 1 : -1); });

/* ---------- Booking form ---------- */
const form = $("#bookingForm"), note = $("#formNote");
let sendMode = "wa";
$$("[data-send]").forEach(b => b.addEventListener("click", () => sendMode = b.dataset.send));

const rules = {
  name: v => v.trim().length >= 2 || "Enter your name.",
  phone: v => /^(\+?91)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, "")) || "Enter a valid 10-digit Indian mobile number.",
  eventType: v => !!v || "Select an event type.",
  date: v => !v ? "Select an event date." : v < todayISO() ? "Pick a future date." : isBooked(v) ? "That date is booked. Please choose another." : true,
  slot: v => !!v || "Select a time slot.",
  guests: v => (+v >= 10 && +v <= CONFIG.maxGuests) || `Enter between 10 and ${CONFIG.maxGuests} guests.`
};
function validateField(name) {
  const el = form.elements[name], res = rules[name](el.value);
  const box = el.closest(".field"), msg = $(`.err[data-for="${name}"]`);
  box.classList.toggle("invalid", res !== true); msg.textContent = res === true ? "" : res;
  return res === true;
}
Object.keys(rules).forEach(n => form.elements[n].addEventListener("blur", () => validateField(n)));
dateInput.addEventListener("change", () => validateField("date"));

form.addEventListener("submit", e => {
  e.preventDefault();
  const ok = Object.keys(rules).map(validateField).every(Boolean);
  if (!ok) { note.textContent = "Please fix the highlighted fields."; $(".invalid input, .invalid select")?.focus(); return; }
  const d = Object.fromEntries(new FormData(form));
  const msg =
`New booking enquiry for ${CONFIG.businessName}

Name: ${d.name}
Phone: ${d.phone}
Event: ${d.eventType}
Date: ${prettyDate(d.date)}
Time slot: ${d.slot}
Guests: ${d.guests}
Catering: ${d.catering}
Decoration: ${d.decor}${d.notes.trim() ? "\nNotes: " + d.notes.trim() : ""}

Please confirm availability and share the quote.`;

  if (sendMode === "wa") {
    note.textContent = "Opening WhatsApp with your details...";
    window.open(waLink(msg), "_blank", "noopener");
  } else if (sendMode === "mail" && CONFIG.email) {
    note.textContent = "Opening your email app...";
    location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Booking enquiry: " + d.eventType + ", " + prettyDate(d.date))}&body=${encodeURIComponent(msg)}`;
  } else {
    note.textContent = "Dialling the hall. Mention the date " + prettyDate(d.date) + " when you speak to us.";
    location.href = telHref;
  }
});
