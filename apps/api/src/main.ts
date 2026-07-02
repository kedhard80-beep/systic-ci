import { NestFactory } from "@nestjs/core";
import { ValidationPipe, VersioningType, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import compression from "compression";
import { AppModule } from "./app.module";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "verbose", "debug"],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 3001);
  const nodeEnv = configService.get<string>("NODE_ENV", "development");
  const frontendUrl = configService.get<string>("FRONTEND_URL", "http://localhost:3000");

  // ===== GLOBAL PREFIX =====
  app.setGlobalPrefix("api");

  // ===== API VERSIONING =====
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  // ===== SECURITY =====
  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === "production" ? undefined : false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // ===== COMPRESSION =====
  app.use(compression());

  // ===== CORS =====
  app.enableCors({
    origin: nodeEnv === "production"
      ? [frontendUrl, "https://systic.ci", "https://www.systic.ci"]
      : /^http:\/\/localhost:\d+$/,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Tenant-ID", "X-Request-ID"],
  });

  // ===== VALIDATION PIPE =====
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // ===== SWAGGER (dev/staging only) =====
  if (nodeEnv !== "production") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("SYSTIC-CI Platform API")
      .setDescription(
        "API complète de la plateforme digitale SYSTIC-CI — Sécurité Électronique & Informatique\n\n" +
        "## Modules disponibles\n" +
        "- 🔐 **Auth** — JWT, Refresh Token, 2FA, RBAC\n" +
        "- 👤 **Users** — Gestion des utilisateurs et rôles\n" +
        "- 🤝 **CRM** — Clients, prospects, pipeline commercial\n" +
        "- 📋 **Devis** — Création, envoi, signature électronique\n" +
        "- 📄 **Contrats** — Gestion et suivi des contrats\n" +
        "- 💰 **Facturation** — Factures, paiements, relances\n" +
        "- 🔧 **Interventions** — Planning techniciens, rapports\n" +
        "- 📦 **Stock** — Produits et gestion des stocks\n" +
        "- 🎓 **Académie** — Cours, quiz, certificats\n" +
        "- 🎫 **Tickets** — Support client\n" +
        "- 📝 **Blog** — CMS articles\n" +
        "- 🖼️ **Portfolio** — Réalisations\n" +
        "- 🤖 **IA** — Assistant intelligent\n"
      )
      .setVersion("1.0")
      .addServer(`http://localhost:${port}`, "Development")
      .addServer("https://api.systic.ci", "Production")
      .addBearerAuth(
        { type: "http", scheme: "bearer", bearerFormat: "JWT", in: "header" },
        "JWT-auth"
      )
      .addApiKey({ type: "apiKey", in: "header", name: "X-API-Key" }, "API-Key")
      .setContact("SYSTIC-CI Tech", "https://systic.ci", "tech@systic.ci")
      .setLicense("Proprietary", "")
      .addTag("Auth", "Authentification & autorisation")
      .addTag("Users", "Gestion des utilisateurs")
      .addTag("CRM", "Clients & prospects")
      .addTag("Quotes", "Devis")
      .addTag("Contracts", "Contrats")
      .addTag("Invoices", "Facturation")
      .addTag("Projects", "Projets")
      .addTag("Interventions", "Interventions terrain")
      .addTag("Techniciens", "Portail technicien")
      .addTag("Products", "Produits & catalogue")
      .addTag("Stock", "Gestion des stocks")
      .addTag("Academy", "Académie & formations")
      .addTag("Tickets", "Support client")
      .addTag("Blog", "CMS Blog")
      .addTag("Portfolio", "Réalisations")
      .addTag("AI", "Assistant IA")
      .addTag("Dashboard", "Tableaux de bord")
      .addTag("Settings", "Paramètres")
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("docs", app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: "alpha",
        operationsSorter: "alpha",
      },
      customSiteTitle: "SYSTIC-CI API Documentation",
    });

    logger.log(`📚 API Documentation available at http://localhost:${port}/docs`);
  }

  // ===== GRACEFUL SHUTDOWN =====
  app.enableShutdownHooks();

  await app.listen(port);

  logger.log(`🚀 SYSTIC-CI API running on http://localhost:${port}/api/v1`);
  logger.log(`🌍 Environment: ${nodeEnv}`);
  logger.log(`🔗 Frontend: ${frontendUrl}`);
}

bootstrap().catch((err) => {
  console.error("Failed to start application:", err);
  process.exit(1);
});
