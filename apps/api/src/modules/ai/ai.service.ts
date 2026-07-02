import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiChatResponse {
  message: string;
  tokensUsed?: number;
  model?: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openaiApiKey: string;
  private readonly model = 'gpt-4o-mini';

  private readonly SYSTEM_PROMPT = `Tu es l'assistant intelligent de SYSTIC-CI (Systèmes Technologiques & Intégration de Confiance), une entreprise ivoirienne spécialisée en sécurité électronique et électricité à Abidjan, Côte d'Ivoire.

Tu peux aider avec :
- Informations sur les services (vidéosurveillance, contrôle d'accès, alarmes, réseaux, électricité)
- Demandes de devis et prise de rendez-vous
- Informations sur les formations de l'Académie SYSTIC-CI
- Support technique de premier niveau
- Questions sur les contrats et interventions (pour les clients connectés)

Contacts SYSTIC-CI :
- Téléphone : 01 73 03 25 25
- Email : contact@systic.ci
- Adresse : Angré GESTOCI, Cocody, Abidjan
- Horaires bureau : Lun-Sam 09h-18h | Terrain 7j/7 07h-23h

Règles :
- Réponds toujours en français
- Sois professionnel, courtois et efficace
- Pour les questions techniques complexes, propose un rendez-vous avec un ingénieur
- Si tu ne connais pas la réponse, dis-le honnêtement et propose de contacter l'équipe
- Ne donne jamais de prix fermes sans avoir analysé le projet avec un ingénieur
- Mentionne systématiquement que les devis sont GRATUITS et que l'on répond sous 24h`;

  constructor(private readonly config: ConfigService) {
    this.openaiApiKey = config.get<string>('OPENAI_API_KEY', '');
  }

  async chat(
    messages: ChatMessage[],
    context?: {
      clientId?: string;
      userId?: string;
      sessionId?: string;
    },
  ): Promise<AiChatResponse> {
    if (!this.openaiApiKey) {
      return this.fallbackResponse(messages[messages.length - 1]?.content ?? '');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: this.SYSTEM_PROMPT },
            ...messages.slice(-10), // Keep last 10 messages for context
          ],
          max_tokens: 800,
          temperature: 0.7,
          presence_penalty: 0.1,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        this.logger.error('OpenAI error', err);
        return this.fallbackResponse(messages[messages.length - 1]?.content ?? '');
      }

      const data = await response.json();
      const choice = data.choices?.[0];

      return {
        message: choice?.message?.content ?? "Désolé, je n'ai pas pu traiter votre demande.",
        tokensUsed: data.usage?.total_tokens,
        model: this.model,
      };
    } catch (error) {
      this.logger.error('AI chat error', error);
      return this.fallbackResponse(messages[messages.length - 1]?.content ?? '');
    }
  }

  async generateQuoteSuggestion(projectDescription: string): Promise<string> {
    if (!this.openaiApiKey) {
      return 'Pour obtenir une estimation, veuillez nous contacter au 01 73 03 25 25 ou remplir le formulaire de devis en ligne.';
    }

    const response = await this.chat([
      {
        role: 'user',
        content: `Analyse ce projet et génère une liste de prestations recommandées avec une fourchette de prix indicative en XOF (francs CFA). Projet : ${projectDescription}`,
      },
    ]);

    return response.message;
  }

  async summarizeDocument(text: string, type: 'contract' | 'report' | 'invoice'): Promise<string> {
    const prompts = {
      contract: 'Résume les points clés de ce contrat : obligations des parties, durée, montant, conditions de résiliation.',
      report: "Résume ce rapport d'intervention : travaux effectués, problèmes rencontrés, recommandations.",
      invoice: 'Résume cette facture : prestations, montants HT/TTC, conditions de paiement.',
    };

    const response = await this.chat([
      { role: 'user', content: `${prompts[type]}\n\n${text.slice(0, 3000)}` },
    ]);

    return response.message;
  }

  private fallbackResponse(userMessage: string): AiChatResponse {
    const lower = userMessage.toLowerCase();

    const RESPONSES: Array<{ keywords: string[]; response: string }> = [
      {
        keywords: ['vidéo', 'caméra', 'cctv', 'surveillance'],
        response: `Nos solutions de vidéosurveillance IP incluent des caméras HD/4K (dôme, tube, PTZ), NVR/DVR, vision nocturne et accès à distance 24h/24. Marques : Hikvision, Dahua, Axis.\n\n📞 Pour un devis GRATUIT : **01 73 03 25 25**`,
      },
      {
        keywords: ['accès', 'biométr', 'badge', 'rfid', 'empreinte'],
        response: `Nos systèmes de contrôle d'accès incluent : lecteurs biométriques (empreinte + facial), badges RFID/NFC, interphonie vidéo IP et gestion centralisée. Marques : HID, Suprema, ZKTeco.\n\n📞 Devis gratuit : **01 73 03 25 25**`,
      },
      {
        keywords: ['devis', 'prix', 'tarif', 'coût', 'combien'],
        response: `Nos devis sont **100% gratuits** et sans engagement ! ✅\n\n1. Remplissez le formulaire sur notre site\n2. Ou appelez le **01 73 03 25 25**\n3. Nos ingénieurs vous répondent sous 24h\n\nUn déplacement pour audit sur site est inclus dans le devis.`,
      },
      {
        keywords: ['formation', 'cours', 'académie', 'module', 'certif'],
        response: `L'Académie SYSTIC-CI propose 6 modules certifiants :\n• M1 : Vidéosurveillance (4 sem.)\n• M2 : Contrôle d'accès (3 sem.)\n• M3 : Réseaux (5 sem.)\n• M4 : Électricité BT (4 sem.)\n• M5 : Domotique (3 sem.)\n• M6 : Alarme & SSI (3 sem.)\n\n90% pratique — Certificat officiel. 📧 contact@systic.ci`,
      },
      {
        keywords: ['électr', 'tgbt', 'groupe', 'générateur', 'courant fort'],
        response: `Pôle Courant Fort : câblage BT/HTA, tableaux TGBT sur mesure, groupes électrogènes (10-2000 kVA), éclairage LED industriel.\n\nConformes normes NF C 15-100 et CEI 60364.\n📞 **01 73 03 25 25**`,
      },
      {
        keywords: ['réseau', 'wifi', 'lan', 'fibre', 'voip', 'téléphonie'],
        response: `Nos solutions réseau : câblage Cat6/Fibre certifié Fluke, switches Cisco/Ubiquiti, Wi-Fi professionnel, IPBX/Asterisk, VPN.\n\nSupervision 24/7 avec Zabbix. 📞 **01 73 03 25 25**`,
      },
    ];

    for (const { keywords, response } of RESPONSES) {
      if (keywords.some((k) => lower.includes(k))) {
        return { message: response };
      }
    }

    return {
      message: `Bonjour ! Je suis l'assistant de SYSTIC-CI 👋\n\nJe peux vous aider sur :\n• Vidéosurveillance & sécurité\n• Contrôle d'accès & alarmes\n• Réseaux & téléphonie\n• Électricité industrielle\n• Formations certifiantes\n• Demandes de devis\n\n📞 **01 73 03 25 25** — disponible 7j/7\n📧 contact@systic.ci`,
    };
  }
}
