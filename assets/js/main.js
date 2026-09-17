/* ==========================================================================
   MARYNET — Script commun : navigation, langue FR/WO, animations, toasts
   ========================================================================== */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---- Menu mobile ---- */
  var burger = document.querySelector(".burger");
  var links = document.querySelector(".nav-links");
  if (burger && links) {
    burger.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---- Page courante ---- */
  var here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page");
  });

  /* ---- Langue FR / Wolof (textes clés) ---- */
  var WO = {
    "nav.reseau": "Réseau bi",
    "nav.familles": "Njaboot",
    "nav.pros": "Liggéeykat",
    "nav.entreprises": "Entreprise",
    "nav.institutions": "Institutions",
    "nav.simulateur": "Xayma",
    "cta.rejoindre": "Bokk ci",
    "cta.trouver": "Wut ku ma dimbali",
    "cta.proposer": "Jox sama liggéey",
    "hero.title": "Kër gi, ci <em>jàmm</em>.",
    "hero.lead": "MARYNET dafay boole njaboot yi, liggéeykat yi, entreprise yi ak institutions yi ci benn réseau bu wóor : liggéey bu baax, xaalis bu wóor, kóllëre.",
    "foot.tag": "Kër gi, ci jàmm."
  };
  var FR = {};
  var toggle = document.querySelector(".lang-toggle");
  function applyLang(lang) {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (lang === "wo") {
        if (!FR[key]) FR[key] = el.innerHTML;
        if (WO[key]) el.innerHTML = WO[key];
      } else if (FR[key]) {
        el.innerHTML = FR[key];
      }
    });
    document.documentElement.lang = lang === "wo" ? "wo" : "fr";
    if (toggle) toggle.querySelectorAll("button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false");
    });
    try { localStorage.setItem("marynet.lang", lang); } catch (e) {}
  }
  if (toggle) {
    toggle.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (b) applyLang(b.dataset.lang);
    });
    var saved = null;
    try { saved = localStorage.getItem("marynet.lang"); } catch (e) {}
    if (saved === "wo") applyLang("wo");
  }

  /* ---- Apparition au défilement ---- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12 }) : null;
  document.querySelectorAll(".reveal").forEach(function (el) { io ? io.observe(el) : el.classList.add("in"); });
  setTimeout(function () { document.querySelectorAll(".reveal:not(.in)").forEach(function (el) { el.classList.add("in"); }); }, 2500);

  /* ---- Toast ---- */
  var toastEl = document.createElement("div");
  toastEl.className = "toast"; toastEl.setAttribute("role", "status");
  document.body.appendChild(toastEl);
  var toastTimer;
  window.MARYNET = window.MARYNET || {};
  MARYNET.toast = function (msg) {
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2800);
  };

  /* ---- Formulaires de démonstration ---- */
  document.querySelectorAll("form[data-demo]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      MARYNET.toast(f.getAttribute("data-demo") || "Merci ! Nous revenons vers vous très vite.");
      f.reset();
    });
  });

  /* ---- Année ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
