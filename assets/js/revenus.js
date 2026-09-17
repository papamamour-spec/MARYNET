/* MARYNET — Simulateur de revenus de la plateforme */
(function () {
  "use strict";
  var M = window.MARYNET, f = document.getElementById("rev"); if (!f) return;
  var fmt = function (n) { return n >= 1e9 ? (n / 1e9).toFixed(2).replace(".", ",") + " Md F" : n >= 1e6 ? (n / 1e6).toFixed(1).replace(".", ",") + " M F" : M.fcfa(n); };
  function run() {
    var perm = +f.perm.value, nouveaux = +f.nouveaux.value, heures = +f.heures.value, b2b = +f.b2b.value, dia = +f.dia.value, ag = +f.ag.value;
    ["perm", "new", "h", "b2b", "dia", "ag"].forEach(function (k, i) { document.getElementById("o-" + k).textContent = [perm, nouveaux, heures, b2b, dia, ag][i].toLocaleString("fr-FR"); });
    var lines = [
      ["Sérénité (9 500 F × contrats actifs)", perm * 9500, perm * 95000],
      ["Frais de placement (50 % du 1er salaire × nouveaux)", nouveaux * 47500, 0],
      ["Commission à l'heure (10 % × heures × 1 900 F)", heures * 1900 * 0.10, heures * 1900],
      ["Contrats cadre B2B (10 % × 3 M F × entreprises)", b2b * 3000000 * 0.10, b2b * 3000000],
      ["Sama Kër (3 % × 150 000 F × foyers)", dia * 150000 * 0.03, dia * 150000],
      ["Agences (6 % × 2 M F + 25 000 F licence)", ag * (2000000 * 0.06 + 25000), ag * 2000000]
    ];
    var total = 0, gmv = 0;
    lines.forEach(function (l) { total += l[1]; gmv += l[2]; });
    document.getElementById("rev-total").textContent = fmt(total) + " / mois";
    document.getElementById("rev-gmv").textContent = fmt(gmv);
    document.getElementById("rev-break").innerHTML = lines.map(function (l) { return '<li><span>' + l[0] + '</span><span>' + fmt(l[1]) + '</span></li>'; }).join("") + '<li><span>Total mensuel · ' + fmt(total * 12) + ' par an</span><span>' + fmt(total) + '</span></li>';
    var rec = lines[0][1] + lines[3][1] + lines[4][1] + lines[5][1];
    document.getElementById("rev-note").innerHTML = "<strong>" + Math.round(rec / Math.max(1, total) * 100) + " % de revenus récurrents</strong> (Sérénité, B2B, diaspora, agences). Prise moyenne sur le volume traité : <strong>" + (total / Math.max(1, gmv) * 100).toFixed(1).replace(".", ",") + " %</strong>.";
  }
  f.addEventListener("input", run); run();
})();
