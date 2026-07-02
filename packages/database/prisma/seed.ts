/**
 * SYSTIC-CI — Prisma Seed
 * ─────────────────────────────────────────────────────────────
 * Crée les données initiales pour le développement et la démonstration :
 *   - Tenant principal SYSTIC-CI
 *   - Utilisateurs de chaque rôle (mot de passe : Test@Systic2024!)
 *   - Paramètres d'entreprise
 *   - Clients, leads, contrats, factures, interventions, tickets
 *   - Catalogue de formations
 *   - Articles de blog
 *   - Offres d'emploi
 * ─────────────────────────────────────────────────────────────
 * Usage : npx ts-node prisma/seed.ts
 *         (ou via "prisma db seed" si configuré dans package.json)
 */

import { PrismaClient, UserRole, Plan, LeadStage, LeadSource } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PASSWORD = 'Test@Systic2024!';

async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function xof(amount: number) { return amount; } // Helper lisibilité

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Démarrage du seed SYSTIC-CI…\n');

  // =========================================================================
  // 1. TENANT
  // =========================================================================
  console.log('📦  Création du tenant…');
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'systic-ci' },
    update: {},
    create: {
      name: 'SYSTIC-CI',
      slug: 'systic-ci',
      plan: Plan.ENTERPRISE,
      settings: {
        currency: 'XOF',
        tvaRate: 0.18,
        companyAddress: 'Angré GESTOCI – Cocody, Abidjan',
        companyPhone: '+225 01 73 03 25 25',
        companyEmail: 'contact@systic.ci',
        companyWebsite: 'https://systic.ci',
      },
    },
  });
  console.log(`   ✓ Tenant : ${tenant.name} (${tenant.id})`);

  // =========================================================================
  // 2. UTILISATEURS
  // =========================================================================
  console.log('\n👥  Création des utilisateurs…');
  const hash = await hashPassword(PASSWORD);

  const usersData = [
    {
      email: 'admin@systic.ci',
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      phone: '+225 01 73 03 25 25',
    },
    {
      email: 'direction@systic.ci',
      firstName: 'Kouamé',
      lastName: 'Directeur',
      role: UserRole.DIRECTION,
      phone: '+225 07 07 01 01 01',
    },
    {
      email: 'commercial@systic.ci',
      firstName: 'Aya',
      lastName: 'Konaté',
      role: UserRole.COMMERCIAL,
      phone: '+225 07 07 02 02 02',
    },
    {
      email: 'tech1@systic.ci',
      firstName: 'Jean-Baptiste',
      lastName: 'Yao',
      role: UserRole.TECHNICIEN,
      phone: '+225 07 07 03 03 03',
    },
    {
      email: 'tech2@systic.ci',
      firstName: 'Mamadou',
      lastName: 'Diallo',
      role: UserRole.TECHNICIEN,
      phone: '+225 07 07 04 04 04',
    },
    {
      email: 'formateur@systic.ci',
      firstName: 'Cécile',
      lastName: 'Assi',
      role: UserRole.FORMATEUR,
      phone: '+225 07 07 05 05 05',
    },
    {
      email: 'etudiant@systic.ci',
      firstName: 'Paul',
      lastName: 'Kouassi',
      role: UserRole.ETUDIANT,
      phone: '+225 07 07 06 06 06',
    },
    {
      email: 'client@systic.ci',
      firstName: 'Marie',
      lastName: 'Gbagbo',
      role: UserRole.CLIENT,
      phone: '+225 07 07 07 07 07',
    },
  ];

  const createdUsers: Record<string, Awaited<ReturnType<typeof prisma.user.upsert>>> = {};

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        tenantId: tenant.id,
        email: u.email,
        passwordHash: hash,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        phone: u.phone,
        isActive: true,
        isVerified: true,
      },
    });
    createdUsers[u.role] = user;
    console.log(`   ✓ [${u.role.padEnd(12)}] ${u.email}`);
  }

  // ── Profils liés ──────────────────────────────────────────────────────────

  // Commercial profile
  await prisma.commercial.upsert({
    where: { userId: createdUsers[UserRole.COMMERCIAL].id },
    update: {},
    create: {
      userId: createdUsers[UserRole.COMMERCIAL].id,
      target: xof(50_000_000),
      zone: 'Abidjan',
    },
  });

  // Technicien profile (matricule required + unique)
  const tech1 = await prisma.technicien.upsert({
    where: { userId: createdUsers[UserRole.TECHNICIEN].id },
    update: {},
    create: {
      userId: createdUsers[UserRole.TECHNICIEN].id,
      matricule: 'TECH-001',
      specialite: ['Courant faible', 'Vidéosurveillance', 'Contrôle d\'accès'],
      certifications: ['SSIAP1', 'Habilitation électrique B1V'],
      isAvailable: true,
    },
  });

  // Formateur profile
  await prisma.formateur.upsert({
    where: { userId: createdUsers[UserRole.FORMATEUR].id },
    update: {},
    create: {
      userId: createdUsers[UserRole.FORMATEUR].id,
      bio: 'Expert en sécurité électronique avec 15 ans d\'expérience en Côte d\'Ivoire.',
      specialite: ['Vidéosurveillance', 'Incendie', 'Réseaux informatiques'],
    },
  });

  // Etudiant profile
  const etudiant = await prisma.etudiant.upsert({
    where: { userId: createdUsers[UserRole.ETUDIANT].id },
    update: {},
    create: {
      userId: createdUsers[UserRole.ETUDIANT].id,
      level: 'LICENCE',
    },
  });

  // =========================================================================
  // 3. SETTINGS
  // =========================================================================
  console.log('\n⚙️   Paramètres d\'entreprise…');
  const defaultSettings = {
    'company.name': 'SYSTIC-CI',
    'company.tagline': 'Systèmes Technologiques & Intégration de Confiance',
    'company.address': 'Angré GESTOCI – Cocody, Abidjan, Côte d\'Ivoire',
    'company.phone': '+225 01 73 03 25 25',
    'company.email': 'contact@systic.ci',
    'company.website': 'https://systic.ci',
    'company.tvaRate': 0.18,
    'company.currency': 'XOF',
    'company.rccm': 'CI-ABJ-XXXX-XXXX',
    'invoice.prefix': 'FAC',
    'invoice.footer': 'Merci pour votre confiance. Paiement à 30 jours.',
    'quote.validityDays': 30,
    'notification.email': true,
    'notification.sms': false,
    'notification.whatsapp': false,
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.setting.upsert({
      where: { tenantId_key: { tenantId: tenant.id, key } },
      update: {},
      create: { tenantId: tenant.id, key, value: JSON.stringify(value) },
    });
  }
  console.log(`   ✓ ${Object.keys(defaultSettings).length} paramètres créés`);

  // =========================================================================
  // 4. CLIENTS
  // =========================================================================
  console.log('\n🏢  Clients…');
  const clientsData = [
    {
      nom: 'Groupe Bolloré CI',
      entreprise: 'Bolloré Transport & Logistics',
      email: 'security@bollore.ci',
      telephone: '+225 27 20 30 10 00',
      type: 'ENTREPRISE',
      adresse: 'Zone portuaire, Abidjan',
    },
    {
      nom: 'Hôtel Ivoire',
      entreprise: 'Sofitel Abidjan Hôtel Ivoire',
      email: 'technique@ivoire.ci',
      telephone: '+225 27 20 22 55 00',
      type: 'ENTREPRISE',
      adresse: 'Bd. Hassan II, Cocody, Abidjan',
    },
    {
      nom: 'Marie Gbagbo',
      email: 'client@systic.ci',
      telephone: '+225 07 07 07 07 07',
      type: 'PARTICULIER',
      adresse: 'Cocody Riviera 3, Abidjan',
      userId: createdUsers[UserRole.CLIENT].id,
    },
    {
      nom: 'Banque Atlantique CI',
      entreprise: 'Banque Atlantique Côte d\'Ivoire',
      email: 'dsi@banqueatlantique.net',
      telephone: '+225 27 20 22 44 00',
      type: 'ENTREPRISE',
      adresse: 'Avenue Noguès, Plateau, Abidjan',
    },
  ];

  const createdClients: Awaited<ReturnType<typeof prisma.client.create>>[] = [];
  for (const c of clientsData) {
    const existing = await prisma.client.findFirst({
      where: { tenantId: tenant.id, email: c.email },
    });
    if (existing) {
      createdClients.push(existing);
      continue;
    }
    const client = await prisma.client.create({
      data: {
        tenantId: tenant.id,
        nom: c.nom,
        entreprise: (c as any).entreprise,
        email: c.email,
        telephone: c.telephone,
        type: c.type as any,
        adresse: c.adresse,
        ...(c.userId && { userId: c.userId }),
        status: "CLIENT",
      },
    });
    createdClients.push(client);
    console.log(`   ✓ ${c.nom}`);
  }

  // =========================================================================
  // 5. LEADS (pipeline CRM)
  // =========================================================================
  console.log('\n🎯  Leads CRM…');
  const leadsData = [
    {
      nom: 'OCP Côte d\'Ivoire',
      entreprise: 'OCP Group CI',
      email: 'daf@ocp.ci',
      telephone: '+225 27 20 50 10 00',
      montant: xof(15_000_000),
      stage: LeadStage.NEGOCIATION,
      source: LeadSource.RECOMMANDATION,
      notes: 'Installation complète vidéosurveillance site industriel – 48 caméras',
    },
    {
      nom: 'Résidence Les Palmiers',
      entreprise: 'Immobilier Palmiers SARL',
      email: 'gestion@palmiers.ci',
      telephone: '+225 07 89 10 10 10',
      montant: xof(8_500_000),
      stage: LeadStage.DEVIS,
      source: LeadSource.SITE_WEB,
      notes: 'Contrôle d\'accès résidence 120 appartements + vidéophonie',
    },
    {
      nom: 'Lycée Scientifique',
      entreprise: 'Ministère Éducation Nationale',
      email: 'proviseur@lsci.edu.ci',
      telephone: '+225 27 20 20 20 20',
      montant: xof(5_000_000),
      stage: LeadStage.CONTACT,
      source: LeadSource.EVENEMENT,
      notes: 'Rencontré au salon EduTech Abidjan – installation alarme incendie + sonnerie IP',
    },
    {
      nom: 'Supermarché Carrefour',
      entreprise: 'CDCI Group',
      email: 'operations@carrefour.ci',
      telephone: '+225 27 20 25 25 25',
      montant: xof(22_000_000),
      stage: LeadStage.PROSPECT,
      source: LeadSource.APPEL_ENTRANT,
      notes: '3 nouveaux magasins à équiper en vidéosurveillance + anti-intrusion',
    },
  ];

  for (const l of leadsData) {
    const existing = await prisma.lead.findFirst({
      where: { tenantId: tenant.id, email: l.email },
    });
    if (!existing) {
      await prisma.lead.create({
        data: {
          tenantId: tenant.id,
          nom: l.nom,
          entreprise: l.entreprise,
          email: l.email,
          telephone: l.telephone,
          montant: l.montant,
          stage: l.stage,
          source: l.source,
          notes: l.notes,
          assignedTo: createdUsers[UserRole.COMMERCIAL].id,
        },
      });
    }
    console.log(`   ✓ ${l.nom} [${l.stage}]`);
  }

  // =========================================================================
  // 6. CONTRAT + FACTURE DÉMO
  // =========================================================================
  console.log('\n📄  Contrat & facture démo…');
  const clientBollore = createdClients[0];

  const existingContract = await prisma.contract.findFirst({
    where: { tenantId: tenant.id, reference: 'CTR-2024-0001' },
  });

  let contract = existingContract;
  if (!contract) {
    contract = await prisma.contract.create({
      data: {
        tenantId: tenant.id,
        reference: 'CTR-2024-0001',
        titre: 'Maintenance annuelle vidéosurveillance – Bolloré',
        clientId: clientBollore.id,
        typeContrat: 'MAINTENANCE',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        montantHT: xof(3_000_000),
        montantTVA: xof(540_000),
        montantTTC: xof(3_540_000),
        status: "ACTIF",
        createdById: createdUsers[UserRole.COMMERCIAL].id,
        description: 'Maintenance préventive et curative du système de vidéosurveillance (24 caméras IP) avec astreinte 24/7.',
      },
    });
    console.log('   ✓ Contrat CTR-2024-0001');
  }

  const existingInvoice = await prisma.invoice.findFirst({
    where: { tenantId: tenant.id, reference: 'FAC-202401-0001' },
  });

  if (!existingInvoice) {
    const invoice = await prisma.invoice.create({
      data: {
        tenantId: tenant.id,
        reference: 'FAC-202401-0001',
        clientId: clientBollore.id,
        contractId: contract.id,
        totalHT: xof(750_000),
        totalTVA: xof(135_000),
        totalTTC: xof(885_000),
        status: 'PAYEE',
        dueDate: new Date('2024-02-01'),
        paidAt: new Date('2024-01-25'),
        createdById: createdUsers[UserRole.COMMERCIAL].id,
        notes: 'Facture Q1 2024 – maintenance préventive',
      },
    });
    console.log('   ✓ Facture FAC-202401-0001 (payée)');
  }

  // =========================================================================
  // 7. INTERVENTION DÉMO
  // =========================================================================
  console.log('\n🔧  Intervention démo…');
  const existingIntervention = await prisma.intervention.findFirst({
    where: { tenantId: tenant.id, reference: 'INT-2024-0001' },
  });

  if (!existingIntervention) {
    const intervention = await prisma.intervention.create({
      data: {
        tenantId: tenant.id,
        reference: 'INT-2024-0001',
        clientId: clientBollore.id,
        createdById: createdUsers[UserRole.COMMERCIAL].id,
        type: 'MAINTENANCE',
        status: 'TERMINEE',
        priority: 'NORMALE',
        scheduledAt: new Date('2024-01-15T08:00:00'),
        startedAt: new Date('2024-01-15T09:00:00'),
        completedAt: new Date('2024-01-15T13:00:00'),
        estimatedDuration: 240,
        description: 'Maintenance préventive trimestrielle – vérification et nettoyage des caméras, test des enregistreurs DVR.',
        adresse: 'Zone portuaire, Abidjan – Entrepôt B3',
        techniciens: {
          create: [{ technicienId: tech1.id }],
        },
      },
    });
    console.log('   ✓ Intervention INT-2024-0001 (terminée)');
  }

  // =========================================================================
  // 8. TICKET DÉMO
  // =========================================================================
  console.log('\n🎫  Ticket de support démo…');
  const existingTicket = await prisma.ticket.findFirst({
    where: { tenantId: tenant.id, reference: 'TKT-2024-0001' },
  });

  if (!existingTicket) {
    const ticket = await prisma.ticket.create({
      data: {
        tenantId: tenant.id,
        reference: 'TKT-2024-0001',
        sujet: 'Caméra parking hors service',
        description: 'La caméra N°12 du parking côté est ne répond plus depuis hier soir 23h. Les enregistrements sont interrompus.',
        status: 'EN_COURS',
        priority: 'HAUTE',
        clientId: clientBollore.id,
        createdById: createdUsers[UserRole.CLIENT].id,
        assignedToId: createdUsers[UserRole.TECHNICIEN].id,
      },
    });

    await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        authorId: createdUsers[UserRole.CLIENT].id,
        content: 'Bonjour, la caméra N°12 du parking est côté est en panne depuis hier soir. Pouvez-vous intervenir rapidement ?',
        isInternal: false,
      },
    });

    await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        authorId: createdUsers[UserRole.TECHNICIEN].id,
        content: 'Bonjour, nous avons bien pris en compte votre signalement. Un technicien passera demain matin avant 10h pour diagnostiquer la panne.',
        isInternal: false,
      },
    });
    console.log('   ✓ Ticket TKT-2024-0001 + 2 messages');
  }

  // =========================================================================
  // 9. FORMATION (LMS)
  // =========================================================================
  console.log('\n🎓  Formation démo…');
  const formateur = await prisma.formateur.findUnique({
    where: { userId: createdUsers[UserRole.FORMATEUR].id },
  });

  const existingCourse = await prisma.course.findFirst({
    where: { tenantId: tenant.id, title: "Vidéosurveillance IP — Fondamentaux" },
  });

  if (!existingCourse && formateur) {
    const course = await prisma.course.create({
      data: {
        tenantId: tenant.id,
        title: 'Vidéosurveillance IP — Fondamentaux',
        description: 'Maîtrisez les bases de la vidéosurveillance IP : installation, configuration, maintenance des caméras HD et systèmes d\'enregistrement NVR.',
        price: xof(150_000),
        duration: 1440, // 24 heures
        level: 'DEBUTANT',
        published: true,
        formateurId: formateur.id,
        thumbnail: '/images/courses/videosurveillance-ip.jpg',
        modules: {
          create: [
            {
              title: 'Introduction à la vidéosurveillance IP',
              description: 'Historique, normes, types de caméras',
              order: 1,
              lessons: {
                create: [
                  { title: 'Évolution des systèmes de vidéosurveillance', order: 1, duration: 30, type: 'VIDEO' },
                  { title: 'Différences analogique vs IP', order: 2, duration: 25, type: 'VIDEO' },
                  { title: 'Normes et réglementations en Côte d\'Ivoire', order: 3, duration: 20, type: 'DOCUMENT' },
                ],
              },
            },
            {
              title: 'Matériel et câblage',
              description: 'Caméras, NVR, switches PoE, câbles',
              order: 2,
              lessons: {
                create: [
                  { title: 'Types de caméras IP (dôme, bullet, PTZ)', order: 1, duration: 45, type: 'VIDEO' },
                  { title: 'Installation et câblage RJ45/PoE', order: 2, duration: 60, type: 'VIDEO' },
                  { title: 'Configuration des NVR Hikvision et Dahua', order: 3, duration: 90, type: 'VIDEO' },
                ],
              },
            },
            {
              title: 'Configuration réseau',
              description: 'Adressage IP, port forwarding, DDNS',
              order: 3,
              lessons: {
                create: [
                  { title: 'Adressage IP statique vs DHCP', order: 1, duration: 30, type: 'VIDEO' },
                  { title: 'Accès distant et port forwarding', order: 2, duration: 45, type: 'VIDEO' },
                  { title: 'Application mobile IVMS-4500', order: 3, duration: 30, type: 'VIDEO' },
                ],
              },
            },
          ],
        },
      },
    });
    console.log('   ✓ Formation "Vidéosurveillance IP — Fondamentaux"');

    // Enroll demo student
    await prisma.enrollment.create({
      data: {
        courseId: course.id,
        studentId: etudiant.id,
        tenantId: tenant.id,
        status: 'ACTIVE',
        completedLessons: [],
      },
    });
    console.log('   ✓ Inscription étudiant démo');
  }

  // =========================================================================
  // 10. BLOG
  // =========================================================================
  console.log('\n📝  Articles de blog…');
  const blogPosts = [
    {
      slug: 'securite-electronique-cote-divoire-2024',
      title: 'L\'état de la sécurité électronique en Côte d\'Ivoire en 2024',
      excerpt: 'Tour d\'horizon des tendances, défis et opportunités du marché ivoirien de la sécurité électronique.',
      content: `# L'état de la sécurité électronique en Côte d\'Ivoire en 2024

La Côte d\'Ivoire connaît une croissance soutenue de son marché de sécurité électronique, portée par le développement urbain d\'Abidjan et la montée des exigences de sûreté dans les secteurs bancaire, hôtelier et industriel.

## Les tendances majeures

### Vidéosurveillance IP
Le basculement vers les systèmes IP haute définition s\'accélère. Les caméras 4K avec analyse vidéo intégrée (IA) remplacent progressivement les anciennes installations analogiques.

### Contrôle d'accès biométrique
Les solutions biométriques (empreintes, reconnaissance faciale) gagnent du terrain dans les banques et entreprises du tertiaire.

### Systèmes connectés
L\'intégration des systèmes de sécurité dans des plateformes IoT permet une supervision centralisée et des interventions plus rapides.

## Perspective SYSTIC-CI
Fort de son expertise en courant faible et courant fort, SYSTIC-CI accompagne ses clients dans cette transformation numérique de la sécurité.`,
      published: true,
      categories: ['Actualités', 'Marché', 'Tendances'],
      coverImage: '/images/blog/securite-ci-2024.jpg',
      metaTitle: 'Sécurité électronique en Côte d\'Ivoire 2024 | SYSTIC-CI',
      metaDescription: 'Découvrez les tendances 2024 du marché ivoirien de la sécurité électronique avec SYSTIC-CI, leader en vidéosurveillance et contrôle d\'accès.',
    },
    {
      slug: 'choisir-systeme-videosurveillance',
      title: 'Comment choisir son système de vidéosurveillance ?',
      excerpt: 'Nos experts vous guident dans le choix d\'un système adapté à vos besoins et à votre budget.',
      content: `# Comment choisir son système de vidéosurveillance ?

Le choix d\'un système de vidéosurveillance dépend de nombreux critères. Voici les points essentiels à prendre en compte.

## 1. Définir vos besoins
- Surface à surveiller
- Conditions d\'éclairage
- Stockage requis (jours d\'enregistrement)
- Budget disponible

## 2. Choisir la technologie
**Analogique HD (TVI/CVI/AHD)** : économique, idéal pour les petites installations.
**IP/Réseau** : haute définition, accès à distance, analyse vidéo IA.

## 3. Les critères techniques
- Résolution (2MP, 4MP, 8MP/4K)
- Vision nocturne (IR, Starlight, ColorVu)
- Étanchéité (indice IP66/IP67)
- Stockage (NVR local vs cloud)

Contactez nos experts SYSTIC-CI pour un audit gratuit de vos besoins.`,
      published: true,
      categories: ['Guides', 'Vidéosurveillance'],
      coverImage: '/images/blog/choisir-videosurveillance.jpg',
      metaTitle: 'Comment choisir son système de vidéosurveillance | SYSTIC-CI',
      metaDescription: 'Guide complet pour choisir le système de vidéosurveillance adapté à votre entreprise ou domicile.',
    },
  ];

  for (const post of blogPosts) {
    const existing = await prisma.blogPost.findFirst({
      where: { slug: post.slug },
    });
    if (!existing) {
      await prisma.blogPost.create({
        data: {
          tenantId: tenant.id,
          authorId: createdUsers[UserRole.SUPER_ADMIN].id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          published: post.published,
          publishedAt: new Date(),
          categories: post.categories,
          coverImage: post.coverImage,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          views: Math.floor(Math.random() * 500) + 50,
        },
      });
      console.log(`   ✓ "${post.title}"`);
    }
  }

  // =========================================================================
  // 11. OFFRES D'EMPLOI
  // =========================================================================
  console.log('\n💼  Offres d\'emploi…');
  const careers = [
    {
      titre: 'Technicien en Vidéosurveillance',
      departement: 'Technique',
      localisation: 'Abidjan, Côte d\'Ivoire',
      typeContrat: 'CDI',
      experience: '2 ans minimum',
      description: `## Description du poste

SYSTIC-CI recrute un Technicien en Vidéosurveillance pour renforcer son équipe technique.

## Missions
- Installation et configuration de systèmes de vidéosurveillance IP (Hikvision, Dahua, Axis)
- Maintenance préventive et curative des installations existantes
- Formation des utilisateurs
- Rédaction des rapports d'intervention

## Profil recherché
- BTS/DUT Électronique ou Informatique industrielle
- 2 ans d'expérience minimum en vidéosurveillance IP
- Maîtrise des réseaux TCP/IP
- Permis B souhaité

## Avantages
- Véhicule de service
- Formation continue certifiante
- Mutuelle d'entreprise`,
      remuneration: '300 000 – 450 000 XOF/mois selon profil',
      published: true,
    },
    {
      titre: 'Commercial(e) B2B — Sécurité Électronique',
      departement: 'Commercial',
      localisation: 'Abidjan, Côte d\'Ivoire',
      typeContrat: 'CDI',
      experience: '3 ans minimum',
      description: `## Description du poste

Nous recherchons un(e) Commercial(e) dynamique pour développer notre portefeuille clients B2B.

## Missions
- Prospection et développement du portefeuille clients (entreprises, hôtels, banques)
- Élaboration et suivi des devis techniques
- Négociation et closing des contrats
- Fidélisation et suivi de la satisfaction client

## Profil recherché
- BAC+3 Commerce, Marketing ou technique
- 3 ans d'expérience en vente B2B (idéalement secteur IT/sécurité)
- Excellentes capacités de négociation
- Réseau professionnel à Abidjan

## Avantages
- Fixe + commissions attractives
- Véhicule de service
- Téléphone + ordinateur portable`,
      remuneration: 'Fixe + commissions (400 000 – 800 000 XOF/mois)',
      published: true,
    },
  ];

  for (const job of careers) {
    const existing = await prisma.career.findFirst({
      where: { tenantId: tenant.id, titre: job.titre },
    });
    if (!existing) {
      await prisma.career.create({
        data: {
          tenantId: tenant.id,
          createdById: createdUsers[UserRole.DIRECTION].id,
          titre: job.titre,
          departement: job.departement,
          localisation: job.localisation,
          typeContrat: job.typeContrat,
          experience: job.experience,
          description: job.description,
          remuneration: job.remuneration,
          published: job.published,
        },
      });
      console.log(`   ✓ "${job.titre}"`);
    }
  }

  // =========================================================================
  // 12. AUDIT LOG initial
  // =========================================================================
  await prisma.auditLog.create({
    data: {
      tenantId: tenant.id,
      userId: createdUsers[UserRole.SUPER_ADMIN].id,
      action: 'SEED',
      entity: 'System',
      entityId: tenant.id,
      metadata: { version: '2.0', seededAt: new Date().toISOString() },
    },
  });

  // =========================================================================
  // RÉSUMÉ
  // =========================================================================
  console.log('\n' + '═'.repeat(60));
  console.log('✅  Seed terminé avec succès !\n');
  console.log('📋  Comptes de connexion (mot de passe : Test@Systic2024!)');
  console.log('─'.repeat(60));
  for (const u of usersData) {
    console.log(`   ${u.role.padEnd(14)} → ${u.email}`);
  }
  console.log('═'.repeat(60));
}

// ── Entry point ───────────────────────────────────────────────────────────────

main()
  .catch((e) => {
    console.error('❌ Erreur seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
