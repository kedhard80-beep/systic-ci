import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Request } from 'express';

const WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request & { user?: any }>();

    if (!WRITE_METHODS.includes(req.method)) return next.handle();
    if (!req.user) return next.handle();

    return next.handle().pipe(
      tap(async () => {
        try {
          await this.prisma.auditLog.create({
            data: {
              userId: req.user.id,
              tenantId: req.user.tenantId,
              action: `${req.method} ${req.path}`,
              entity: req.path.split('/')[3] ?? 'unknown',
              entityId: Array.isArray(req.params?.id) ? req.params.id[0] : req.params?.id,
              ip: req.ip,
              userAgent: req.headers['user-agent'] as string | undefined,
              metadata: req.method !== 'DELETE'
                ? (this.sanitizeBody(req.body) as Prisma.InputJsonObject)
                : undefined,
            },
          });
        } catch (err) {
          this.logger.warn('Audit log failed', err);
        }
      }),
    );
  }

  private sanitizeBody(body: Record<string, unknown>) {
    const SENSITIVE = ['password', 'token', 'secret', 'refreshToken', 'twoFASecret'];
    const safe = { ...body };
    SENSITIVE.forEach((key) => delete safe[key]);
    return safe;
  }
}
