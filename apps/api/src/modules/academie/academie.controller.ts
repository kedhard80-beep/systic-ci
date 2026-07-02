import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AcademieService, CreateCourseDto } from './academie.service';
import { UserRole } from '@prisma/client';

@ApiTags('Académie')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('academie')
export class AcademieController {
  constructor(private readonly svc: AcademieService) {}

  // ===== PUBLIC =====

  @Get('courses')
  @Public()
  @ApiOperation({ summary: 'Liste des formations' })
  listCourses(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('published') published?: string,
  ) {
    return this.svc.listCourses('default', {
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
      published: published !== undefined ? published === 'true' : true,
    });
  }

  @Get('courses/:id')
  @Public()
  @ApiOperation({ summary: 'Détail formation' })
  getCourse(@Param('id') id: string) {
    return this.svc.getCourse(id, 'default');
  }

  // ===== ADMIN COURSES CRUD =====

  @Get('admin/courses')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.FORMATEUR)
  @ApiOperation({ summary: 'Liste complète des formations (admin)' })
  listAdminCourses(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('published') published?: string,
  ) {
    return this.svc.listCourses(tenantId, {
      page: page ? +page : 1,
      limit: limit ? +limit : 100,
      published: published !== undefined ? published === 'true' : undefined,
    });
  }

  @Post('admin/courses')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.FORMATEUR)
  @ApiOperation({ summary: 'Créer une formation' })
  createCourse(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateCourseDto,
  ) {
    return this.svc.createCourse(tenantId, dto);
  }

  @Patch('admin/courses/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.FORMATEUR)
  @ApiOperation({ summary: 'Modifier une formation' })
  updateCourse(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: Partial<CreateCourseDto>,
  ) {
    return this.svc.updateCourse(id, tenantId, dto);
  }

  @Delete('admin/courses/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  @ApiOperation({ summary: 'Supprimer une formation' })
  deleteCourse(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.svc.deleteCourse(id, tenantId);
  }

  // ===== ENROLLMENTS =====

  @Post('courses/:id/enroll')
  @Roles(UserRole.ETUDIANT, UserRole.CLIENT, UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  @ApiOperation({ summary: "S'inscrire à une formation" })
  enroll(
    @Param('id') courseId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.svc.enrollStudent(courseId, userId, tenantId);
  }

  @Get('enrollments/:id/progress')
  @Roles(UserRole.ETUDIANT, UserRole.FORMATEUR, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Progression étudiant' })
  getProgress(@Param('id') enrollmentId: string, @CurrentUser('id') userId: string) {
    return this.svc.getStudentProgress(enrollmentId, userId);
  }

  @Patch('enrollments/:id/lessons/:lessonId/complete')
  @Roles(UserRole.ETUDIANT)
  @ApiOperation({ summary: 'Marquer une leçon comme terminée' })
  completeLesson(
    @Param('id') enrollmentId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.svc.completeLesson(enrollmentId, lessonId);
  }

  @Post('quiz/:quizId/attempt')
  @Roles(UserRole.ETUDIANT)
  @ApiOperation({ summary: 'Soumettre une tentative de quiz' })
  submitQuiz(
    @Param('quizId') quizId: string,
    @Body() body: { enrollmentId: string; answers: { questionId: string; answer: string }[] },
  ) {
    return this.svc.submitQuizAttempt(quizId, body.enrollmentId, body.answers);
  }

  @Post('enrollments/:id/certificate')
  @Roles(UserRole.ETUDIANT, UserRole.SUPER_ADMIN, UserRole.FORMATEUR)
  @ApiOperation({ summary: 'Générer le certificat de fin de formation' })
  generateCertificate(
    @Param('id') enrollmentId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.svc.generateCertificate(enrollmentId, tenantId);
  }

  // ===== STATS =====

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.FORMATEUR)
  @ApiOperation({ summary: "Statistiques de l'académie" })
  getStats(@CurrentUser('tenantId') tenantId: string) {
    return this.svc.getStats(tenantId);
  }
}
