import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { UserRole } from '@prisma/client';
import { IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

class InitPaymentDto {
  @ApiProperty() @IsString() invoiceId: string;
  @ApiProperty() @IsString() customerName: string;
  @ApiProperty() @IsString() customerEmail: string;
  @ApiPropertyOptional() @IsOptional() @IsString() customerPhone?: string;
  @ApiProperty() @IsString() returnUrl: string;
  @ApiProperty() @IsString() cancelUrl: string;
}

@ApiTags('Paiements')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.CLIENT, UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
  @ApiOperation({ summary: 'Initier un paiement CinetPay' })
  initiate(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: InitPaymentDto,
  ) {
    return this.svc.initiatePayment(dto.invoiceId, tenantId, {
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone,
      returnUrl: dto.returnUrl,
      cancelUrl: dto.cancelUrl,
    });
  }

  @Post('webhook/cinetpay')
  @Public()
  @ApiOperation({ summary: 'CinetPay IPN webhook (public)' })
  webhook(@Body() body: any) {
    return this.svc.handleWebhook(body);
  }

  @Get('invoice/:invoiceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Paiements liés à une facture' })
  findByInvoice(
    @Param('invoiceId') invoiceId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.svc.findByInvoice(invoiceId, tenantId);
  }
}
