/* MARYNET — Simulateur : recommandation de formule et estimation de budget */
(function () {
  "use strict";
  var M = window.MARYNET;
  var form = document.getElementById("sim"); if (!form) return;
  var sv = document.getElementById("sim-services");
  var pre = new URLSearchParams(location.search).get("formule");
  M.SERVICES.filter(function (s) { return s.id !== "bureaux" && s.id !== "hotel"; }).forEach(function (s, i) {
    sv.insertAdjacentHTML("beforeend", '<label class="chip"><input type="radio" name="service" value="' + s.id + '"' + (i === 0 ? " checked" : "") + '><span>' + s.emoji + " " + s.label + '</span></label>');
  });
  if (pre === "heure") form.duree.value = "ponctuel";
  if (pre === "urgence") form.duree.value = "urgent";
  if (pre === "partage") { form.partage.checked = true; form.jours.value = 3; form.heures.value = 4; }
  if (pre === "abonnement") { form.jours.value = 2; form.heures.value = 4; form.duree.value = "long"; }

  var FORMULES = {
    permanent: { wo: "Kër", nom: "Permanent", why: "Temps plein sur la durée : un contrat domestique permanent est le plus stable pour vous et le plus protecteur pour la professionnelle." },
    heure: { wo: "Waxtu", nom: "À l'heure", why: "Besoin ponctuel ou de courte durée : payez à la mission, paiement séquestré et libéré après votre validation." },
    partage: { wo: "Mbokk", nom: "Partagé entre voisins", why: "Besoin partiel et ouverture au partage : deux ou trois foyers de votre quartier se répartissent un temps plein. Moins cher pour chacun, salaire complet pour elle." },
    abonnement: { wo: "Ayu-bés", nom: "Abonnement", why: "Passages réguliers mais pas quotidiens : la même personne, à heures fixes, à un tarif dégressif." },
    urgence: { wo: "Léegi", nom: "Urgence", why: "Quelqu'un chez vous en moins de 2 h. Uniquement des profils certifiés, avec une majoration de 25 %." }
  };

  function compute() {
    var s = M.SERVICES.find(function (x) { return x.id === form.service.value; });
    var ville = +form.ville.value, jours = +form.jours.value, heures = +form.heures.value, duree = form.duree.value;
    var partage = form.partage.checked, loge = form.loge.checked, serenite = form.serenite.checked, diaspora = form.diaspora.checked;
    document.getElementById("o-jours").textContent = jours; document.getElementById("o-heures").textContent = heures;
    var hSem = jours * heures, hMois = hSem * 4.33;
    var rate = Math.round(s.base * ville / 50) * 50;

    var f;
    if (duree === "urgent") f = "urgence";
    else if (duree === "ponctuel" || duree === "court") f = "heure";
    else if (hSem >= 35) f = "permanent";
    else if (partage && hSem <= 24) f = "partage";
    else f = "abonnement";

    var lines = [], total = 0, alt = "";
    function add(l, v) { lines.push([l, v]); total += v; }
    if (f === "permanent") {
      var salaire = Math.max(75000, Math.round(rate * hMois * 0.8 / 1000) * 1000);
      if (loge) salaire = Math.round(salaire * 0.85 / 1000) * 1000;
      add("Salaire net de la professionnelle" + (loge ? " (logée)" : ""), salaire);
      add("Cotisations IPRES + CSS (estimation)", Math.round(salaire * 0.126));
      if (serenite) add("Abonnement Sérénité (paie, remplacement, mutuelle)", 9500);
      lines.push(["Frais de placement (une fois, à la signature)", Math.round(salaire * 0.5)]);
      if (hSem < 45) alt = "<strong>Alternative :</strong> en formule Partagée avec un foyer voisin, votre part tomberait à environ " + M.fcfa(Math.round((salaire * 1.126) / 2 / 1000) * 1000) + " / mois.";
    } else if (f === "heure" || f === "urgence") {
      var r = f === "urgence" ? Math.round(rate * 1.25 / 50) * 50 : rate;
      var h = duree === "ponctuel" || duree === "urgent" ? Math.max(3, heures) : hMois;
      var label = duree === "ponctuel" || duree === "urgent" ? "Mission de " + h + " h × " + M.fcfa(r) + "/h" : hMois.toFixed(0) + " h / mois × " + M.fcfa(r) + "/h";
      var brut = Math.round(r * h);
      add(label + " (versé à la professionnelle)", brut);
      add("Assurance mission & cotisations", Math.round(brut * 0.06));
      add("Frais de plateforme (10 %)", Math.round(brut * 0.10));
      if (duree === "court" && hSem >= 20) alt = "<strong>Astuce :</strong> au-delà de quelques semaines, un CDD domestique (formule Permanent) coûte environ 15 % de moins.";
    } else if (f === "partage") {
      var plein = Math.max(75000, Math.round(rate * 40 * 4.33 * 0.8 / 1000) * 1000);
      var part = Math.min(0.5, Math.max(1 / 3, hSem / 40));
      add("Votre part du salaire plein (" + Math.round(part * 100) + " % d'un temps plein)", Math.round(plein * part / 500) * 500);
      add("Votre part des cotisations IPRES + CSS", Math.round(plein * 0.126 * part));
      if (serenite) add("Sérénité partagé", 4500);
      lines.push(["Frais de placement partagé (une fois)", Math.round(plein * 0.5 * part)]);
      alt = "<strong>Elle y gagne aussi :</strong> un salaire complet de " + M.fcfa(plein) + " avec un seul contrat, au lieu de plusieurs petits jobs sans protection.";
    } else {
      var passages = jours, forfait = Math.round((rate * heures * passages * 4.33) * (passages >= 4 ? 0.85 : passages >= 2 ? 0.92 : 1) / 500) * 500;
      add(passages + " passage(s) / semaine × " + heures + " h (versé à la professionnelle)", Math.round(forfait * 0.86));
      add("Assurance & cotisations", Math.round(forfait * 0.06));
      add("Frais de plateforme (dégressifs)", Math.round(forfait * 0.08));
      if (partage) alt = "<strong>Vous avez coché le partage :</strong> avec 1 ou 2 voisins pour compléter un temps plein, la formule Partagée serait ~20 % moins chère par foyer. Augmentez les heures pour la voir apparaître.";
    }
    if (diaspora) add("Sama Kër : change & suivi diaspora (3 %)", Math.round(total * 0.03));

    var F = FORMULES[f];
    document.getElementById("r-model").innerHTML = '<span class="wolof">' + F.wo + '</span><h3>' + F.nom + '</h3><p style="margin:0;color:rgba(255,255,255,.8)">' + F.why + '</p>';
    var isOnce = f === "heure" && (duree === "ponctuel") || f === "urgence";
    document.getElementById("r-break").innerHTML = lines.map(function (l) { return '<li><span>' + l[0] + '</span><span>' + M.fcfa(l[1]) + '</span></li>'; }).join("") +
      '<li><span>' + (isOnce ? "Total de la mission" : "Total mensuel estimé") + '</span><span>' + M.fcfa(total) + (diaspora ? ' <small class="muted">(≈ ' + (total / 655.957).toFixed(0) + ' €)</small>' : '') + '</span></li>';
    var a = document.getElementById("r-alt"); a.hidden = !alt; a.innerHTML = alt;
  }
  form.addEventListener("input", compute); compute();
})();
