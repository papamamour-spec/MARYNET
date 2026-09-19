/* MARYNET — Back-office : vue d'ensemble, reporting, transactions, opérations, paramétrage */
(function () {
  "use strict";
  var main = document.getElementById("main");
  var TYPES = { heure: "Mission à l'heure", urgence: "Urgence", placement: "Frais de placement", serenite: "Abonnement Sérénité", salaire: "Salaire mensuel", b2b: "Facture B2B", diaspora: "Sama Kër (diaspora)", agence: "Flux agence", programme: "Programme institutionnel", apport: "Apport partenaire" };
  var ACTEURS = { famille: "Familles", entreprise: "Entreprises", diaspora: "Diaspora", agence: "Agences", institution: "Institutions", partenaire: "Partenaires" };
  var MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  var settings = null, filters = { from: "", to: "", ville: "", type: "", acteur: "", canal: "", statut: "" };

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function F(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " F"; }
  function M(n) { return n >= 1e9 ? (n / 1e9).toFixed(2).replace(".", ",") + " Md F" : n >= 1e6 ? (n / 1e6).toFixed(1).replace(".", ",") + " M F" : F(n); }
  function pct(n) { return String(n).replace(".", ",") + " %"; }
  function mois(k) { var p = k.split("-"); return MOIS[+p[1] - 1] + " " + p[0].slice(2); }
  function qs(extra) { var o = Object.assign({}, filters, extra || {}); return Object.keys(o).filter(function (k) { return o[k]; }).map(function (k) { return k + "=" + encodeURIComponent(o[k]); }).join("&"); }
  async function api(path, opts) {
    var r = await fetch(path, Object.assign({ headers: { "Content-Type": "application/json" } }, opts || {}));
    if (r.status === 401) { location.href = "/admin-login"; throw new Error("401"); }
    var d = await r.json(); if (!r.ok) throw new Error(d.error || "Erreur"); return d;
  }
  var toastEl = document.createElement("div"); toastEl.className = "toast"; document.body.appendChild(toastEl); var tt;
  function toast(m) { toastEl.textContent = m; toastEl.classList.add("show"); clearTimeout(tt); tt = setTimeout(function () { toastEl.classList.remove("show"); }, 3000); }
  function status(s) { var c = /Versé|Encaissé|validé|résolu/.test(s) ? "ok" : /Séquestre|attente/.test(s) ? "wait" : "alert"; return '<span class="status ' + c + '">' + esc(s) + '</span>'; }

  /* ---------- Composants ---------- */
  function kpis(list) { return '<div class="kpis six">' + list.map(function (k) { return '<div class="kpi"><strong>' + k[0] + '</strong><span>' + k[1] + '</span>' + (k[2] ? '<div class="delta">' + k[2] + '</div>' : '') + '</div>'; }).join("") + '</div>'; }
  function barChart(rows, key, fmt, title) {
    var max = Math.max.apply(null, rows.map(function (r) { return r[key]; }).concat([1]));
    return '<div class="chart" data-fmt="' + key + '"><div class="bars">' + rows.map(function (r) {
      return '<div class="bar" tabindex="0" style="height:' + Math.max(1, r[key] / max * 100) + '%" data-tip="' + esc(r.label.indexOf("-") === 4 ? mois(r.cle) : r.label) + ' · ' + esc(fmt(r[key])) + ' · ' + r.nb + ' opérations"><span class="lbl">' + esc(r.label.indexOf("-") === 4 ? mois(r.cle) : r.label) + '</span></div>';
    }).join("") + '</div><div class="bars-space"></div><div class="tip"></div></div>';
  }
  function hbars(rows, key, fmt, labelFn) {
    rows = rows.filter(function (r) { return r[key] > 0; });
    var max = Math.max.apply(null, rows.map(function (r) { return r[key]; }).concat([1]));
    return rows.map(function (r) { return '<div class="hbar"><span title="' + esc(labelFn ? labelFn(r) : r.label) + '">' + esc(labelFn ? labelFn(r) : r.label) + '</span><div class="track"><i style="width:' + (r[key] / max * 100) + '%"></i></div><b>' + fmt(r[key]) + '</b></div>'; }).join("");
  }
  function table(head, rows) { return '<div class="table-wrap"><table class="table"><thead><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join("") + '</tr></thead><tbody>' + (rows.length ? rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join("") + '</tr>'; }).join("") : '<tr><td colspan="' + head.length + '" class="muted">Aucune donnée pour ces filtres.</td></tr>') + '</tbody></table></div>'; }
  function filterBar(withExport) {
    var villes = (settings ? settings.villes : []);
    var opt = function (obj, sel) { return '<option value="">Tous</option>' + Object.keys(obj).map(function (k) { return '<option value="' + k + '"' + (sel === k ? " selected" : "") + '>' + esc(obj[k]) + '</option>'; }).join(""); };
    return '<form class="filters" id="filters">' +
      '<div class="field"><label>Du</label><input type="date" name="from" value="' + filters.from + '"></div>' +
      '<div class="field"><label>Au</label><input type="date" name="to" value="' + filters.to + '"></div>' +
      '<div class="field"><label>Ville</label><select name="ville"><option value="">Toutes</option>' + villes.map(function (v) { return '<option' + (filters.ville === v ? " selected" : "") + '>' + esc(v) + '</option>'; }).join("") + '</select></div>' +
      '<div class="field"><label>Type de flux</label><select name="type">' + opt(TYPES, filters.type) + '</select></div>' +
      '<div class="field"><label>Acteur</label><select name="acteur">' + opt(ACTEURS, filters.acteur) + '</select></div>' +
      '<div class="field"><label>Canal</label><select name="canal">' + opt({ "Wave": "Wave", "Orange Money": "Orange Money", "Free Money": "Free Money", "Carte": "Carte", "Virement": "Virement", "Prélèvement": "Prélèvement" }, filters.canal) + '</select></div>' +
      '<div class="field"><label>Statut</label><select name="statut">' + opt({ "Versé": "Versé", "Encaissé": "Encaissé", "Séquestre": "Séquestre", "Litige": "Litige", "Remboursé": "Remboursé" }, filters.statut) + '</select></div>' +
      '<button class="btn btn-primary btn-sm" type="submit">Appliquer</button>' +
      '<button class="btn btn-outline btn-sm" type="button" data-preset="30">30 j</button><button class="btn btn-outline btn-sm" type="button" data-preset="90">90 j</button><button class="btn btn-outline btn-sm" type="button" data-preset="mois">Ce mois</button><button class="btn btn-outline btn-sm" type="button" data-preset="0">Tout</button>' +
      (withExport ? '<a class="btn btn-gold btn-sm" id="csv" href="/api/admin/report.csv?' + qs() + '" download>⬇ Export CSV</a>' : '') + '</form>';
  }
  function bindFilters(rerender) {
    var f = document.getElementById("filters"); if (!f) return;
    f.addEventListener("submit", function (e) { e.preventDefault(); ["from", "to", "ville", "type", "acteur", "canal", "statut"].forEach(function (k) { filters[k] = f.elements[k].value; }); rerender(); });
    f.querySelectorAll("[data-preset]").forEach(function (b) { b.addEventListener("click", function () {
      var p = b.dataset.preset, now = new Date(), iso = function (d) { return d.toISOString().slice(0, 10); };
      if (p === "0") { filters.from = ""; filters.to = ""; } else if (p === "mois") { filters.from = iso(new Date(now.getFullYear(), now.getMonth(), 2)); filters.to = iso(now); } else { filters.from = iso(new Date(now.getTime() - p * 86400000)); filters.to = iso(now); }
      rerender();
    }); });
  }
  function bindCharts() {
    document.querySelectorAll(".chart").forEach(function (c) {
      var tip = c.querySelector(".tip");
      c.addEventListener("mousemove", function (e) { var b = e.target.closest(".bar"); if (!b) { tip.style.display = "none"; return; } var r = c.getBoundingClientRect(), br = b.getBoundingClientRect(); tip.textContent = b.dataset.tip; tip.style.display = "block"; tip.style.left = (br.left - r.left + br.width / 2) + "px"; tip.style.top = (br.top - r.top) + "px"; });
      c.addEventListener("mouseleave", function () { tip.style.display = "none"; });
      c.querySelectorAll(".bar").forEach(function (b) { b.addEventListener("focus", function () { toast(b.dataset.tip); }); });
    });
  }

  /* ---------- Vues ---------- */
  var VIEWS = {
    apercu: async function () {
      var now = new Date(), iso = function (d) { return d.toISOString().slice(0, 10); };
      var cur = await api("/api/admin/report?from=" + iso(new Date(now.getTime() - 30 * 86400000)));
      var prev = await api("/api/admin/report?from=" + iso(new Date(now.getTime() - 60 * 86400000)) + "&to=" + iso(new Date(now.getTime() - 31 * 86400000)));
      var all = await api("/api/admin/report");
      var ops = await api("/api/admin/ops");
      var delta = function (a, b) { if (!b) return ""; var d = (a - b) / b * 100; return (d >= 0 ? "▲ +" : "▼ ") + d.toFixed(0) + " % vs 30 j précédents"; };
      var k = cur.kpis, alerts = [];
      var kycLate = ops.kyc.filter(function (x) { return x.statut === "en attente" && x.depuisHeures > settings.alertes.kycDelaiHeures; });
      var litOpen = ops.litiges.filter(function (x) { return x.statut === "ouvert"; });
      if (k.litigesPct > settings.alertes.litigeMaxPct) alerts.push(["🔴", "Taux de litige à " + pct(k.litigesPct) + " sur 30 jours, au-dessus du seuil de " + settings.alertes.litigeMaxPct + " % (paramétrable)."]);
      if (kycLate.length) alerts.push(["🟠", kycLate.length + " vérification(s) d'identité dépassent le délai de " + settings.alertes.kycDelaiHeures + " h."]);
      if (litOpen.length) alerts.push(["🟠", litOpen.length + " litige(s) ouvert(s) en médiation."]);
      if (k.sequestre > 0) alerts.push(["🟢", M(k.sequestre) + " en séquestre, à libérer après validation des missions."]);
      main.innerHTML = '<div class="adm-head"><div><h1>Vue d\'ensemble</h1><p class="muted small" style="margin:0">30 derniers jours · toutes villes · ' + new Date().toLocaleDateString("fr-FR") + '</p></div><a class="btn btn-outline btn-sm" href="#reporting">Reporting détaillé →</a></div>' +
        kpis([[M(k.gmv), "volume traité (GMV)", delta(k.gmv, prev.kpis.gmv)], [M(k.revenu), "revenu MARYNET", delta(k.revenu, prev.kpis.revenu)], [pct(k.prisePct), "prise moyenne"], [k.nb.toLocaleString("fr-FR"), "transactions", delta(k.nb, prev.kpis.nb)], [k.clientsActifs, "clients actifs"], [k.prosActifs, "pros payé·es"]]) +
        '<div class="panel-grid"><div class="box"><h3>Revenu mensuel MARYNET</h3><div class="sub">Commissions perçues, 6 derniers mois · survolez une barre</div>' + barChart(all.parMois, "revenu", M) + '</div>' +
        '<div class="box"><h3>Alertes &amp; à faire</h3><div class="sub">Seuils définis dans Paramétrage</div><ul class="alert-list">' + (alerts.length ? alerts.map(function (a) { return '<li><span>' + a[0] + '</span><span>' + a[1] + '</span></li>'; }).join("") : '<li>Rien à signaler.</li>') + '</ul><a class="btn btn-primary btn-sm" href="#operations" style="margin-top:12px">Traiter les opérations</a></div></div>' +
        '<div class="panel-grid"><div class="box"><h3>Revenu par type de flux · 30 j</h3><div class="sub">Part des commissions par source</div>' + hbars(cur.parType, "revenu", M) + '</div>' +
        '<div class="box"><h3>Répartition récurrent / transactionnel</h3><div class="sub">30 derniers jours</div><div class="score-rows"><div class="score-row"><div>Récurrent (Sérénité, B2B, diaspora, agences)<div class="score-bar"><i style="width:' + k.recurrentPct + '%"></i></div></div><b>' + k.recurrentPct + ' %</b></div><div class="score-row"><div>Transactionnel (missions, placements, programmes)<div class="score-bar"><i style="width:' + (100 - k.recurrentPct) + '%"></i></div></div><b>' + (100 - k.recurrentPct) + ' %</b></div></div><h3 style="margin-top:18px">Par acteur · 30 j</h3>' + hbars(cur.parActeur, "revenu", M, function (r) { return ACTEURS[r.cle] || r.label; }) + '</div></div>';
      bindCharts();
    },
    reporting: async function () {
      var r = await api("/api/admin/report?" + qs()), k = r.kpis;
      main.innerHTML = '<div class="adm-head"><div><h1>Reporting</h1><p class="muted small" style="margin:0">Activité globale filtrable par période, ville, flux, acteur, canal et statut. Export CSV pour Excel.</p></div></div>' + filterBar(true) +
        kpis([[M(k.gmv), "volume traité"], [M(k.revenu), "revenu MARYNET"], [pct(k.prisePct), "prise moyenne"], [k.nb.toLocaleString("fr-FR"), "transactions"], [k.recurrentPct + " %", "revenus récurrents"], [pct(k.litigesPct), "taux de litige"]]) +
        '<div class="panel-grid"><div class="box"><h3>Volume traité par mois</h3><div class="sub">Montants passés par la plateforme</div>' + barChart(r.parMois, "gmv", M) + '</div><div class="box"><h3>Revenu MARYNET par mois</h3><div class="sub">Commissions et abonnements</div>' + barChart(r.parMois, "revenu", M) + '</div></div>' +
        '<div class="panel-grid" style="grid-template-columns:1fr 1fr 1fr"><div class="box"><h3>Par type de flux</h3><div class="sub">Revenu</div>' + hbars(r.parType, "revenu", M) + '</div><div class="box"><h3>Par ville</h3><div class="sub">Volume traité</div>' + hbars(r.parVille, "gmv", M) + '</div><div class="box"><h3>Par canal de paiement</h3><div class="sub">Volume traité</div>' + hbars(r.parCanal, "gmv", M) + '</div></div>' +
        '<div class="box" style="margin-top:16px"><h3>Tableau mensuel</h3><div class="sub">Données du graphique, exportables</div>' + table(["Mois", "Transactions", "Volume traité", "Revenu MARYNET", "Prise"], r.parMois.map(function (m) { return [mois(m.cle), m.nb, F(m.gmv), F(m.revenu), pct(m.gmv ? (m.revenu / m.gmv * 100).toFixed(1) : 0)]; })) + '</div>' +
        '<div class="panel-grid"><div class="box"><h3>Par acteur</h3>' + table(["Acteur", "Transactions", "Volume", "Revenu"], r.parActeur.map(function (a) { return [ACTEURS[a.cle] || a.label, a.nb, F(a.gmv), F(a.revenu)]; })) + '</div><div class="box"><h3>Par statut</h3>' + table(["Statut", "Transactions", "Montant"], r.parStatut.map(function (s) { return [status(s.label), s.nb, F(s.gmv)]; })) + '</div></div>';
      bindFilters(VIEWS.reporting); bindCharts();
    },
    transactions: async function (page) {
      page = page || 1;
      var r = await api("/api/admin/transactions?page=" + page + "&limit=25&" + qs());
      main.innerHTML = '<div class="adm-head"><div><h1>Transactions</h1><p class="muted small" style="margin:0">' + r.total.toLocaleString("fr-FR") + ' opérations · commission retenue à la source avant versement</p></div></div>' + filterBar(true) +
        '<div class="box">' + table(["Date", "Réf.", "Type", "Client", "Pro", "Ville", "Canal", "Montant", "Taux", "Commission", "Statut"], r.items.map(function (t) { return [new Date(t.date).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }), '<span class="kbd">' + t.id + '</span>', esc(t.label), esc(t.client), esc(t.pro || "—"), esc(t.ville), esc(t.canal), F(t.montant), Math.round(t.taux * 100) + " %", "<strong>" + F(t.commission) + "</strong>", status(t.statut)]; })) +
        '<div class="pager"><button class="btn btn-outline btn-sm" ' + (r.page <= 1 ? "disabled" : "") + ' data-page="' + (r.page - 1) + '">← Précédent</button><span>Page ' + r.page + ' / ' + r.pages + '</span><button class="btn btn-outline btn-sm" ' + (r.page >= r.pages ? "disabled" : "") + ' data-page="' + (r.page + 1) + '">Suivant →</button></div></div>';
      bindFilters(function () { VIEWS.transactions(1); });
      main.querySelectorAll("[data-page]").forEach(function (b) { b.addEventListener("click", function () { VIEWS.transactions(+b.dataset.page); }); });
    },
    operations: async function () {
      var ops = await api("/api/admin/ops");
      main.innerHTML = '<div class="adm-head"><div><h1>Opérations</h1><p class="muted small" style="margin:0">Vérifications d\'identité (KYC) et litiges en médiation</p></div><button class="btn btn-outline btn-sm" id="reset">Réinitialiser les données de démo</button></div>' +
        '<div class="panel-grid" style="grid-template-columns:1fr 1fr"><div class="box"><h3>File de vérification</h3><div class="sub">Délai cible : ' + settings.alertes.kycDelaiHeures + ' h</div>' +
        table(["Réf.", "Personne", "Rôle", "Ville", "Étape", "Depuis", "Statut", ""], ops.kyc.map(function (k) { return ['<span class="kbd">' + k.id + '</span>', esc(k.nom), esc(k.role), esc(k.ville), esc(k.etape), (k.depuisHeures > settings.alertes.kycDelaiHeures ? '<span class="status alert">' : '<span class="status wait">') + k.depuisHeures + ' h</span>', status(k.statut), k.statut === "en attente" ? '<button class="btn btn-primary btn-sm" data-kyc="' + k.id + '" data-action="valider">Valider</button> <button class="btn btn-outline btn-sm" data-kyc="' + k.id + '" data-action="rejeter">Rejeter</button>' : ""]; })) + '</div>' +
        '<div class="box"><h3>Litiges</h3><div class="sub">Médiation sous 24 h · décisions tracées</div>' +
        table(["Réf.", "Objet", "Parties", "Montant", "Ouvert", "Statut / décision", ""], ops.litiges.map(function (l) { return ['<span class="kbd">' + l.id + '</span>', esc(l.objet), esc(l.parties), l.montant ? F(l.montant) : "—", l.ouvertDepuisHeures + " h", l.statut === "ouvert" ? status("ouvert") : status("résolu") + '<div class="small muted">' + esc(l.decision) + '</div>', l.statut === "ouvert" ? '<button class="btn btn-primary btn-sm" data-litige="' + l.id + '">Trancher</button>' : ""]; })) + '</div></div>';
      main.querySelectorAll("[data-kyc]").forEach(function (b) { b.addEventListener("click", async function () { await api("/api/admin/kyc/" + b.dataset.kyc, { method: "POST", body: JSON.stringify({ action: b.dataset.action }) }); toast("Dossier " + b.dataset.kyc + " " + (b.dataset.action === "rejeter" ? "rejeté" : "validé") + "."); VIEWS.operations(); }); });
      main.querySelectorAll("[data-litige]").forEach(function (b) { b.addEventListener("click", async function () { var d = prompt("Décision de la médiation pour " + b.dataset.litige + " :", "Remboursé 50 %, indice client −4"); if (d === null) return; await api("/api/admin/litiges/" + b.dataset.litige, { method: "POST", body: JSON.stringify({ decision: d }) }); toast("Litige " + b.dataset.litige + " résolu."); VIEWS.operations(); }); });
      document.getElementById("reset").addEventListener("click", async function () { if (!confirm("Régénérer les transactions et opérations de démonstration ?")) return; await api("/api/admin/reset", { method: "POST" }); toast("Données de démonstration régénérées."); VIEWS.operations(); });
    },
    parametrage: async function () {
      var s = await api("/api/admin/settings"), c = s.commissions;
      var num = function (sec, k, label, hint, step) { return '<div class="field"><label for="' + sec + '-' + k + '">' + label + '</label><input type="number" id="' + sec + '-' + k + '" name="' + sec + '.' + k + '" value="' + s[sec][k] + '" step="' + (step || 1) + '" min="0">' + (hint ? '<span class="hint">' + hint + '</span>' : '') + '</div>'; };
      var sw = function (sec, k, label) { return '<label class="switch"><span>' + label + '</span><input type="checkbox" name="' + sec + '.' + k + '"' + (s[sec][k] ? " checked" : "") + '></label>'; };
      main.innerHTML = '<div class="adm-head"><div><h1>Paramétrage</h1><p class="muted small" style="margin:0">Règles de commission, planchers, niveaux Kóllëre, formules, canaux et seuils d\'alerte. ' + (s.updatedAt ? "Dernière modification : " + new Date(s.updatedAt).toLocaleString("fr-FR") : "Valeurs par défaut") + '</p></div></div>' +
        '<form id="settings"><div class="settings-grid">' +
        '<div class="box"><h3>Commissions transactionnelles</h3><div class="sub">Retenues à la source, en %</div><div class="form">' + num("commissions", "heure", "Mission à l'heure (%)", "Pros Bronze et Argent") + num("commissions", "heureOr", "Mission à l'heure · pros Or (%)") + num("commissions", "heurePlatine", "Mission à l'heure · pros Platine (%)") + num("commissions", "urgenceMajoration", "Majoration Urgence facturée au client (%)") + num("commissions", "urgencePart", "Part MARYNET sur l'Urgence (points)") + num("commissions", "placementPct", "Frais de placement (% du 1er salaire)") + num("commissions", "diaspora", "Sama Kër diaspora (%)") + '</div></div>' +
        '<div class="box"><h3>Abonnements &amp; contrats cadre</h3><div class="sub">Revenus récurrents</div><div class="form">' + num("commissions", "serenite", "Sérénité (F / contrat / mois)", "", 500) + num("commissions", "serenitePartage", "Sérénité formule Partagée (F / foyer / mois)", "", 500) + num("commissions", "b2bMax", "B2B · taux d'entrée (%)") + num("commissions", "b2bMin", "B2B · taux plancher grands volumes (%)") + num("commissions", "agence", "Agences · commission sur flux (%)") + num("commissions", "agenceLicence", "Agences · licence back-office (F / mois)", "", 1000) + num("commissions", "institution", "Programmes institutionnels · frais de gestion (%)") + num("commissions", "apporteur", "Apport partenaires (mutuelle, crédit, formation) (%)") + '</div></div>' +
        '<div class="box"><h3>Salaires &amp; protection</h3><div class="sub">Planchers garantis aux professionnel·les</div><div class="form">' + num("salaires", "plancherMensuel", "Plancher mensuel temps plein (F)", "Doit rester au-dessus du SMIG", 1000) + num("salaires", "plancherHoraire", "Plancher horaire (F)", "", 50) + num("salaires", "tirelirePct", "Tirelire automatique (% de chaque paie)") + num("salaires", "cotisationsPct", "Cotisations IPRES + CSS estimées (%)", "", 0.1) + '</div></div>' +
        '<div class="box"><h3>Niveaux Kóllëre</h3><div class="sub">Seuils de l\'indice de confiance (0–100)</div><div class="form">' + num("niveaux", "indiceDepart", "Indice de départ à l'inscription") + num("niveaux", "argent", "Seuil Argent") + num("niveaux", "or", "Seuil Or") + num("niveaux", "platine", "Seuil Platine") + num("niveaux", "suspension", "Suspension automatique sous") + '</div></div>' +
        '<div class="box"><h3>Formules actives</h3><div class="sub">Désactiver retire la formule du simulateur et du réseau</div>' + sw("formules", "permanent", "Kër · Permanent") + sw("formules", "heure", "Waxtu · À l'heure") + sw("formules", "partage", "Mbokk · Partagé") + sw("formules", "abonnement", "Abonnement") + sw("formules", "urgence", "Léegi · Urgence") + sw("formules", "diaspora", "Sama Kër · Diaspora") + '</div>' +
        '<div class="box"><h3>Canaux de paiement</h3>' + sw("paiements", "wave", "Wave") + sw("paiements", "orange", "Orange Money") + sw("paiements", "free", "Free Money") + sw("paiements", "carte", "Carte bancaire (diaspora)") + sw("paiements", "virement", "Virement (B2B, institutions)") + '</div>' +
        '<div class="box"><h3>Villes ouvertes</h3><div class="sub">Une par ligne</div><textarea name="villes" style="min-height:150px">' + esc(s.villes.join("\n")) + '</textarea></div>' +
        '<div class="box"><h3>Seuils d\'alerte</h3><div class="sub">Affichés dans la vue d\'ensemble</div><div class="form">' + num("alertes", "litigeMaxPct", "Taux de litige maximal (%)", "", 0.1) + num("alertes", "kycDelaiHeures", "Délai de vérification d'identité (h)") + num("alertes", "slaRemplacementHeures", "SLA de remplacement (h)") + '</div></div>' +
        '</div><div class="savebar"><span class="small muted">Les modifications sont enregistrées sur le serveur et appliquées au simulateur public.</span><div style="display:flex;gap:8px"><button class="btn btn-outline" type="button" id="reload">Annuler</button><button class="btn btn-primary" type="submit">Enregistrer</button></div></div></form>';
      var form = document.getElementById("settings");
      document.getElementById("reload").addEventListener("click", VIEWS.parametrage);
      form.addEventListener("submit", async function (e) {
        e.preventDefault();
        var body = {};
        Array.prototype.forEach.call(form.elements, function (el) {
          if (!el.name) return;
          if (el.name === "villes") { body.villes = el.value.split("\n").map(function (v) { return v.trim(); }).filter(Boolean); return; }
          var p = el.name.split("."); body[p[0]] = body[p[0]] || {}; body[p[0]][p[1]] = el.type === "checkbox" ? el.checked : el.value;
        });
        try { settings = await api("/api/admin/settings", { method: "PUT", body: JSON.stringify(body) }); toast("Paramètres enregistrés."); VIEWS.parametrage(); }
        catch (err) { toast("Erreur : " + err.message); }
      });
    }
  };

  /* ---------- Routage ---------- */
  function route() {
    var v = location.hash.replace("#", "") || "apercu"; if (!VIEWS[v]) v = "apercu";
    document.querySelectorAll(".nav-item[data-view]").forEach(function (a) { a.classList.toggle("active", a.dataset.view === v); });
    main.innerHTML = '<p class="muted">Chargement…</p>';
    VIEWS[v]().catch(function (e) { if (e.message !== "401") main.innerHTML = '<div class="notice" style="background:var(--terra-soft);color:#8f2f1b">Erreur : ' + esc(e.message) + '</div>'; });
  }
  window.addEventListener("hashchange", route);
  document.getElementById("logout").addEventListener("click", async function (e) { e.preventDefault(); await fetch("/api/admin/logout", { method: "POST" }); location.href = "/admin-login"; });
  (async function init() {
    try {
      var me = await api("/api/admin/me"); settings = await api("/api/admin/settings");
      document.getElementById("foot").innerHTML = "Session " + me.expiresInHours + " h · données : " + (me.persistent ? "volume persistant" : "dossier local (éphémère sur Railway sans Volume)");
      route();
    } catch (e) {}
  })();
})();
