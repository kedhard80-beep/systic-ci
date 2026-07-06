/** ================================================================
 * SYSTIC-CI — Global Constants
 * Source: Charte graphique + Plaquette commerciale V1
 * ================================================================ */

export const SITE = {
  name: "SYSTIC-CI",
  fullName: "SYSTIC-CI — Systèmes Technologiques & Intégration de Confiance",
  tagline: "Votre Partenaire en Sécurité Électronique",
  description:
    "Entreprise ivoirienne spécialisée en ingénierie et intégration technologique. Courant faible (sécurité électronique, réseaux) et courant fort (électricité, groupes électrogènes). Équipes certifiées, disponibles 7j/7.",
  url: "https://systic.ci",
  email: "contact@systic.ci",
  phone: ["01 73 03 25 25", "05 85 06 95 71"],
  address: {
    street: "Angré GESTOCI, près de China Mall",
    city: "Cocody, Abidjan",
    country: "Côte d'Ivoire",
    full: "Angré GESTOCI, à côté de China Mall — Cocody, Abidjan, Côte d'Ivoire",
  },
  hours: {
    office: "Lundi – Samedi : 09h00 – 18h00",
    field: "Équipes terrain : 7j/7, 07h00 – 23h00",
  },
  social: {
    facebook: "https://facebook.com/systic.ci",
    instagram: "https://instagram.com/systic.ci",
    linkedin: "https://linkedin.com/company/systic-ci",
    tiktok: "https://tiktok.com/@systic.ci",
    whatsapp: "https://wa.me/2250173032525",
    youtube: "https://youtube.com/@systic-ci",
  },
} as const;

export const BRAND = {
  colors: {
    blue: "#1A45C9",
    red: "#C81324",
    navy: "#0D1F4E",
    white: "#FFFFFF",
    greyLight: "#F5F6FA",
    greyText: "#5B6273",
    anthracite: "#2B2F3A",
  },
  fonts: {
    heading: "Montserrat",
    body: "Open Sans",
  },
} as const;

// ===== NAVIGATION =====
export const NAV_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "Entreprise", href: "/entreprise" },
  {
    label: "Nos Métiers",
    href: "/metiers",
    children: [
      {
        label: "Courant Faible",
        href: "/metiers/courant-faible",
        description: "Vidéosurveillance, contrôle d'accès, réseaux, domotique",
        icon: "ShieldCheck",
      },
      {
        label: "Courant Fort",
        href: "/metiers/courant-fort",
        description: "Installations électriques, TGBT, groupes électrogènes",
        icon: "Zap",
      },
    ],
  },
  { label: "Académie", href: "/academie" },
  { label: "Réalisations", href: "/realisations" },
  { label: "Blog", href: "/blog" },
  { label: "Carrières", href: "/carrieres" },
  { label: "Contact", href: "/contact" },
] as const;

// ===== SERVICES — COURANT FAIBLE =====
export const SERVICES_COURANT_FAIBLE = [
  {
    id: "videosurveillance",
    title: "Vidéosurveillance IP",
    slug: "videosurveillance-ip",
    icon: "Camera",
    description:
      "Systèmes HD avec portée >10 km, caméras PTZ, NAS Synology, supervision centralisée 24/7.",
    features: [
      "Caméras IP HD & PTZ",
      "Portée >10 km",
      "NAS Synology",
      "Supervision centralisée",
      "Analyse IA intégrée",
      "Accès mobile distant",
    ],
    color: "#1A45C9",
  },
  {
    id: "controle-acces",
    title: "Contrôle d'Accès",
    slug: "controle-acces-biometrie",
    icon: "Fingerprint",
    description:
      "Biométrie faciale et RFID, ventouses électromagnétiques, gestion des droits d'accès.",
    features: [
      "Reconnaissance faciale",
      "Badges RFID",
      "Ventouses électromagnétiques",
      "Gestion multi-sites",
      "Journal des accès",
      "Intégration logicielle",
    ],
    color: "#1A45C9",
  },
  {
    id: "securite-perimetrique",
    title: "Sécurité Périmétrique",
    slug: "securite-perimetrique",
    icon: "ShieldAlert",
    description:
      "Clôtures électriques haute tension, alarmes anti-intrusion, détection périmétrique avancée.",
    features: [
      "Clôtures électriques HT",
      "Alarmes anti-intrusion",
      "Détecteurs PIR/micro-ondes",
      "Sirènes & flash",
      "Télésurveillance",
      "Protocoles d'intervention",
    ],
    color: "#C81324",
  },
  {
    id: "monitoring-datacenter",
    title: "Monitoring Datacenters",
    slug: "monitoring-datacenters",
    icon: "Server",
    description:
      "Surveillance environnementale AKCP/Vultan, alertes SNMP/SMS temps réel, température et humidité.",
    features: [
      "Capteurs AKCP & Vultan",
      "SNMP / SMS",
      "Température & humidité",
      "Alertes temps réel",
      "Historique & rapports",
      "Interventions automatiques",
    ],
    color: "#1A45C9",
  },
  {
    id: "domotique",
    title: "Domotique & Smart Building",
    slug: "domotique-smart-building",
    icon: "Home",
    description:
      "Disjoncteurs connectés, automatisation des scénarios, efficacité énergétique optimisée.",
    features: [
      "Disjoncteurs connectés",
      "Scénarios automatisés",
      "Efficacité énergétique",
      "Contrôle vocal & mobile",
      "Intégration IoT",
      "Tableau de bord centralisé",
    ],
    color: "#1A45C9",
  },
  {
    id: "reseaux",
    title: "Réseaux & Téléphonie IP",
    slug: "reseaux-telephonie-ip",
    icon: "Network",
    description:
      "LAN/VLAN, PABX/IPBX, câblage structuré, interconnexion multi-sites, fibre optique.",
    features: [
      "LAN / VLAN",
      "PABX & IPBX",
      "Câblage structuré cat6/6A",
      "Fibre optique",
      "VPN multi-sites",
      "ToIP (Téléphonie IP)",
    ],
    color: "#1A45C9",
  },
] as const;

