import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AiService, ChatMessage } from './ai.service';

class ChatMessageDto {
  @IsString() role: 'user' | 'assistant';
  @IsString() content: string;
}

class AiChatDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];

  @IsOptional() @IsString() sessionId?: string;
}

class QuoteSuggestionDto {
  @IsString() projectDescription: string;
}

class SummarizeDto {
  @IsString() text: string;
  @IsString() type: 'contract' | 'report' | 'invoice';
}

@ApiTags('IA')
@Controller('ai')
export class AiController {
  constructor(private readonly svc: AiService) {}

  @Post('chat')
  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 req/min for public chat
  @ApiOperation({ summary: 'Chat with SYSTIC-CI AI assistant (public)' })
  chat(@Body() dto: AiChatDto) {
    return this.svc.chat(dto.messages as ChatMessage[], { sessionId: dto.sessionId });
  }

  @Post('quote-suggestion')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate quote suggestion from project description' })
  quoteSuggestion(@Body() dto: QuoteSuggestionDto) {
    return this.svc.generateQuoteSuggestion(dto.projectDescription).then((message) => ({ message }));
  }

  @Post('summarize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Summarize a document (contract, report, invoice)' })
  summarize(@Body() dto: SummarizeDto) {
    return this.svc.summarizeDocument(dto.text, dto.type).then((message) => ({ message }));
  }
}
