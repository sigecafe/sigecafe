import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPhoneNumbers() {
  try {
    console.log('Fetching all users...');
    const users = await prisma.usuario.findMany();

    console.log(`Found ${users.length} users. Normalizing phone numbers...`);

    for (const user of users) {
      const normalizedPhone = user.celular.replace(/\D/g, '');

      console.log(`Updating user ${user.id} (${user.name}): ${user.celular} -> ${normalizedPhone}`);

      await prisma.usuario.update({
        where: { id: user.id },
        data: { celular: normalizedPhone }
      });
    }

    console.log('All phone numbers have been normalized!');
  } catch (error) {
    console.error('Error normalizing phone numbers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPhoneNumbers();