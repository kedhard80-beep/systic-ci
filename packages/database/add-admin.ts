/**
 * Script one-shot : ajoute akarosine08@gmail.com comme Super Admin
 * Usage: DATABASE_URL="postgresql://systic_user:systic_pass_dev@localhost:5432/systic_ci?schema=public" npx ts-node --transpile-only add-admin.ts
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) throw new Error("Aucun tenant trouvé — relance le seed d'abord");

  const email = 'akarosine08@gmail.com';
  const password = 'Test@Systic2024!';
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'SUPER_ADMIN', isActive: true, isVerified: true },
    create: {
      email,
      passwordHash,
      firstName: 'Admin',
      lastName: 'SYSTIC-CI',
      role: 'SUPER_ADMIN',
      tenantId: tenant.id,
      isActive: true,
      isVerified: true,
    },
  });

  console.log(`✅ Super Admin créé : ${user.email}`);
  console.log(`   Mot de passe    : ${password}`);

  const updated = await prisma.user.updateMany({
    where: { email: 'admin@systic.ci' },
    data: { passwordHash },
  });
  if (updated.count > 0) console.log('✅ admin@systic.ci sync OK');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
