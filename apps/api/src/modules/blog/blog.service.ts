import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { IsArray, IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty() @IsString() @MinLength(5) title: string;
  @ApiProperty() @IsString() @MinLength(10) content: string;
  @ApiPropertyOptional() @IsOptional() @IsString() excerpt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() coverImage?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) categories?: string[];
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() published?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() metaTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() metaDescription?: string;
}

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 80);
  }

  async findAll(
    tenantId: string,
    params: {
      page?: number;
      limit?: number;
      published?: boolean;
      category?: string;
      search?: string;
    },
  ) {
    const { page = 1, limit = 12, published, category, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.BlogPostWhereInput = {
      tenantId,
      ...(published !== undefined && { published }),
      ...(category && { categories: { has: category } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          coverImage: true,
          categories: true,
          tags: true,
          published: true,
          publishedAt: true,
          author: { select: { firstName: true, lastName: true, avatarUrl: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findBySlug(slug: string, tenantId: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { slug, tenantId },
      include: {
        author: { select: { firstName: true, lastName: true, avatarUrl: true } },
        comments: {
          where: { approved: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!post) throw new NotFoundException(`Article "${slug}" introuvable`);

    // Increment views
    await this.prisma.blogPost.update({ where: { id: post.id }, data: { views: { increment: 1 } } });

    return post;
  }

  async create(tenantId: string, authorId: string, dto: CreatePostDto) {
    const slug = this.generateSlug(dto.title);

    const existing = await this.prisma.blogPost.findFirst({ where: { slug, tenantId } });
    if (existing) {
      throw new ConflictException(`Un article avec ce slug existe déjà: ${slug}`);
    }

    return this.prisma.blogPost.create({
      data: {
        tenantId,
        authorId,
        slug,
        title: dto.title,
        content: dto.content,
        excerpt: dto.excerpt ?? dto.content.slice(0, 160),
        coverImage: dto.coverImage,
        categories: dto.categories ?? [],
        tags: dto.tags ?? [],
        published: dto.published ?? false,
        publishedAt: dto.published ? new Date() : null,
        metaTitle: dto.metaTitle ?? dto.title,
        metaDescription: dto.metaDescription ?? dto.excerpt?.slice(0, 160),
        views: 0,
      },
    });
  }

  async update(id: string, tenantId: string, dto: Partial<CreatePostDto>) {
    const post = await this.prisma.blogPost.findFirst({ where: { id, tenantId } });
    if (!post) throw new NotFoundException();

    return this.prisma.blogPost.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.published && !post.published && { publishedAt: new Date() }),
      },
    });
  }

  async delete(id: string, tenantId: string) {
    return this.prisma.blogPost.delete({ where: { id } });
  }

  async getCategories(tenantId: string): Promise<string[]> {
    const posts = await this.prisma.blogPost.findMany({
      where: { tenantId, published: true },
      select: { categories: true },
    });
    const all = posts.flatMap((p) => p.categories as string[]);
    return [...new Set(all)];
  }
}
