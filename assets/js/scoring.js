/* MARYNET — Indice Kóllëre : barème et simulateur interactif (agent & client) */
(function () {
  "use strict";
  var AGENT = [
    { k: "identite", label: "Identité & vérifications", max: 20, hint: "CNI, téléphone, 2 références appelées, certification MARYNET" },
    { k: "fiabilite", label: "Fiabilité (ponctualité, annulations, réactivité)", max: 25, hint: "Mesurée par le pointage et la messagerie" },
    { k: "qualite", label: "Qualité du travail (avis clients)", max: 25, hint: "Moyenne des avis vérifiés, recommandations de quartier" },
    { k: "experience", label: "Expérience & formation", max: 15, hint: "Missions accomplies, formations suivies, ancienneté" },
    { k: "social", label: "Engagement (cotisations, tirelire, communauté)", max: 15, hint: "IPRES/CSS à jour, épargne, entraide sur le réseau" }
  ];
  var CLIENT = [
    { k: "identite", label: "Identité & moyen de paiement vérifiés", max: 20, hint: "CNI ou registre de commerce, Wave/OM/carte confirmés" },
    { k: "paiement", label: "Paiement à l'heure", max: 30, hint: "Salaires et missions payés à date, sans retard" },
    { k: "respect", label: "Respect & conditions de travail (avis des pros)", max: 25, hint: "Horaires respectés, repos, heures sup payées, dignité" },
    { k: "clarte", label: "Clarté des missions & annulations", max: 15, hint: "Besoins bien décrits, peu d'annulations tardives" },
    { k: "fidelite", label: "Fidélité & communauté", max: 10, hint: "Ancienneté, recommandations données, absence de litige" }
  ];
  var DEMO = { agent: { identite: 20, fiabilite: 23, qualite: 24, experience: 14, social: 15 }, client: { identite: 20, paiement: 30, respect: 22, clarte: 13, fidelite: 9 } };

  function level(s) { return s >= 92 ? ["platine", "Platine"] : s >= 80 ? ["or", "Or"] : s >= 60 ? ["argent", "Argent"] : ["bronze", "Bronze"]; }
  var PERKS = {
    agent: { bronze: "Missions à l'heure avec paiement séquestré. Suivez une formation gratuite pour passer Argent.", argent: "Mise en avant MaryMatch, accès aux offres B2B, mutuelle de groupe.", or: "Commission réduite à 8 %, tirelire bonifiée, formations avancées offertes.", platine: "Commission 7 %, micro-crédit, statut de formatrice·teur, chef·fe d'équipe B2B." },
    client: { bronze: "Acompte de 50 %, pas d'Urgence. Payez à l'heure 3 missions pour passer Argent.", argent: "Acompte de 25 %, accès Urgence, contrats permanents et Partagé.", or: "Sans acompte, badge Employeur de confiance, priorité sur les profils Platine.", platine: "Conditions cadre B2B, remplacement sous 24 h, ligne prioritaire, tarifs diaspora négociés." }
  };

  function rows(list, values, el) {
    el.innerHTML = list.map(function (c) {
      var v = values[c.k];
      return '<div class="score-row"><div><strong>' + c.label + '</strong><div class="small muted">' + c.hint + '</div><div class="score-bar"><i style="width:' + (v / c.max * 100) + '%"></i></div></div><b>' + v + ' / ' + c.max + '</b></div>';
    }).join("");
  }
  rows(AGENT, DEMO.agent, document.getElementById("agent-rows"));
  rows(CLIENT, DEMO.client, document.getElementById("client-rows"));

  function buildForm(list, values, form, who) {
    form.innerHTML = list.map(function (c) {
      return '<div class="field"><label for="' + who + '-' + c.k + '">' + c.label + ' <span class="range-out" data-out="' + c.k + '">' + values[c.k] + '</span> / ' + c.max + '</label><input type="range" id="' + who + '-' + c.k + '" name="' + c.k + '" min="0" max="' + c.max + '" value="' + values[c.k] + '"></div>';
    }).join("");
    function update() {
      var total = 0;
      list.forEach(function (c) { var v = +form.elements[c.k].value; total += v; form.querySelector('[data-out="' + c.k + '"]').textContent = v; });
      var lv = level(total);
      document.getElementById(who + "-score").textContent = total;
      document.getElementById(who + "-ring").style.setProperty("--v", total);
      var l = document.getElementById(who + "-level"); l.className = "level " + lv[0]; l.textContent = lv[1];
      document.getElementById(who + "-perks").textContent = PERKS[who][lv[0]];
    }
    form.addEventListener("input", update); update();
  }
  buildForm(AGENT, DEMO.agent, document.getElementById("agent-form"), "agent");
  buildForm(CLIENT, DEMO.client, document.getElementById("client-form"), "client");
})();
