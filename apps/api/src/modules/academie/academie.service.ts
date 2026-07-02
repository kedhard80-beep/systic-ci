import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StorageService } from '../storage/storage.service';
import { NotificationsService } from '../notifications/notifications.service';

export enum CourseLevel { DEBUTANT = 'DEBUTANT', INTERMEDIAIRE = 'INTERMEDIAIRE', AVANCE = 'AVANCE' }

export class CreateCourseDto {
  @ApiProperty() @IsString() @MinLength(3) title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ enum: CourseLevel }) @IsOptional() @IsEnum(CourseLevel) level?: CourseLevel;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) duration?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) price?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() published?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() thumbnail?: string;
}

@Injectable()
export class AcademieService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly notifications: NotificationsService,
  ) {}

  // ===== COURSES =====

  async listCourses(tenantId: string, params: { page?: number; limit?: number; published?: boolean }) {
    const { page = 1, limit = 20, published } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.CourseWhereInput = {
      tenantId,
      ...(published !== undefined && { published }),
    };

    const [data, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        include: {
          modules: { orderBy: { order: 'asc' } },
          formateur: { include: { user: { select: { firstName: true, lastName: true } } } },
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getCourse(id: string, tenantId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, tenantId },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: { orderBy: { order: 'asc' } },
            quiz: { include: { questions: true } },
          },
        },
        formateur: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) throw new NotFoundException(`Formation ${id} introuvable`);
    return course;
  }

  // ===== ENROLLMENTS =====

  async enrollStudent(courseId: string, studentId: string, tenantId: string) {
    const [course, student] = await Promise.all([
      this.prisma.course.findFirst({ where: { id: courseId, tenantId } }),
      this.prisma.etudiant.findFirst({
        where: { userId: studentId },
      }),
    ]);

    if (!course) throw new NotFoundException('Formation introuvable');
    if (!student) throw new BadRequestException("Profil étudiant introuvable — créez d'abord le profil");

    const existing = await this.prisma.enrollment.findFirst({
      where: { courseId, studentId: student.id },
    });
    if (existing) throw new ConflictException('Déjà inscrit à cette formation');

    const enrollment = await this.prisma.enrollment.create({
      data: {
        courseId,
        studentId: student.id,
        tenantId,
        status: 'ACTIVE',
      },
    });

    await this.notifications.create({
      tenantId,
      userId: studentId,
      type: 'ENROLLMENT_CONFIRMED',
      title: 'Inscription confirmée !',
      body: `Votre inscription à "${course.title}" est confirmée. La formation commence bientôt.`,
      metadata: { courseId, enrollmentId: enrollment.id },
    });

    return enrollment;
  }

  async getStudentProgress(enrollmentId: string, studentId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            modules: {
              include: { lessons: true },
            },
          },
        },
        quizAttempts: {
          orderBy: { startedAt: 'desc' },
          include: { quiz: { select: { title: true, passMark: true } } },
        },
      },
    });
    if (!enrollment) throw new NotFoundException('Inscription introuvable');

    const totalLessons = enrollment.course.modules.reduce(
      (sum, m) => sum + m.lessons.length, 0,
    );
    const completedLessons = (enrollment.completedLessons as string[] | null)?.length ?? 0;
    const progressPct = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    return {
      enrollment,
      progress: { totalLessons, completedLessons, progressPct },
    };
  }

  async completeLesson(enrollmentId: string, lessonId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });
    if (!enrollment) throw new NotFoundException('Inscription introuvable');

    const completed = (enrollment.completedLessons as string[] | null) ?? [];
    if (!completed.includes(lessonId)) {
      completed.push(lessonId);
    }

    return this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { completedLessons: completed },
    });
  }

  // ===== QUIZ =====

  async submitQuizAttempt(
    quizId: string,
    enrollmentId: string,
    answers: { questionId: string; answer: string }[],
  ) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });
    if (!quiz) throw new NotFoundException('Quiz introuvable');

    let score = 0;
    const results = answers.map((a) => {
      const question = quiz.questions.find((q) => q.id === a.questionId);
      const correct = question?.correctAnswer === a.answer;
      if (correct) score++;
      return { questionId: a.questionId, answer: a.answer, correct };
    });

    const totalQuestions = quiz.questions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const passed = percentage >= quiz.passMark;

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        quizId,
        enrollmentId,
        score,
        percentage,
        passed,
        answers: results,
        completedAt: new Date(),
      },
    });

    return { attempt, passed, percentage, passMark: quiz.passMark };
  }

  // ===== CERTIFICATES =====

  async generateCertificate(enrollmentId: string, tenantId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id: enrollmentId, tenantId },
      include: {
        course: true,
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });
    if (!enrollment) throw new NotFoundException('Inscription introuvable');
    if (!enrollment.completedAt) {
      throw new BadRequestException('Formation non terminée');
    }

    const existing = await this.prisma.certificate.findFirst({
      where: { enrollmentId },
    });
    if (existing) return existing;

    const certNumber = `CERT-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;

    const certificate = await this.prisma.certificate.create({
      data: {
        tenantId,
        enrollmentId,
        studentId: enrollment.studentId,
        courseId: enrollment.courseId,
        certNumber,
        issuedAt: new Date(),
        // pdfUrl will be set after PDF generation
      },
    });

    return certificate;
  }

  async createCourse(tenantId: string, dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        tenantId,
        title: dto.title,
        description: dto.description,
        level: (dto.level ?? CourseLevel.DEBUTANT) as any,
        duration: dto.duration,
        price: dto.price ?? 0,
        published: dto.published ?? false,
        thumbnail: dto.thumbnail,
      },
    });
  }

  async updateCourse(id: string, tenantId: string, dto: Partial<CreateCourseDto>) {
    const existing = await this.prisma.course.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Formation introuvable');
    return this.prisma.course.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.level && { level: dto.level as any }),
        ...(dto.duration !== undefined && { duration: dto.duration }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.published !== undefined && { published: dto.published }),
        ...(dto.thumbnail !== undefined && { thumbnail: dto.thumbnail }),
      },
    });
  }

  async deleteCourse(id: string, tenantId: string) {
    const existing = await this.prisma.course.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Formation introuvable');
    await this.prisma.course.delete({ where: { id } });
    return { success: true };
  }

  async getStats(tenantId: string) {
    const [totalCourses, totalEnrollments, totalCertificates, activeStudents] = await Promise.all([
      this.prisma.course.count({ where: { tenantId, published: true } }),
      this.prisma.enrollment.count({ where: { tenantId } }),
      this.prisma.certificate.count({ where: { tenantId } }),
      this.prisma.enrollment.count({ where: { tenantId, status: 'ACTIVE' } }),
    ]);

    return { totalCourses, totalEnrollments, totalCertificates, activeStudents };
  }
}
