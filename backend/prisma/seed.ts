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
    { identifier: 'spouse_1', type: 'text' as const },
    { identifier: 'spouse_2', type: 'text' as const },
  ];
  const seededFields: any[] = [];
  for (const f of fieldsData) {
    const res = await prisma.field.upsert({
      where: { identifier: f.identifier },
      update: {},
      create: f,
    });
    seededFields.push(res);
  }

  // 7. Seed Wedding Template
  console.log('Seeding Wedding Template...');
  const weddingEventType = seededEventTypes.find((et) => et.identifier === 'wedding-ceremony');
  if (weddingEventType) {
    const weddingTemplate = await prisma.template.upsert({
      where: { slug: 'wedding-classic' },
      update: {
        event_type_id: weddingEventType.id,
        name: 'Wedding Classic',
        code: 'WEDD',
        price: 49.99,
        status: 'active',
      },
      create: {
        event_type_id: weddingEventType.id,
        name: 'Wedding Classic',
        slug: 'wedding-classic',
        code: 'WEDD',
        price: 49.99,
        status: 'active',
        preview_image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=60',
      },
    });

    console.log('Linking fields to Wedding Template...');
    for (const field of seededFields) {
      const existingLink = await prisma.templateField.findUnique({
        where: {
          template_id_field_id: {
            template_id: weddingTemplate.id,
            field_id: field.id,
          },
        },
      });

      if (!existingLink) {
        await prisma.templateField.create({
          data: {
            template_id: weddingTemplate.id,
            field_id: field.id,
          },
        });
      }
    }
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
