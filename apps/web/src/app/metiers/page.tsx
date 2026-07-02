import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Zap, Wifi, Camera, Lock, Cpu, Battery, Building2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Nos Métiers — Sécurité Électronique & Infrastructures Intelligentes",
  description:
    "SYSTIC-CI intervient en courant faible (vidéosurveillance, contrôle d'accès, réseau) et courant fort (câblage électrique, groupes électrogènes, domotique). Découvrez nos domaines d'expertise à Abidjan.",
  keywords: [
    "nos métiers sécurité électronique",
    "courant faible Abidjan",
    "courant fort Côte d'Ivoire",
    "vidéosurveillance CCTV",
    "contrôle accès biométrique",
    "câblage électrique",
    "domotique smart building",
    "groupes électrogènes Abidjan",
  ],
  openGraph: {
    title: "Nos Métiers | SYSTIC-CI",
    description: "Expert en courant faible et courant fort à Abidjan. Vidéosurveillance, contrôle d'accès, câblage, domotique et groupes électrogènes.",
    type: "website",
  },
};

const METIERS = [
  {
    icon: Camera,
    titre: "Vidéosurveillance",
    description: "Installation de caméras IP HD, systèmes CCTV analogiques et numériques, NVR/DVR, analyse vidéo intelligente.",
    href: "/metiers/courant-faible",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Lock,
    titre: "Contrôle d'accès",
    description: "Lecteurs biométriques (empreinte, visage), badges RFID, interphones IP, portiques de sécurité.",
    href: "/metiers/courant-faible",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Wifi,
    titre: "Réseau & Téléphonie",
    description: "Infrastructure réseau câblé/sans fil, VPN, IPBX, câblage structuré Cat6/fibres optiques.",
    href: "/metiers/courant-faible",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Zap,
    titre: "Installations électriques",
    description: "Câblage basse tension, tableaux électriques, éclairage LED, conformité aux normes NFC 15-100.",
    href: "/metiers/courant-fort",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Battery,
    titre: "Groupes électrogènes",
    description: "Fourniture, installation et maintenance de groupes électrogènes industriels et résidentiels.",
    href: "/metiers/courant-fort",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Building2,
    titre: "Domotique & Smart Building",
    description: "Automatisation de bâtiments, gestion centralisée éclairage/climatisation/accès, KNX, BACnet.",
    href: "/metiers/courant-fort",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Shield,
    titre: "Sûreté & Alarme",
    description: "Détection intrusion, détection incendie, systèmes anti-vol, périmètre de sécurité.",
    href: "/metiers/courant-faible",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Cpu,
    titre: "Informatique & Serveurs",
    description: "Déploiement de serveurs, NAS, baies de brassage, maintenance parc informatique.",
    href: "/metiers/courant-faible",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

export default function MetiersPage() {
  return (
    <main className="py-20 bg-white dark:bg-grey-anthracite">
      <div className="container-xl">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-heading font-semibold mb-4">
            Domaines d'expertise
          </span>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-grey-anthracite dark:text-white mb-4">
            Nos Métiers
          </h1>
          <p className="text-lg text-grey-text dark:text-white/70 max-w-2xl mx-auto">
            SYSTIC-CI maîtrise l'intégralité de la chaîne de valeur de la sécurité électronique
            et des infrastructures intelligentes, du courant faible au courant fort.
          </p>
        </div>

        {/* Catégories */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Link href="/metiers/courant-faible" className="group p-8 rounded-2xl border-2 border-primary/20 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-heading font-bold text-grey-anthracite dark:text-white">Courant Faible</h2>
            </div>
            <p className="text-grey-text dark:text-white/70 mb-4">Sécurité, réseaux, vidéosurveillance, contrôle d'accès, téléphonie IP.</p>
            <span className="flex items-center gap-2 text-primary font-heading font-semibold text-sm group-hover:gap-3 transition-all">
              Découvrir <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          <Link href="/metiers/courant-fort" className="group p-8 rounded-2xl border-2 border-accent/20 hover:border-accent bg-accent/5 hover:bg-accent/10 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-8 h-8 text-accent" />
              <h2 className="text-2xl font-heading font-bold text-grey-anthracite dark:text-white">Courant Fort</h2>
            </div>
            <p className="text-grey-text dark:text-white/70 mb-4">Installations électriques, groupes électrogènes, domotique, smart building.</p>
            <span className="flex items-center gap-2 text-accent font-heading font-semibold text-sm group-hover:gap-3 transition-all">
              Découvrir <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        {/* Grille prestations */}
        <h2 className="text-2xl font-heading font-bold text-grey-anthracite dark:text-white mb-8">
          Toutes nos prestations
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {METIERS.map((m) => (
            <Link key={m.titre} href={m.href} className="group p-6 rounded-2xl bg-grey-light dark:bg-white/5 hover:shadow-md transition-all hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-xl ${m.bg} flex items-center justify-center mb-4`}>
                <m.icon className={`w-6 h-6 ${m.color}`} />
              </div>
              <h3 className="font-heading font-bold text-grey-anthracite dark:text-white mb-2 group-hover:text-primary transition-colors">
                {m.titre}
              </h3>
              <p className="text-sm text-grey-text dark:text-white/60 leading-relaxed">
                {m.description}
              </p>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link href="/devis" className="btn-primary px-8 py-4 text-lg">
            Demander un devis gratuit
          </Link>
        </div>
      </div>
    </main>
  );
}
