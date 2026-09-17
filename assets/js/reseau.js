/* ==========================================================================
   MARYNET — Fil d'actualité (réseau social) : publication, filtres,
   réactions, commentaires, suggestions MaryMatch. Persistance locale.
   ========================================================================== */
(function () {
  "use strict";
  var M = window.MARYNET;
  var ME = { name: "Famille Diop", id: "famille-diop", quartier: "Mermoz" };
  var KEY = "marynet.feed.v1";

  /* ---- État (posts de démo + posts locaux) ---- */
  var state = { posts: [], reactions: {} };
  try { var saved = JSON.parse(localStorage.getItem(KEY) || "null"); if (saved) state = saved; } catch (e) {}
  var localPosts = state.posts || [];
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  function allPosts() {
    return localPosts.concat(M.POSTS).sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
  }

  var TYPE_LABEL = { cherche: "🔍 Je cherche", propose: "✋ Je propose", b2b: "🏢 Offre B2B", institution: "🏛️ Annonce publique", recommande: "💛 Je recommande" };
  var TYPE_ACTION = { cherche: "Répondre", propose: "Réserver", b2b: "Postuler", institution: "S'inscrire", recommande: "Voir le profil" };

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function initials(name) { return name.split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase(); }

  /* ---- Rendu d'une publication ---- */
  function renderPost(p) {
    var a = M.profile(p.author) || { name: p.authorName || ME.name, initials: initials(p.authorName || ME.name), color: "teal", role: p.role || "famille", quartier: p.audience, score: 94, verified: true, id: p.author };
    var role = M.ROLES[a.role] || M.ROLES.famille;
    var r = state.reactions[p.id] || {};
    var likes = (p.likes || 0) + (r.like ? 1 : 0);
    var thanks = (p.thanks || 0) + (r.thanks ? 1 : 0);
    var comments = (p.comments || []).concat(r.comments || []);
    var html = '<article class="post" data-id="' + p.id + '" data-role="' + a.role + '" data-type="' + p.type + '" data-quartier="' + esc(p.audience || "") + '">' +
      '<div class="post-head">' +
        '<div class="avatar ' + a.color + '">' + esc(a.initials) + '</div>' +
        '<div class="post-who">' +
          '<div class="profile-name"><a href="profil.html?id=' + esc(a.id) + '">' + esc(a.name) + '</a> ' +
            '<span class="badge ' + role.color + '">' + role.emoji + " " + role.label + '</span>' +
            (a.verified ? '<span class="badge">✓ Vérifié</span>' : "") +
            (a.score ? '<span class="score-pill" title="Indice de confiance Kóllëre">★ ' + a.score + '</span>' : "") +
          '</div>' +
          '<div class="post-meta">' + esc(p.when) + ' · 📍 ' + esc(p.audience || "Sénégal") + '</div>' +
        '</div>' +
        '<span class="post-type ' + p.type + '">' + TYPE_LABEL[p.type] + '</span>' +
      '</div>' +
      '<p class="post-text">' + esc(p.text) + '</p>' +
      '<div class="tags">' + (p.tags || []).map(function (t) { return '<span class="badge grey">' + esc(t) + '</span>'; }).join("") + '</div>' +
      '<div class="post-actions">' +
        '<button type="button" data-act="like" class="' + (r.like ? "on" : "") + '">👍 Dëgg <span>' + likes + '</span></button>' +
        '<button type="button" data-act="thanks" class="' + (r.thanks ? "on" : "") + '">🙏 Jërëjëf <span>' + thanks + '</span></button>' +
        '<button type="button" data-act="comment">💬 <span>' + comments.length + '</span></button>' +
        '<button type="button" data-act="share">↗ Partager</button>' +
        '<button type="button" data-act="primary" class="primary">' + TYPE_ACTION[p.type] + '</button>' +
      '</div>' +
      '<div class="comments" ' + (comments.length ? "" : "hidden") + '>' +
        comments.map(function (c) {
          return '<div class="comment"><div class="avatar grey" style="background:var(--sand-deep);color:var(--ink)">' + esc(initials(c.by)) + '</div><div class="bubble"><strong>' + esc(c.by) + '</strong>' + esc(c.text) + '</div></div>';
        }).join("") +
        '<form class="comment-form"><input type="text" placeholder="Répondre en tant que ' + esc(ME.name) + '…" aria-label="Commentaire" required><button class="btn btn-primary btn-sm" type="submit">Envoyer</button></form>' +
      '</div>' +
    '</article>';
    return html;
  }

  /* ---- Filtres ---- */
  var filter = "tous";
  function matches(post, el) {
    if (filter === "tous") return true;
    if (filter === "quartier") return (post.audience || "").indexOf(ME.quartier) !== -1;
    if (filter === "b2b") return post.type === "b2b";
    if (filter === "institution") return post.type === "institution" || el.dataset.role === "institution";
    return el.dataset.role === filter;
  }
  var feed = document.getElementById("feed");
  function render() {
    feed.innerHTML = allPosts().map(renderPost).join("");
    var shown = 0;
    feed.querySelectorAll(".post").forEach(function (el) {
      var p = allPosts().find(function (x) { return String(x.id) === el.dataset.id; });
      var ok = matches(p, el); el.hidden = !ok; if (ok) shown++;
    });
    if (!shown) feed.insertAdjacentHTML("beforeend", '<div class="empty">Rien pour ce filtre pour l\'instant. Publiez le premier besoin de votre quartier !</div>');
  }
  document.querySelectorAll("[data-filter]").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.preventDefault(); filter = b.dataset.filter;
      document.querySelectorAll(".feed-filters button").forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.filter === filter ? "true" : "false"); });
      document.querySelectorAll(".side-nav a[data-filter]").forEach(function (x) { x.classList.toggle("active", x.dataset.filter === filter); });
      render();
    });
  });

  /* ---- Interactions sur le fil ---- */
  feed.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-act]"); if (!btn) return;
    var post = btn.closest(".post"); var id = post.dataset.id;
    var r = state.reactions[id] = state.reactions[id] || {};
    var act = btn.dataset.act;
    if (act === "like" || act === "thanks") { r[act] = !r[act]; persist(); render(); return; }
    if (act === "comment") { var c = post.querySelector(".comments"); c.hidden = !c.hidden; if (!c.hidden) c.querySelector("input").focus(); return; }
    if (act === "share") { M.toast("Lien copié : partagez cette publication sur WhatsApp ou par SMS."); return; }
    if (act === "primary") {
      var type = post.dataset.type;
      var msgs = { cherche: "Votre réponse a été envoyée en message privé. Réponse habituelle en moins de 2 h.", propose: "Créneau réservé ! Le paiement est séquestré jusqu'à la fin de la mission.", b2b: "Candidature envoyée avec votre passeport de compétences.", institution: "Inscription enregistrée. Vous recevrez un SMS de confirmation.", recommande: "Ouverture du profil recommandé…" };
      M.toast(msgs[type] || "C'est noté !");
      if (type === "recommande") setTimeout(function () { location.href = "profil.html?id=awa-ndiaye"; }, 900);
    }
  });
  feed.addEventListener("submit", function (e) {
    var f = e.target.closest(".comment-form"); if (!f) return;
    e.preventDefault();
    var post = f.closest(".post"); var id = post.dataset.id;
    var r = state.reactions[id] = state.reactions[id] || {};
    (r.comments = r.comments || []).push({ by: ME.name, text: f.querySelector("input").value.trim() });
    persist(); render();
    var c = feed.querySelector('.post[data-id="' + id + '"] .comments'); if (c) c.hidden = false;
  });

  /* ---- Composer ---- */
  var aud = document.getElementById("post-audience");
  M.QUARTIERS.forEach(function (q) { var o = document.createElement("option"); o.value = q; o.textContent = "📍 " + q; if (q === ME.quartier) o.selected = true; aud.appendChild(o); });
  document.getElementById("post-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var text = document.getElementById("post-text").value.trim(); if (!text) return;
    var type = document.querySelector("input[name=ptype]:checked").value;
    var tags = [];
    M.SERVICES.forEach(function (s) { if (text.toLowerCase().indexOf(s.label.split(" ")[0].toLowerCase()) !== -1) tags.push(s.label.split(" (")[0]); });
    if (/partag/i.test(text)) tags.push("Partagé");
    if (/urgent|léegi|aujourd/i.test(text)) tags.push("Urgence");
    localPosts.unshift({ id: "l" + Date.now(), ts: Date.now(), author: ME.id, type: type, when: "à l'instant", audience: aud.value, text: text, tags: tags.slice(0, 3), likes: 0, thanks: 0, comments: [] });
    state.posts = localPosts; persist();
    e.target.reset(); aud.value = ME.quartier;
    filter = "tous"; document.querySelectorAll(".feed-filters button").forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.filter === "tous" ? "true" : "false"); });
    render();
    M.toast("Publié ! Vos voisins de " + aud.value + " et les pros certifiés sont notifiés.");
    window.scrollTo({ top: document.getElementById("feed").offsetTop - 90, behavior: "smooth" });
  });
  var mobilePost = document.getElementById("mobile-post");
  if (mobilePost) mobilePost.addEventListener("click", function () { document.getElementById("post-text").focus(); window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---- Colonnes latérales ---- */
  var groups = document.getElementById("groups");
  if (groups) groups.innerHTML = M.GROUPS.map(function (g) { return '<div class="group-item"><div class="em">' + g.emoji + '</div><div>' + esc(g.name) + '<small>' + g.members.toLocaleString("fr-FR") + ' membres</small></div></div>'; }).join("");
  var sug = document.getElementById("suggestions");
  if (sug) {
    var pros = M.PROFILES.filter(function (p) { return p.role === "pro"; }).slice(0, 3);
    var pcts = [97, 91, 86];
    sug.innerHTML = pros.map(function (p, i) { return '<a class="suggest" href="profil.html?id=' + p.id + '" style="color:inherit"><div class="avatar ' + p.color + '">' + p.initials + '</div><div><strong>' + esc(p.name) + '</strong><br><span class="muted small">' + esc(p.title.split(" ·")[0]) + ' · ' + esc(p.quartier) + '</span></div><span class="pct">' + pcts[i] + ' %</span></a>'; }).join("");
  }
  var msgs = document.getElementById("messages");
  if (msgs) msgs.innerHTML = M.MESSAGES.map(function (m) { return '<div class="msg-item"><div class="avatar indigo">' + initials(m.with) + '</div><div><strong>' + esc(m.with) + '</strong><div class="last">' + esc(m.last) + '</div></div>' + (m.unread ? '<span class="n">' + m.unread + '</span>' : '<span class="muted small" style="margin-left:auto">' + m.when + '</span>') + '</div>'; }).join("");

  render();
})();
