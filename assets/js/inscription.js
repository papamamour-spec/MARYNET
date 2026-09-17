/* MARYNET — Inscription : formulaire adaptatif selon le rôle */
(function () {
  "use strict";
  var M = window.MARYNET;
  var roles = document.getElementById("roles"), form = document.getElementById("signup"), extra = document.getElementById("f-extra"), title = document.getElementById("f-title");
  var q = document.getElementById("f-quartier");
  M.QUARTIERS.forEach(function (x) { var o = document.createElement("option"); o.value = x; o.textContent = x; q.appendChild(o); });
  function chips(name, list) { return '<div class="field"><label>' + name + '</label><div class="chips">' + list.map(function (l) { return '<label class="chip"><input type="checkbox"><span>' + l + '</span></label>'; }).join("") + '</div></div>'; }
  var EXTRA = {
    famille: '<div class="row"><div class="field"><label>Personnes au foyer</label><input type="number" min="1" value="4"></div><div class="field"><label>Enfants de moins de 10 ans</label><input type="number" min="0" value="0"></div></div>' + chips("Besoins", ["Ménage", "Nounou", "Cuisine", "Repassage", "Gardiennage", "Jardin", "Aide seniors"]),
    pro: chips("Mes services", ["Ménage", "Nounou", "Cuisine", "Repassage", "Gardiennage", "Jardin", "Aide seniors", "Chauffeur", "Bureaux"]) + '<div class="row"><div class="field"><label>Années d\'expérience</label><input type="number" min="0" value="3"></div><div class="field"><label>Formule souhaitée</label><select><option>Permanent</option><option>À l\'heure</option><option>Partagé</option><option>En équipe (B2B)</option></select></div></div><div class="field"><label>Références (2 anciens employeurs, nom + téléphone)</label><textarea placeholder="Nous les appellerons pour valider votre profil."></textarea></div>',
    entreprise: '<div class="row"><div class="field"><label>Secteur</label><select><option>Hôtellerie / résidences</option><option>Bureaux</option><option>Clinique / école</option><option>Copropriété / conciergerie</option><option>Autre</option></select></div><div class="field"><label>NINEA / registre de commerce</label><input type="text" placeholder="Pour la vérification"></div></div><div class="row"><div class="field"><label>Nombre de sites</label><input type="number" min="1" value="1"></div><div class="field"><label>Agent·es souhaité·es</label><input type="number" min="1" value="5"></div></div>',
    institution: '<div class="row"><div class="field"><label>Type</label><select><option>Ministère / agence publique</option><option>Commune / collectivité</option><option>ONG / bailleur</option><option>Mutuelle / assureur</option><option>Banque / microfinance</option><option>Centre de formation</option></select></div><div class="field"><label>Objectif principal</label><select><option>Formation</option><option>Formalisation / immatriculation</option><option>Données d\'impact</option><option>Couverture santé</option><option>Crédit / épargne</option></select></div></div>',
    agence: '<div class="row"><div class="field"><label>Agrément / NINEA</label><input type="text"></div><div class="field"><label>Professionnel·les placé·es</label><input type="number" min="1" value="20"></div></div>' + chips("Services", ["Familles", "Entreprises", "Diaspora", "Formation"]),
    diaspora: '<div class="row"><div class="field"><label>Pays de résidence</label><select><option>France</option><option>Italie</option><option>Espagne</option><option>États-Unis</option><option>Canada</option><option>Autre</option></select></div><div class="field"><label>Proche à aider (ville)</label><input type="text" placeholder="Ex. : ma mère, Thiès"></div></div>' + chips("Besoins", ["Aide seniors", "Ménage", "Cuisine", "Courses", "Accompagnement médical"]) + '<div class="field"><label>Contact de confiance au pays (nom + téléphone)</label><input type="text"></div>'
  };
  var TITLES = { famille: "Créer mon compte famille", pro: "Créer mon profil professionnel", entreprise: "Créer mon compte entreprise", institution: "Proposer un partenariat institutionnel", agence: "Rejoindre le programme agences", diaspora: "Mettre en place Sama Kër" };
  var current = "famille";
  function pick(r) {
    current = r; extra.innerHTML = EXTRA[r]; title.textContent = TITLES[r];
    roles.querySelectorAll("[data-role]").forEach(function (b) { b.style.outline = b.dataset.role === r ? "3px solid var(--teal)" : ""; b.setAttribute("aria-pressed", b.dataset.role === r ? "true" : "false"); });
  }
  roles.addEventListener("click", function (e) { var b = e.target.closest("[data-role]"); if (b) pick(b.dataset.role); });
  var pre = new URLSearchParams(location.search).get("role"); pick(EXTRA[pre] ? pre : "famille");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var nom = document.getElementById("f-nom").value.trim();
    try { localStorage.setItem("marynet.user", JSON.stringify({ nom: nom, role: current, quartier: q.value })); } catch (err) {}
    M.toast("Bienvenue " + nom + " ! Un·e conseiller·e vous appelle sous 24 h pour la vérification.");
    setTimeout(function () { location.href = "reseau.html"; }, 1800);
  });
})();
