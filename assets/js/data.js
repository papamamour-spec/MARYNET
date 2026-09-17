/* ==========================================================================
   MARYNET — Données de démonstration (profils, publications, quartiers)
   Toutes les personnes et organisations ci-dessous sont fictives.
   ========================================================================== */

window.MARYNET = window.MARYNET || {};

MARYNET.QUARTIERS = [
  "Almadies", "Mermoz", "Sacré-Cœur", "Point E", "Plateau", "Ouakam", "Yoff", "Ngor",
  "Parcelles Assainies", "Pikine", "Guédiawaye", "Rufisque", "Keur Massar", "Diamniadio",
  "Thiès", "Saly / Mbour", "Saint-Louis", "Ziguinchor", "Touba", "Kaolack"
];

MARYNET.SERVICES = [
  { id: "menage",   label: "Ménage & entretien", emoji: "🧹", base: 1800 },
  { id: "nounou",   label: "Garde d'enfants (nounou)", emoji: "🧸", base: 2200 },
  { id: "cuisine",  label: "Cuisine", emoji: "🍲", base: 2000 },
  { id: "repassage",label: "Lavage & repassage", emoji: "👕", base: 1600 },
  { id: "jardin",   label: "Jardinage & piscine", emoji: "🌿", base: 1900 },
  { id: "gardien",  label: "Gardiennage", emoji: "🛡️", base: 1500 },
  { id: "senior",   label: "Aide aux personnes âgées", emoji: "🤝", base: 2400 },
  { id: "chauffeur",label: "Chauffeur", emoji: "🚗", base: 2300 },
  { id: "bureaux",  label: "Entretien de bureaux (B2B)", emoji: "🏢", base: 1700 },
  { id: "hotel",    label: "Hôtellerie & résidences (B2B)", emoji: "🏨", base: 1800 }
];

/* Types d'acteurs du réseau */
MARYNET.ROLES = {
  famille:     { label: "Famille",       color: "teal",   emoji: "🏠" },
  pro:         { label: "Professionnel·le", color: "gold", emoji: "⭐" },
  entreprise:  { label: "Entreprise",    color: "indigo", emoji: "🏢" },
  institution: { label: "Institution",   color: "terra",  emoji: "🏛️" },
  agence:      { label: "Agence",        color: "indigo", emoji: "🤝" },
  diaspora:    { label: "Diaspora",      color: "teal",   emoji: "✈️" }
};