// ===== SERVICES — COURANT FORT =====
export const SERVICES_COURANT_FORT = [
  {
    id: "cablage-electrique",
    title: "Câblage Électrique",
    slug: "cablage-electrique",
    icon: "Cable",
    description:
      "Installations HTA/BT, câblage industriel, tertiaire et résidentiel, mise aux normes NFC.",
    features: [
      "Installations HTA/BT",
      "Câblage industriel",
      "Câblage tertiaire & résidentiel",
      "Mise aux normes NFC",
      "Audit électrique",
      "Maintenance préventive",
    ],
    color: "#C81324",
  },
  {
    id: "tableaux-electriques",
    title: "Tableaux Électriques",
    slug: "tableaux-electriques-tgbt",
    icon: "LayoutGrid",
    description:
      "Conception et installation TGBT, armoires de distribution, maintenance préventive et curative.",
    features: [
      "Conception TGBT",
      "Armoires de distribution",
      "Tableaux divisionnaires",
      "Protection contre les surcharges",
      "Maintenance préventive",
      "Diagnostic & réparation",
    ],
    color: "#C81324",
  },
  {
    id: "groupes-electrogenes",
    title: "Groupes Électrogènes",
    slug: "groupes-electrogenes",
    icon: "Battery",
    description:
      "Installation, mise en service et maintenance de groupes de secours industriels toutes puissances.",
    features: [
      "Installation complète",
      "Mise en service",
      "Maintenance régulière",
      "Groupes de secours",
      "Groupes industriels",
      "Transfert automatique (ATS)",
    ],
    color: "#C81324",
  },
  {
    id: "eclairage-industriel",
    title: "Éclairage Industriel",
    slug: "eclairage-industriel",
    icon: "Lightbulb",
    description:
      "LED industriel et tertiaire, éclairage de sécurité, balisage, audit énergétique.",
    features: [
      "LED industriel",
      "LED tertiaire",
      "Éclairage de sécurité",
      "Balisage réglementaire",
      "Audit énergétique",
      "Économies d'énergie",
    ],
    color: "#C81324",
  },
] as const;

// ===== ACADÉMIE — MODULES =====
export const ACADEMIE_MODULES = [
  {
    id: "M1",
    code: "M1",
    title: "Vidéosurveillance IP & Longue Distance",
    duration: "4 semaines",
    level: "Intermédiaire",
    icon: "Camera",
    color: "#1A45C9",
  },
  {
    id: "M2",
    code: "M2",
    title: "Monitoring Environnemental Datacenters",
    duration: "3 semaines",
    level: "Avancé",
    icon: "Server",
    color: "#1A45C9",
  },
  {
    id: "M3",
    code: "M3",
    title: "Contrôle d'Accès Biométrie",
    duration: "3 semaines",
    level: "Intermédiaire",
    icon: "Fingerprint",
    color: "#1A45C9",
  },
  {
    id: "M4",
    code: "M4",
    title: "Sécurité Périmétrique & Anti-Intrusion",
    duration: "4 semaines",
    level: "Avancé",
    icon: "ShieldAlert",
    color: "#C81324",
  },
  {
    id: "M5",
    code: "M5",
    title: "Domotique & Efficacité Énergétique",
    duration: "3 semaines",
    level: "Intermédiaire",
    icon: "Home",
    color: "#1A45C9",
  },
  {
    id: "M6",
    code: "M6",
    title: "Réseaux & Téléphonie sur IP (ToIP)",
    duration: "5 semaines",
    level: "Avancé",
    icon: "Network",
    color: "#1A45C9",
  },
] as const;

// ===== SECTEURS D'INTERVENTION =====
export const SECTEURS = [
  { label: "Banques & Institutions Financières", icon: "Landmark" },
  { label: "Stations-Service & Distributeurs", icon: "Fuel" },
  { label: "Cliniques & Pharmacies", icon: "Heart" },
  { label: "Usines & Sites Industriels", icon: "Factory" },
  { label: "Promoteurs BTP & Immobilier", icon: "Building2" },
  { label: "Entreprises & Bureaux Privés", icon: "Briefcase" },
  { label: "Administrations & Institutions", icon: "University" },
  { label: "Résidences & Particuliers", icon: "Home" },
] as const;

// ===== STATS =====
export const STATS = [
  { value: 500, suffix: "+", label: "Projets réalisés" },
  { value: 7, suffix: "j/7", label: "Disponibilité terrain" },
  { value: 6, suffix: "", label: "Modules de formation" },
  { value: 90, suffix: "%", label: "Formation pratique" },
] as const;

// ===== USER ROLES =====
export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  DIRECTION = "DIRECTION",
  COMMERCIAL = "COMMERCIAL",
  TECHNICIEN = "TECHNICIEN",
  FORMATEUR = "FORMATEUR",
  ETUDIANT = "ETUDIANT",
  CLIENT = "CLIENT",
  PARTENAIRE = "PARTENAIRE",
  VISITEUR = "VISITEUR",
}

// ===== API ENDPOINTS =====
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
export const API_V1 = `${API_BASE}/api/v1`;

// ===== PAGINATION =====
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ===== UPLOAD LIMITS =====
export const MAX_FILE_SIZE_MB = 10;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const ACCEPTED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
