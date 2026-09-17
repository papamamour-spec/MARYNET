/* MARYNET — MaryMatch : moteur de compatibilité de démonstration */
(function () {
  "use strict";
  var M = window.MARYNET;
  var form = document.getElementById("match-form"); if (!form) return;
  var q = document.getElementById("m-quartier");
  M.QUARTIERS.forEach(function (x) { var o = document.createElement("option"); o.value = x; o.textContent = x; q.appendChild(o); });
  var IDX = { "Almadies": 0, "Ngor": 0, "Yoff": 0, "Ouakam": 1, "Mermoz": 2, "Sacré-Cœur": 2, "Point E": 2, "Plateau": 3, "Pikine": 5, "Guédiawaye": 5, "Parcelles Assainies": 4 };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var besoin = form.besoin.value, quartier = form.quartier.value, rythme = form.rythme.value;
    var prios = Array.prototype.slice.call(form.querySelectorAll("input[name=prio]:checked")).map(function (i) { return i.value; });
    var scored = M.PROFILES.filter(function (p) { return p.role === "pro"; }).map(function (p) {
      var s = 40;
      if (p.services.indexOf(besoin) !== -1) s += 30; else if (besoin === "senior" && p.services.indexOf("menage") !== -1) s += 15;
      var d = Math.abs((IDX[quartier] === undefined ? 3 : IDX[quartier]) - (IDX[p.quartier] === undefined ? 3 : IDX[p.quartier]));
      s += Math.max(0, 15 - d * 5);
      if (rythme === "plein" && /plein|7j|Lun–Sam/.test(p.dispo)) s += 5;
      if (rythme !== "plein" && /matin|Équipe/.test(p.dispo)) s += 5;
      if (prios.indexOf("langue") !== -1 && p.langs.length >= 2) s += 3;
      if (prios.indexOf("certif") !== -1 && p.certified) s += 4;
      if (prios.indexOf("enfants") !== -1 && p.services.indexOf("nounou") !== -1) s += 4;
      if (prios.indexOf("budget") !== -1 && p.rate <= 1800) s += 4;
      s += Math.round((p.score - 85) / 4);
      return { p: p, s: Math.min(99, s) };
    }).sort(function (a, b) { return b.s - a.s; }).slice(0, 3);

    document.getElementById("match-results").innerHTML = '<div style="display:grid;gap:12px">' + scored.map(function (r) {
      var p = r.p;
      return '<div class="match-card"><div class="profile"><div class="avatar ' + p.color + '">' + p.initials + '</div><div style="flex:1"><div class="profile-name">' + esc(p.name) + (p.certified ? ' <span class="badge">✓ Certifiée</span>' : '') + '</div><div class="profile-meta">' + esc(p.title) + ' · ' + esc(p.quartier) + '</div></div><div class="match-pct">' + r.s + ' %</div></div>' +
        '<div class="score-bar"><i style="width:' + r.s + '%"></i></div>' +
        '<p class="small muted" style="margin:10px 0 0">Indice Kóllëre ' + p.score + ' · ' + M.fcfa(p.rate) + '/h · ' + esc(p.dispo) + '</p>' +
        '<div style="display:flex;gap:8px;margin-top:12px"><a class="btn btn-primary btn-sm" href="profil.html?id=' + p.id + '">Voir le profil</a><a class="btn btn-outline btn-sm" href="reseau.html">Contacter</a></div></div>';
    }).join("") + '<p class="small" style="color:rgba(255,255,255,.7);margin:6px 0 0">' + (rythme !== "plein" ? '💡 Besoin partiel : la <strong style="color:var(--gold)">formule Partagée</strong> avec des voisins de ' + esc(quartier) + ' réduirait votre coût de 40 à 60 %.' : '💡 Temps plein : la formule Permanent avec l\'abonnement Sérénité inclut la paie et le remplacement garanti.') + '</p></div>';
    M.toast("3 profils compatibles trouvés à proximité de " + quartier);
  });
})();