MARYNET.PROFILES = [
  {
    id: "awa-ndiaye", role: "pro", name: "Awa Ndiaye", initials: "AN", color: "teal",
    title: "Aide-ménagère & cuisinière · 8 ans d'expérience", quartier: "Ouakam",
    score: 96, missions: 214, verified: true, certified: true, langs: ["Wolof", "Français"],
    services: ["menage", "cuisine"], rate: 2000, monthly: 110000,
    dispo: "Lun–Sam · matin", bio: "Je cuisine le thiéboudienne comme personne et je tiens une maison au carré. Ponctuelle, discrète, j'aime les familles avec des enfants.",
    reviews: [
      { by: "Famille Diop · Mermoz", stars: 5, text: "Awa fait partie de la famille depuis 3 ans. Fiable, honnête, formidable." },
      { by: "M. Sarr · Almadies", stars: 5, text: "Nous l'avons trouvée via la formule Partagée avec nos voisins. Parfait." }
    ]
  },
  {
    id: "moussa-fall", role: "pro", name: "Moussa Fall", initials: "MF", color: "indigo",
    title: "Gardien & jardinier certifié", quartier: "Almadies",
    score: 91, missions: 87, verified: true, certified: true, langs: ["Wolof", "Français", "Pulaar"],
    services: ["gardien", "jardin"], rate: 1600, monthly: 95000,
    dispo: "Nuit · 7j/7", bio: "Ancien militaire, formé aux premiers secours. J'entretiens aussi jardins et piscines.",
    reviews: [{ by: "Résidence Les Filaos", stars: 5, text: "Sérieux, présent, réactif. Recommandé." }]
  },
  {
    id: "mariama-sow", role: "pro", name: "Mariama Sow", initials: "MS", color: "gold",
    title: "Nounou diplômée petite enfance", quartier: "Sacré-Cœur",
    score: 98, missions: 132, verified: true, certified: true, langs: ["Wolof", "Français", "Anglais"],
    services: ["nounou"], rate: 2500, monthly: 140000,
    dispo: "Temps plein · logée possible", bio: "CAP petite enfance, 6 ans en crèche. Je propose des activités d'éveil en wolof et en français.",
    reviews: [{ by: "Famille Ba-Lefèvre · Point E", stars: 5, text: "Nos jumeaux l'adorent. Une perle rare." }]
  },
  {
    id: "ibrahima-diallo", role: "pro", name: "Ibrahima Diallo", initials: "ID", color: "terra",
    title: "Agent d'entretien bureaux & résidences", quartier: "Pikine",
    score: 88, missions: 310, verified: true, certified: false, langs: ["Wolof", "Français"],
    services: ["bureaux", "menage"], rate: 1700, monthly: 90000,
    dispo: "Équipe · nuit & week-end", bio: "Je dirige une équipe de 4 agents pour les bureaux et immeubles. Devis rapides.",
    reviews: [{ by: "Cabinet Sénégal Conseil", stars: 4, text: "Équipe efficace, quelques retards en début de contrat, depuis irréprochable." }]
  },
  {
    id: "famille-diop", role: "famille", name: "Famille Diop", initials: "FD", color: "teal",
    title: "Famille · 2 enfants · Mermoz", quartier: "Mermoz", score: 94, verified: true,
    bio: "Nous cherchons régulièrement de l'aide pour le ménage et la garde le mercredi."
  },
  {
    id: "teranga-hotels", role: "entreprise", name: "Teranga Résidences", initials: "TR", color: "indigo",
    title: "Résidences hôtelières · Saly & Dakar · 120 chambres", quartier: "Saly / Mbour", score: 92, verified: true,
    bio: "Nous recrutons des équipes d'entretien formées et payées via MARYNET, avec contrat cadre et remplacement garanti."
  },
  {
    id: "mairie-ouakam", role: "institution", name: "Commune de Ouakam", initials: "CO", color: "terra",
    title: "Collectivité territoriale · Programme Liggéey Jàmm", quartier: "Ouakam", score: 90, verified: true,
    bio: "Nous finançons la formation et l'immatriculation sociale de 200 travailleuses domestiques de la commune."
  },
  {
    id: "agence-kersa", role: "agence", name: "Agence Kërsa", initials: "AK", color: "indigo",
    title: "Agence de placement agréée · 45 professionnel·les", quartier: "Plateau", score: 89, verified: true,
    bio: "Agence partenaire : nous utilisons MARYNET pour la paie, la mutuelle et le suivi de nos placements."
  },
  {
    id: "fatou-diaspora", role: "diaspora", name: "Fatou G. (Paris)", initials: "FG", color: "teal",
    title: "Diaspora · finance une aide pour sa mère à Thiès", quartier: "Thiès", score: 95, verified: true,
    bio: "Je paie depuis la France, ma mère reçoit l'aide chez elle. Je vois chaque passage sur mon téléphone."
  }
];

