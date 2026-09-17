/* MARYNET — Page profil (professionnel·le, famille, entreprise, institution, agence, diaspora) */
(function () {
  "use strict";
  var M = window.MARYNET;
  var id = new URLSearchParams(location.search).get("id") || "awa-ndiaye";
  var p = M.profile(id) || M.PROFILES[0];
  var role = M.ROLES[p.role];
  var root = document.getElementById("profil-root");
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  document.title = p.name + " · MARYNET";

  var isPro = p.role === "pro";
  var level = p.score >= 92 ? ["platine", "Platine"] : p.score >= 80 ? ["or", "Or"] : p.score >= 60 ? ["argent", "Argent"] : ["bronze", "Bronze"];
  /* Décomposition de l'indice, dérivée de façon stable du score global */
  var crit = isPro
    ? [["Identité & vérifications", 20], ["Fiabilité", 25], ["Qualité (avis)", 25], ["Expérience & formation", 15], ["Engagement social", 15]]
    : [["Identité & paiement vérifiés", 20], ["Paiement à l'heure", 30], ["Respect & conditions (avis des pros)", 25], ["Clarté & annulations", 15], ["Fidélité & communauté", 10]];
  var rest = p.score, rows = crit.map(function (c, i) {
    var v = i === crit.length - 1 ? Math.min(c[1], rest) : Math.min(c[1], Math.round(c[1] * p.score / 100 + (i % 2 ? 1 : 0)));
    rest -= v; return [c[0], v, c[1]];
  });

  var services = (p.services || []).map(function (s) { return M.SERVICES.find(function (x) { return x.id === s; }); }).filter(Boolean);
  var days = ["L", "M", "M", "J", "V", "S", "D"];
  var availOn = isPro ? (p.dispo.indexOf("7j") !== -1 ? [1,1,1,1,1,1,1] : p.dispo.indexOf("Lun–Sam") !== -1 ? [1,1,1,1,1,1,0] : [1,1,1,1,1,0,0]) : null;

  root.innerHTML =
    '<div class="cover ' + (role.color === "teal" ? "" : role.color) + '"></div>' +
    '<div class="profile-head">' +
      '<div class="avatar ' + p.color + '">' + p.initials + '</div>' +
      '<div>' +
        '<h1 style="font-size:1.9rem;margin:8px 0 2px">' + esc(p.name) + '</h1>' +
        '<div class="pill-row"><span class="badge ' + role.color + '">' + role.emoji + ' ' + role.label + '</span>' + (p.verified ? '<span class="badge">✓ Identité vérifiée</span>' : '') + (p.certified ? '<span class="badge gold">🎓 Certifié·e MARYNET</span>' : '') + '<span class="badge grey">📍 ' + esc(p.quartier) + '</span></div>' +
        '<p class="muted" style="margin:8px 0 0">' + esc(p.title) + '</p>' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        (isPro ? '<a class="btn btn-primary" href="simulateur.html">Réserver / proposer un contrat</a>' : '<a class="btn btn-primary" href="reseau.html">Répondre à ses besoins</a>') +
        '<a class="btn btn-outline" href="espace.html">💬 Message</a>' +
      '</div>' +
    '</div>' +
    '<div class="profile-grid">' +
      '<div style="display:grid;gap:18px">' +
        '<div class="card"><h3>À propos</h3><p>' + esc(p.bio) + '</p>' +
          (p.langs ? '<p class="small muted">Langues : ' + p.langs.join(", ") + '</p>' : '') +
          (isPro ? '<div class="kpis"><div class="kpi"><strong>' + p.missions + '</strong><span>missions accomplies</span></div><div class="kpi"><strong>' + (p.reviews || []).length + '</strong><span>avis vérifiés</span></div><div class="kpi"><strong>98 %</strong><span>ponctualité (pointage)</span></div></div>' :
            '<div class="kpis"><div class="kpi"><strong>100 %</strong><span>paiements à l\'heure</span></div><div class="kpi"><strong>4,8</strong><span>note donnée par les pros</span></div><div class="kpi"><strong>0</strong><span>litige</span></div></div>') +
        '</div>' +
        (isPro ? '<div class="card"><h3>Services & tarifs</h3><div class="grid grid-2">' + services.map(function (s) { return '<div style="display:flex;gap:10px;align-items:center;padding:10px;background:var(--sand);border-radius:12px"><span style="font-size:1.5rem">' + s.emoji + '</span><div><strong>' + s.label + '</strong><div class="small muted">' + M.fcfa(p.rate) + '/h · ' + M.fcfa(p.monthly) + '/mois plein temps</div></div></div>'; }).join("") + '</div><p class="small muted" style="margin:12px 0 0">Formules acceptées : Permanent · À l\'heure · Partagé · Abonnement</p></div>' : '') +
        '<div class="card"><h3>Avis' + (isPro ? " des familles et entreprises" : " des professionnel·les") + '</h3>' +
          ((p.reviews && p.reviews.length) ? p.reviews.map(function (r) { return '<div class="review"><div class="stars">' + "★".repeat(r.stars) + "☆".repeat(5 - r.stars) + '</div>' + esc(r.text) + '<div class="by">' + esc(r.by) + '</div></div>'; }).join("") :
            '<div class="review"><div class="stars">★★★★★</div>Employeur respectueux, paiement toujours à l\'heure, horaires clairs.<div class="by">Professionnel·le vérifié·e · avis anonymisé</div></div><div class="review"><div class="stars">★★★★☆</div>Bonne communication, un léger retard de paiement une fois, corrigé le lendemain.<div class="by">Professionnel·le vérifié·e · avis anonymisé</div></div>') +
        '</div>' +
      '</div>' +
      '<div style="display:grid;gap:18px">' +
        '<div class="card"><h3>Indice Kóllëre</h3><div style="display:flex;gap:16px;align-items:center;margin-bottom:14px"><div class="score-ring ' + (isPro ? "" : "gold") + '" style="--v:' + p.score + '"><strong>' + p.score + '</strong></div><div><span class="level ' + level[0] + '">' + level[1] + '</span><p class="small muted" style="margin:6px 0 0">' + (isPro ? "Score professionnel·le" : "Score client") + ' · mis à jour après chaque mission</p></div></div>' +
          '<div class="score-rows">' + rows.map(function (r) { return '<div class="score-row"><div>' + r[0] + '<div class="score-bar"><i style="width:' + (r[1] / r[2] * 100) + '%"></i></div></div><b>' + r[1] + '/' + r[2] + '</b></div>'; }).join("") + '</div>' +
          '<a class="small" href="scoring.html" style="display:inline-block;margin-top:12px">Comment est calculé l\'indice ? →</a></div>' +
        (isPro ? '<div class="card"><h3>Disponibilités</h3><p class="small muted">' + esc(p.dispo) + '</p><div class="avail">' + days.map(function (d, i) { return '<div class="' + (availOn[i] ? "on" : "") + '">' + d + '</div>'; }).join("") + '</div></div>' +
          '<div class="card"><h3>Passeport de compétences</h3><ul class="list-check small"><li>Formation d\'accueil MARYNET (2 jours)</li><li>Hygiène & sécurité domestique</li>' + (p.services.indexOf("nounou") !== -1 ? '<li>Premiers secours pédiatriques</li>' : p.services.indexOf("gardien") !== -1 ? '<li>Premiers secours & sécurité</li>' : '<li>Cuisine & conservation des aliments</li>') + '<li>IPRES / CSS : cotisations à jour</li></ul><p class="small muted" style="margin:10px 0 0">Portable : QR code vérifiable par tout employeur, même hors MARYNET.</p></div>'
        : '<div class="card"><h3>Ce que ' + (p.role === "famille" ? "cette famille" : "cette organisation") + ' recherche</h3><ul class="list-check small"><li>' + (p.role === "entreprise" ? "Équipes d'entretien formées (module Équipes)" : p.role === "institution" ? "Partenaires de formation et données d'impact" : p.role === "agence" ? "Professionnel·les à placer, familles et entreprises clientes" : "Aide fiable, ménage et garde d'enfants") + '</li><li>Paiement via Wave, Orange Money, carte</li><li>Contrats conformes générés par MARYNET</li></ul></div>') +
      '</div>' +
    '</div>' +
    '<p class="small muted" style="margin-top:20px">Voir d\'autres profils : ' + M.PROFILES.filter(function (x) { return x.id !== p.id; }).map(function (x) { return '<a href="profil.html?id=' + x.id + '">' + esc(x.name) + '</a>'; }).join(" · ") + '</p>';
})();
