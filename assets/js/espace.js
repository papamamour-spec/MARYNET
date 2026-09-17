/* MARYNET — Tableaux de bord de démonstration par acteur */
(function () {
  "use strict";
  var M = window.MARYNET;
  function kpis(list) { return '<div class="kpis">' + list.map(function (k) { return '<div class="kpi"><strong>' + k[0] + '</strong><span>' + k[1] + '</span></div>'; }).join("") + '</div>'; }
  function table(head, rows) { return '<div class="table-wrap"><table class="table"><thead><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join("") + '</tr></thead><tbody>' + rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join("") + '</tr>'; }).join("") + '</tbody></table></div>'; }
  function timeline(items) { return '<ul class="timeline">' + items.map(function (i) { return '<li><time>' + i[0] + '</time><span>' + i[1] + '</span></li>'; }).join("") + '</ul>'; }
  function side(name, initials, color, role, score, extra) {
    return '<div style="display:grid;gap:14px"><div class="side-card"><div class="profile"><div class="avatar ' + color + '">' + initials + '</div><div><div class="profile-name">' + name + '</div><div class="profile-meta">' + role + '</div></div></div><div style="display:flex;gap:12px;align-items:center;margin-top:14px"><div class="score-ring" style="--v:' + score + ';width:80px;height:80px"><strong style="font-size:1.3rem">' + score + '</strong></div><div class="small"><strong>Indice Kóllëre</strong><br><a href="scoring.html">Comment progresser →</a></div></div></div>' + (extra || "") + '</div>';
  }
  var wallet = function (title, amount, sub, rows) {
    return '<div class="wallet" id="portefeuille"><div class="sub">' + title + '</div><div class="amount">' + amount + '</div><div class="sub">' + sub + '</div><div class="pm"><span>Wave</span><span>Orange Money</span><span>Free Money</span><span>Carte</span></div>' + (rows ? '<hr style="border:0;border-top:1px solid rgba(255,255,255,.2);margin:14px 0"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:.85rem">' + rows.map(function (r) { return '<div><div class="sub">' + r[0] + '</div><strong>' + r[1] + '</strong></div>'; }).join("") + '</div>' : '') + '</div>';
  };

  var P = {
    famille: '<div class="dash">' + side("Famille Diop", "FD", "teal", "Mermoz · 2 enfants", 94, wallet("Dépenses maison · septembre", "138 400 F", "Prochain prélèvement le 30")) +
      '<div style="display:grid;gap:16px">' + kpis([["2", "contrats actifs"], ["12", "missions ce mois"], ["100 %", "paiements à l'heure"]]) +
      '<div class="card"><h3>Mes contrats</h3>' + table(["Professionnelle", "Formule", "Prochain paiement", "Statut"], [
        ['<a href="profil.html?id=awa-ndiaye">Awa Ndiaye</a>', "Mbokk · Partagé (avec Famille Kane)", "30 sept · 41 000 F", '<span class="status ok">Actif</span>'],
        ['<a href="profil.html?id=mariama-sow">Mariama Sow</a>', "Abonnement · mer/jeu/ven 14h–19h", "30 sept · 88 000 F", '<span class="status wait">Contrat à signer</span>']
      ]) + '</div>' +
      '<div class="card"><h3>Activité récente</h3>' + timeline([["Auj. 12:04", "✅ Awa a pointé la fin de mission (4 h). Notez la mission ★★★★★"], ["Hier", "💬 Mariama Sow a accepté votre proposition d'abonnement"], ["Lun.", "📄 Contrat Partagé signé par SMS avec la Famille Kane"], ["Sam.", "💳 41 000 F prélevés via Wave, salaire d'Awa versé"]]) + '</div></div></div>',

    pro: '<div class="dash">' + side("Awa Ndiaye", "AN", "teal", "Aide-ménagère & cuisinière · Ouakam", 96, wallet("Sama Xaalis · disponible", "248 500 F", "Prochain salaire le 30", [["Tirelire (5 %)", "61 000 F"], ["Retraite cumulée", "14 mois"], ["Mutuelle", "Active"], ["Commission", "7 % (Platine)"]])) +
      '<div style="display:grid;gap:16px">' + kpis([["214", "missions accomplies"], ["3", "employeurs actifs"], ["98 %", "ponctualité"]]) +
      '<div class="card"><h3>Mon planning cette semaine</h3>' + table(["Jour", "Employeur", "Horaires", "Formule", "Statut"], [
        ["Lun · Mer · Ven", '<a href="profil.html?id=famille-diop">Famille Diop</a> (★ 94)', "8h–12h", "Partagé", '<span class="status ok">Confirmé</span>'],
        ["Mar · Jeu", "Famille Kane (★ 91)", "8h–12h", "Partagé", '<span class="status ok">Confirmé</span>'],
        ["Sam", "M. Sarr (★ 89)", "9h–13h", "À l'heure · 8 000 F", '<span class="status wait">Paiement séquestré</span>']
      ]) + '</div>' +
      '<div class="card"><h3>Opportunités pour moi (MaryMatch)</h3>' + table(["Offre", "Où", "Gain", "Action"], [
        ["🏢 12 postes saison hôtelière", "Saly", "≈ 140 000 F/mois + transport", '<a class="btn btn-sm btn-primary" href="reseau.html">Postuler</a>'],
        ["🎓 Formation cuisine diététique (gratuite)", "Ouakam", "+ 4 pts d'indice", '<a class="btn btn-sm btn-outline" href="reseau.html">M\'inscrire</a>']
      ]) + '</div></div></div>',

    entreprise: '<div class="dash" id="entreprise">' + side("Teranga Résidences", "TR", "indigo", "Résidences hôtelières · Saly & Dakar", 92, '<div class="side-card"><h4>Sites</h4><div class="group-item"><div class="em">🏨</div><div>Saly · 80 chambres<small>7 agentes · chef Ibrahima D.</small></div></div><div class="group-item"><div class="em">🏨</div><div>Dakar Plateau · 40 chambres<small>5 agentes · chef Aïda M.</small></div></div></div>') +
      '<div style="display:grid;gap:16px">' + kpis([["12", "agent·es en contrat cadre"], ["99,1 %", "présence (pointage QR)"], ["4,86 M F", "facture de septembre"]]) +
      '<div class="card"><h3>Présence aujourd\'hui</h3>' + table(["Agent·e", "Site", "Pointage", "Statut"], [
        ['<a href="profil.html?id=ibrahima-diallo">Ibrahima Diallo</a> (chef)', "Saly", "06:58", '<span class="status ok">Présent</span>'],
        ["Aïda Mbaye (cheffe)", "Plateau", "07:02", '<span class="status ok">Présente</span>'],
        ["Khady Ndour", "Saly", "—", '<span class="status alert">Absente · remplaçante affectée 08:15</span>'],
        ["+ 9 agent·es", "—", "07:00–07:12", '<span class="status ok">Présent·es</span>']
      ]) + '</div>' +
      '<div class="card"><h3>Conformité &amp; documents</h3><ul class="list-check small"><li>12 contrats CDD saisonniers signés et déclarés</li><li>Attestations IPRES / CSS du trimestre disponibles</li><li>Registre du personnel à jour · export PDF</li><li>Rapport RSE : 12 emplois formels créés, 100 % de femmes formées</li></ul></div></div></div>',

    institution: '<div class="dash" id="institution">' + side("Commune de Ouakam", "CO", "terra", "Programme Liggéey Jàmm", 90, '<div class="side-card"><h4>Budget programme</h4><p class="small" style="margin:0"><strong>18,5 M F</strong> engagés sur 24 M F<br><span class="muted">200 formations + immatriculations</span></p><div class="score-bar"><i style="width:77%"></i></div></div>') +
      '<div style="display:grid;gap:16px">' + kpis([["164", "travailleuses inscrites / 200"], ["112", "contrats formalisés"], ["3,9 M F", "cotisations IPRES/CSS générées"]]) +
      '<div class="card"><h3>Impact par mois (anonymisé)</h3>' + table(["Mois", "Formées", "Contrats créés", "Salaire moyen", "Litiges"], [["Juin", "38", "21", "82 000 F", "0"], ["Juillet", "52", "34", "86 500 F", "1 (résolu)"], ["Août", "41", "29", "88 000 F", "0"], ["Sept.", "33", "28", "91 000 F", "0"]]) + '</div>' +
      '<div class="card"><h3>Prochaines actions</h3>' + timeline([["27 sept", "🎓 Session Hygiène & sécurité · 40 places · 31 inscrites"], ["1er oct", "🪪 Journée d'immatriculation IPRES à la mairie"], ["15 oct", "📊 Rapport trimestriel aux bailleurs (export automatique)"]]) + '</div></div></div>',

    agence: '<div class="dash">' + side("Agence Kërsa", "AK", "indigo", "Agence agréée · Plateau · 45 pros", 89, wallet("Chiffre d'affaires · septembre", "2 140 000 F", "Commission MARYNET partagée : 6 %")) +
      '<div style="display:grid;gap:16px">' + kpis([["38", "placements actifs"], ["45", "professionnel·les"], ["2", "remplacements ce mois"]]) +
      '<div class="card"><h3>Placements à traiter</h3>' + table(["Client", "Besoin", "Pro proposée", "Statut"], [
        ["Famille Ba · Point E", "Cuisinière permanente", "Ndèye F. (★ 90)", '<span class="status wait">Entretien jeudi</span>'],
        ["Cabinet Sénégal Conseil", "2 agent·es bureaux · soir", "Équipe Diallo", '<span class="status ok">Contrat cadre signé</span>'],
        ["Famille Sy · Almadies", "Nounou logée", "3 profils envoyés", '<span class="status wait">En attente client</span>']
      ]) + '</div>' +
      '<div class="card"><h3>Paie du mois</h3><p class="small muted">38 salaires programmés le 30 via Wave et Orange Money · cotisations calculées · bulletins générés automatiquement.</p><a class="btn btn-primary btn-sm" href="#" onclick="MARYNET.toast(\'Paie programmée : 38 virements le 30 à 08:00.\');return false">Valider la paie</a></div></div></div>',

    diaspora: '<div class="dash">' + side("Fatou G.", "FG", "teal", "Paris · aide pour sa mère à Thiès", 95, wallet("Sama Kër · ce mois", "176 000 F", "≈ 268 € · débité par carte le 30", [["Passages", "22 / 22"], ["Contacts au pays", "2 notifiés"], ["Professionnelle", "Awa D. (★ 93)"], ["Appel vidéo", "Dim. 18h"]])) +
      '<div style="display:grid;gap:16px">' + kpis([["22", "passages ce mois"], ["100 %", "ponctualité"], ["4 h", "par jour, lun–ven"]]) +
      '<div class="card"><h3>Journal des passages · Thiès</h3>' + timeline([["Auj. 12:04", "✅ Fin de mission · déjeuner préparé, médicaments donnés · 📷 photo"], ["Auj. 08:02", "✅ Arrivée chez Maman · pointage QR"], ["Hier", "🛒 Courses au marché (12 500 F, ticket photographié)"], ["Dim.", "📹 Appel vidéo hebdomadaire · 14 min"]]) + '</div>' +
      '<div class="card"><h3>Vos contacts de confiance au pays</h3>' + table(["Contact", "Rôle", "Notifié"], [["Mamadou G. (frère) · Thiès", "Peut visiter et valider", "SMS à chaque passage"], ["Dr Fall · clinique", "Suivi médical", "Rapport hebdomadaire"]]) + '</div></div></div>'
  };

  var panels = document.getElementById("panels");
  function show(id) {
    panels.innerHTML = '<div class="panel" role="tabpanel">' + P[id] + '</div>';
    document.querySelectorAll(".tab").forEach(function (t) { t.setAttribute("aria-selected", t.dataset.tab === id ? "true" : "false"); });
  }
  document.getElementById("tabs").addEventListener("click", function (e) { var t = e.target.closest(".tab"); if (t) { show(t.dataset.tab); history.replaceState(null, "", "#" + t.dataset.tab); } });
  var h = location.hash.replace("#", "");
  show(P[h] ? h : "famille");
})();