MARYNET.POSTS = [
  {
    id: 1, author: "famille-diop", type: "cherche", when: "il y a 12 min", audience: "Mermoz",
    text: "Nous cherchons une nounou 3 après-midis par semaine (mer/jeu/ven, 14h–19h) pour deux enfants de 4 et 7 ans. Formule Partagée bienvenue si des voisins de Mermoz ont le même besoin !",
    tags: ["Nounou", "Partagé", "Mermoz"], likes: 14, thanks: 3, comments: [
      { by: "Mariama Sow", text: "Bonjour ! Je suis disponible ces après-midis, je vous envoie ma disponibilité en message." },
      { by: "Famille Kane · Mermoz", text: "Même besoin pour le mercredi, on partage ?" }
    ]
  },
  {
    id: 2, author: "awa-ndiaye", type: "propose", when: "il y a 40 min", audience: "Ouakam · Ngor · Yoff",
    text: "Créneau libre à partir de lundi : 3 matinées (8h–12h) pour ménage + cuisine. Je suis certifiée MARYNET, références vérifiées. Tarif 2 000 F/h ou forfait mensuel.",
    tags: ["Ménage", "Cuisine", "À l'heure"], likes: 31, thanks: 9, comments: [
      { by: "M. Sarr · Almadies", text: "Je recommande Awa à 100 %, elle a travaillé chez nous 2 ans." }
    ]
  },
  {
    id: 3, author: "teranga-hotels", type: "b2b", when: "il y a 2 h", audience: "Saly / Mbour",
    text: "Appel à candidatures B2B : nous recherchons 12 agent·es d'entretien pour la saison (nov–avr) à Saly. CDD 6 mois, salaire au-dessus du SMIG, transport et repas fournis, cotisations IPRES/CSS via MARYNET.",
    tags: ["Hôtellerie", "CDD", "12 postes"], likes: 58, thanks: 22, comments: [
      { by: "Ibrahima Diallo", text: "Mon équipe de 4 est intéressée. Candidature envoyée via le module Équipes." }
    ]
  },
  {
    id: 4, author: "mairie-ouakam", type: "institution", when: "il y a 5 h", audience: "Ouakam",
    text: "📣 Programme Liggéey Jàmm : 200 places de formation gratuite (hygiène, premiers secours, droits du travail) + immatriculation IPRES offerte. Inscriptions ouvertes aux travailleuses domestiques résidant à Ouakam.",
    tags: ["Formation", "Gratuit", "IPRES"], likes: 204, thanks: 96, comments: [
      { by: "Awa Ndiaye", text: "Inscrite ! Merci à la commune 🙏" }
    ]
  },
  {
    id: 5, author: "fatou-diaspora", type: "recommande", when: "hier", audience: "Thiès",
    text: "Depuis Paris, j'ai mis en place une aide à domicile 4 h/jour pour ma mère à Thiès. Je paie par carte, l'aide est payée en Wave, et je reçois une photo de pointage à chaque passage. Merci MARYNET, je dors tranquille.",
    tags: ["Diaspora", "Seniors", "Thiès"], likes: 122, thanks: 40, comments: []
  },
  {
    id: 6, author: "agence-kersa", type: "propose", when: "hier", audience: "Dakar",
    text: "Notre agence a 6 cuisinier·es disponibles immédiatement (dont 2 formé·es à la cuisine diététique). Contrats permanents avec remplacement garanti sous 48 h.",
    tags: ["Agence", "Cuisine", "Permanent"], likes: 27, thanks: 5, comments: []
  },
  {
    id: 7, author: "moussa-fall", type: "propose", when: "il y a 2 jours", audience: "Almadies",
    text: "Gardiennage de nuit disponible pour une villa ou une petite résidence aux Almadies. Certifié premiers secours. Contrat permanent de préférence.",
    tags: ["Gardiennage", "Nuit", "Permanent"], likes: 19, thanks: 4, comments: []
  }
];

MARYNET.MESSAGES = [
  { with: "Mariama Sow", last: "Je peux passer vous rencontrer jeudi à 17h ?", when: "14:02", unread: 2 },
  { with: "Agence Kërsa", last: "Contrat cadre envoyé pour signature électronique.", when: "Hier", unread: 0 },
  { with: "Famille Kane", last: "Partant pour la formule Partagée le mercredi !", when: "Hier", unread: 1 }
];

MARYNET.GROUPS = [
  { name: "Voisins de Mermoz", members: 412, emoji: "🏘️" },
  { name: "Nounous certifiées Dakar", members: 1280, emoji: "🧸" },
  { name: "Pros de l'hôtellerie · Petite Côte", members: 356, emoji: "🏨" },
  { name: "Diaspora & familles", members: 2910, emoji: "✈️" }
];

MARYNET.profile = function (id) {
  return MARYNET.PROFILES.find(function (p) { return p.id === id; });
};
MARYNET.fcfa = function (n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " F";
};
