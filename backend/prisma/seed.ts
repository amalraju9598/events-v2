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

  // 5. Seed Event Types
  console.log('Seeding event types...');
  const eventTypesData = [
    { name: 'Birthday Party', identifier: 'birthday-party', description: 'Birthday celebrations' },
    { name: 'Wedding Ceremony', identifier: 'wedding-ceremony', description: 'Wedding celebrations' },
    { name: 'Corporate Event', identifier: 'corporate-event', description: 'Professional corporate events' },
    { name: 'Concert', identifier: 'concert', description: 'Music concert events' },
  ];
  const seededEventTypes: any[] = [];
  for (const et of eventTypesData) {
    const existing = await prisma.eventType.findFirst({
      where: { identifier: et.identifier, user_id: null },
    });
    if (!existing) {
      const res = await prisma.eventType.create({
        data: {
          name: et.name,
          identifier: et.identifier,
          description: et.description,
          user_id: null,
        },
      });
      seededEventTypes.push(res);
    } else {
      seededEventTypes.push(existing);
    }
  }

  // 6. Seed Fields
  console.log('Seeding fields...');
  const fieldsData = [
    { identifier: 'title', type: 'text' as const },
    { identifier: 'banner_image', type: 'image' as const },
    { identifier: 'event_date', type: 'date' as const },
    { identifier: 'detailed_description', type: 'long_text' as const },
    { identifier: 'venue_location', type: 'location' as const },
  ];
  for (const f of fieldsData) {
    await prisma.field.upsert({
      where: { identifier: f.identifier },
      update: {},
      create: f,
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
