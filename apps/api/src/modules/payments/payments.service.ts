import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoicesService } from '../invoices/invoices.service';

export interface CinetPayInitResponse {
  code: string;
  message: string;
  data?: {
    payment_token: string;
    payment_url: string;
  };
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly apiKey: string;
  private readonly siteId: string;
  private readonly baseUrl = 'https://api-checkout.cinetpay.com/v2/payment';

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly invoices: InvoicesService,
  ) {
    this.apiKey = config.get<string>('CINETPAY_API_KEY', '');
    this.siteId = config.get<string>('CINETPAY_SITE_ID', '');
  }

  /**
   * Initiate a CinetPay payment for an invoice
   */
  async initiatePayment(
    invoiceId: string,
    tenantId: string,
    options: {
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      returnUrl: string;
      cancelUrl: string;
    },
  ) {
    const invoice = await this.invoices.findOne(invoiceId, tenantId);

    if (!this.apiKey || !this.siteId) {
      // Dev mode: return mock payment URL
      this.logger.warn('CinetPay not configured — returning mock payment URL');
      return {
        paymentUrl: `${options.returnUrl}?mock=true&invoiceId=${invoiceId}`,
        transactionId: `MOCK-${Date.now()}`,
      };
    }

    const transactionId = `SYSTIC-${invoiceId.slice(0, 8).toUpperCase()}-${Date.now()}`;

    const payload = {
      apikey: this.apiKey,
      site_id: this.siteId,
      transaction_id: transactionId,
      amount: Math.round(invoice.totalTTC),
      currency: 'XOF',
      alternative_currency: '',
      description: `Paiement facture ${invoice.reference} — SYSTIC-CI`,
      customer_id: invoice.clientId,
      customer_name: options.customerName,
      customer_email: options.customerEmail,
      customer_phone_number: options.customerPhone ?? '',
      customer_address: '',
      customer_city: 'Abidjan',
      customer_country: 'CI',
      customer_state: '',
      customer_zip_code: '',
      notify_url: `${this.config.get('API_URL')}/payments/webhook/cinetpay`,
      return_url: options.returnUrl,
      channels: 'ALL',
      metadata: JSON.stringify({ invoiceId, tenantId }),
      lang: 'fr',
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: CinetPayInitResponse = await response.json();

      if (data.code !== '201') {
        this.logger.error('CinetPay init failed', data);
        throw new BadRequestException(`Erreur paiement: ${data.message}`);
      }

      // Save pending payment record
      await this.prisma.payment.create({
        data: {
          tenantId,
          invoiceId,
          amount: invoice.totalTTC,
          currency: 'XOF',
          provider: 'CINETPAY',
          transactionId,
          status: 'PENDING',
        },
      });

      return {
        paymentUrl: data.data?.payment_url,
        transactionId,
        paymentToken: data.data?.payment_token,
      };
    } catch (error) {
      this.logger.error('CinetPay request error', error);
      throw new BadRequestException('Impossible de créer le lien de paiement');
    }
  }

  /**
   * Handle CinetPay webhook (IPN — Instant Payment Notification)
   */
  async handleWebhook(body: {
    cpm_trans_id: string;
    cpm_result: string;
    cpm_amount: string;
    cpm_currency: string;
    cpm_payid: string;
    signature?: string;
  }) {
    const payment = await this.prisma.payment.findFirst({
      where: { transactionId: body.cpm_trans_id },
    });

    if (!payment) {
      this.logger.warn(`Payment not found for transaction ${body.cpm_trans_id}`);
      return { status: 'ignored' };
    }

    const success = body.cpm_result === '00';

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: success ? 'COMPLETED' : 'FAILED',
        providerRef: body.cpm_payid,
        completedAt: success ? new Date() : undefined,
      },
    });

    if (success) {
      await this.invoices.markPaid(payment.invoiceId, payment.tenantId, body.cpm_payid);
      this.logger.log(`Payment confirmed for invoice ${payment.invoiceId}`);
    }

    return { status: success ? 'confirmed' : 'failed' };
  }

  async findByInvoice(invoiceId: string, tenantId: string) {
    return this.prisma.payment.findMany({
      where: { invoiceId, tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
