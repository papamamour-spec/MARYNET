/* MARYNET — Back-office de démonstration : finances, grand livre, opérations */
(function () {
  "use strict";
  var M = window.MARYNET;
  var fmt = function (n) { return n >= 1e6 ? (n / 1e6).toFixed(2).replace(".", ",") + " M F" : M.fcfa(n); };
  var TX = [
    ["17/09 12:04", "TX-48213", "Mission à l'heure · 4 h", "Famille Diop → Awa Ndiaye", "Wave", 8000, 0.10, "Versé"],
    ["17/09 11:40", "TX-48212", "Urgence · 3 h", "Mme Sy → Khady N.", "Orange Money", 8100, 0.18, "Versé"],
    ["17/09 09:15", "TX-48210", "Facture B2B · septembre", "Teranga Résidences → 12 agent·es", "Virement", 4860000, 0.10, "Séquestre"],
    ["16/09 18:30", "TX-48197", "Sama Kër · 22 passages", "Fatou G. (Paris) → Awa D.", "Carte (EUR)", 176000, 0.03, "Versé"],
    ["16/09 15:02", "TX-48190", "Frais de placement · contrat permanent", "Famille Ba → MARYNET", "Wave", 60000, 1.00, "Encaissé"],
    ["16/09 15:02", "TX-48189", "Sérénité · septembre", "Famille Ba", "Wave", 9500, 1.00, "Encaissé"],
    ["16/09 10:10", "TX-48180", "Salaire mensuel · Partagé (3 foyers)", "Diop + Kane + Sarr → Awa Ndiaye", "Wave ×3", 123000, 0.00, "Programmé 30/09"],
    ["15/09 16:45", "TX-48171", "Flux agence · 12 placements", "Agence Kërsa", "Orange Money", 1340000, 0.06, "Versé"],
    ["15/09 09:00", "TX-48160", "Programme Liggéey Jàmm · tranche 3", "Commune de Ouakam", "Virement", 6000000, 0.06, "Encaissé"],
    ["14/09 14:20", "TX-48151", "Mission à l'heure · 5 h (pro Platine)", "M. Sarr → Mariama Sow", "Free Money", 13000, 0.07, "Versé"],
    ["14/09 11:05", "TX-48148", "Mutuelle santé · 38 adhésions", "Agence Kërsa → Mutuelle partenaire", "Prélèvement", 152000, 0.10, "Apport versé"],
    ["13/09 17:30", "TX-48130", "Litige · mission annulée tardivement", "Famille Ndoye → Rama F.", "Wave", 6000, 0.10, "Remboursé 50 %"]
  ];
  var STREAMS = [["Commissions à l'heure & urgence", 3.9e6, "gold"], ["Frais de placement", 5.7e6, "teal"], ["Sérénité (récurrent)", 7.6e6, "teal"], ["Contrats cadre B2B", 6.2e6, "indigo"], ["Sama Kër diaspora", 1.4e6, "gold"], ["Agences (commission + licence)", 1.9e6, "indigo"], ["Programmes institutionnels", 2.1e6, "terra"], ["Apports partenaires", 0.6e6, "teal"]];
  var total = STREAMS.reduce(function (a, s) { return a + s[1]; }, 0), max = Math.max.apply(null, STREAMS.map(function (s) { return s[1]; }));
  function kpis(list) { return '<div class="kpis">' + list.map(function (k) { return '<div class="kpi"><strong>' + k[0] + '</strong><span>' + k[1] + '</span></div>'; }).join("") + '</div>'; }
  function table(head, rows) { return '<div class="table-wrap"><table class="table"><thead><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join("") + '</tr></thead><tbody>' + rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join("") + '</tr>'; }).join("") + '</tbody></table></div>'; }
  function status(s) { var c = /Versé|Encaissé|Apport/.test(s) ? "ok" : /Séquestre|Programmé/.test(s) ? "wait" : "alert"; return '<span class="status ' + c + '">' + s + '</span>'; }

  var P = {
    finance: kpis([["243,8 M F", "volume traité · septembre (GMV)"], ["29,4 M F", "revenu MARYNET · septembre"], ["12,1 %", "prise moyenne sur le volume"], ["61 %", "revenus récurrents"], ["18,2 M F", "en séquestre (à verser)"], ["0,4 %", "taux de litige"]]) +
      '<div class="grid grid-2" style="margin-top:18px"><div class="card"><h3>Revenus par source · septembre</h3><div class="score-rows">' + STREAMS.map(function (s) { return '<div class="score-row"><div><span class="dot ' + s[2] + '"></span>' + s[0] + '<div class="score-bar"><i style="width:' + (s[1] / max * 100) + '%"></i></div></div><b>' + fmt(s[1]) + '</b></div>'; }).join("") + '<div class="score-row"><div><strong>Total</strong></div><b>' + fmt(total) + '</b></div></div></div>' +
      '<div class="card"><h3>Règles de commission actives</h3>' + table(["Flux", "Taux", "Retenue"], [["Mission à l'heure", "10 % · 8 % (Or) · 7 % (Platine)", "À la source, sur séquestre"], ["Urgence", "+25 % client, dont 10 pts MARYNET", "À la source"], ["Placement permanent", "50 % du 1er salaire", "À la signature"], ["Sérénité", "9 500 F / mois (4 500 F Partagé)", "Avec le salaire"], ["Contrat cadre B2B", "12 % → 8 % (volume)", "Sur facture"], ["Diaspora", "3 %", "Sur paiement devise"], ["Agences", "6 % + 25 000 F / mois", "Sur flux + licence"], ["Programmes", "6 % du budget", "Par tranche"]]) + '<a class="btn btn-outline btn-sm" href="modele-economique.html" style="margin-top:12px">Modèle économique complet →</a></div></div>',
    ledger: '<div class="card"><h3>Grand livre · 12 dernières transactions</h3><p class="small muted">La colonne « Commission » est retenue automatiquement avant le versement au bénéficiaire. Taux 100 % = revenu MARYNET intégral (frais, abonnement).</p>' +
      table(["Date", "Réf.", "Type", "Parties", "Canal", "Montant", "Taux", "Commission", "Statut"], TX.map(function (t) { return [t[0], '<span class="kbd">' + t[1] + '</span>', t[2], t[3], t[4], M.fcfa(t[5]), Math.round(t[6] * 100) + " %", '<strong>' + M.fcfa(t[5] * t[6]) + '</strong>', status(t[7])]; })) +
      '<p class="small" style="margin:14px 0 0"><strong>Commissions sur ces 12 transactions : ' + M.fcfa(TX.reduce(function (a, t) { return a + t[5] * t[6]; }, 0)) + '</strong> sur ' + fmt(TX.reduce(function (a, t) { return a + t[5]; }, 0)) + ' traités.</p></div>' +
      '<div class="card" style="margin-top:16px"><h3>Rapprochement mobile money · aujourd\'hui</h3>' + table(["Canal", "Encaissé", "Versé", "Frais opérateur", "Écart"], [["Wave", "3 214 000 F", "2 786 300 F", "0 F", '<span class="status ok">0</span>'], ["Orange Money", "1 902 500 F", "1 640 100 F", "19 025 F", '<span class="status ok">0</span>'], ["Free Money", "412 000 F", "371 800 F", "4 120 F", '<span class="status ok">0</span>'], ["Carte (diaspora)", "1 176 000 F", "1 093 700 F", "32 900 F", '<span class="status wait">1 en attente</span>'], ["Virement B2B", "10 860 000 F", "—", "0 F", '<span class="status wait">séquestre</span>']]) + '</div>',
    ops: kpis([["27", "vérifications d'identité en attente"], ["3", "litiges ouverts (médiation < 24 h)"], ["1 214", "salaires programmés le 30"], ["14", "remplacements en cours"], ["96,2 %", "SLA remplacement < 48 h"], ["8", "profils suspendus (indice < 40)"]]) +
      '<div class="grid grid-2" style="margin-top:18px"><div class="card"><h3>File de vérification (KYC)</h3>' + table(["Personne", "Rôle", "Étape", "Action"], [["Rama Faye · Pikine", "Pro", "Références : 1/2 appelée", '<button class="btn btn-sm btn-primary" onclick="MARYNET.toast(\'Appel de référence programmé.\')">Appeler</button>'], ["Cabinet Diagne", "Entreprise", "NINEA à contrôler", '<button class="btn btn-sm btn-outline" onclick="MARYNET.toast(\'NINEA validé.\')">Valider</button>'], ["Oumar B. (Milan)", "Diaspora", "Carte 3-D Secure OK", '<button class="btn btn-sm btn-outline" onclick="MARYNET.toast(\'Compte activé.\')">Activer</button>']]) + '</div>' +
      '<div class="card"><h3>Litiges en médiation</h3>' + table(["Réf.", "Objet", "Montant", "Décision"], [["LT-311", "Annulation tardive par la famille", "6 000 F", "Remboursé 50 %, indice client −4"], ["LT-312", "Retard répété de la pro (pointage)", "—", "Avertissement, indice −6, formation"], ["LT-314", "Objet cassé, RC mission", "45 000 F", "Assurance saisie"]]) + '</div></div>' +
      '<div class="card" style="margin-top:16px"><h3>Paie du 30 · 1 214 salaires</h3><p class="small muted">Sérénité et cotisations prélevées sur les employeurs le 28 ; salaires nets versés le 30 à 08:00 via Wave (71 %), Orange Money (22 %), Free Money (7 %). Bulletins générés automatiquement.</p><button class="btn btn-primary" onclick="MARYNET.toast(\'Paie du 30 verrouillée : 1 214 virements programmés.\')">Verrouiller la paie</button></div>'
  };
  var panels = document.getElementById("bo-panels");
  function show(id) { panels.innerHTML = '<div class="panel" role="tabpanel">' + P[id] + '</div>'; document.querySelectorAll("#bo-tabs .tab").forEach(function (t) { t.setAttribute("aria-selected", t.dataset.tab === id ? "true" : "false"); }); }
  document.getElementById("bo-tabs").addEventListener("click", function (e) { var t = e.target.closest(".tab"); if (t) show(t.dataset.tab); });
  show(P[location.hash.slice(1)] ? location.hash.slice(1) : "finance");
})();
