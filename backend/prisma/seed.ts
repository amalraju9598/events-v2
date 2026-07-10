import { PrismaClient, UserType } from '../generated/prisma';
import * as bcrypt from 'bcrypt';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const dbUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/project_c';
const connectionString = dbUrl.replace(/^mysql:/, 'mariadb:');
const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding started...');

  // 1. Seed Roles
  const rolesData = [
    { name: 'super_admin' },
    { name: 'user' },
    { name: 'client' },
  ];

  console.log('Seeding roles...');
  const seededRoles: any[] = [];
  for (const role of rolesData) {
    const r = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    seededRoles.push(r);
  }

  // 2. Hash Password for Super Admin
  const superadminEmail = 'superadmin@example.com';
  const superadminUsername = 'superadmin';
  const hashedPassword = await bcrypt.hash('SuperAdminPassword123!', 10);

  // 3. Seed Super Admin User
  console.log('Seeding superadmin user...');
  const superAdminUser = await prisma.user.upsert({
    where: { email: superadminEmail },
    update: {
      password: hashedPassword,
      user_type: UserType.super_admin,
    },
    create: {
      name: 'Super Admin',
      email: superadminEmail,
      username: superadminUsername,
      password: hashedPassword,
      user_type: UserType.super_admin,
    },
  });

  // 4. Assign Super Admin Role to Super Admin User
  const superAdminRole = seededRoles.find((r) => r.name === 'super_admin');
  if (superAdminRole) {
    await prisma.userRole.upsert({
      where: {
        user_id_role_id: {
          user_id: superAdminUser.id,
          role_id: superAdminRole.id,
        },
      },
      update: {},
      create: {
        user_id: superAdminUser.id,
        role_id: superAdminRole.id,
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
