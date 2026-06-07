import { PrismaClient, Enum_Role } from '../app/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Usuarios
  await prisma.user.upsert({
    where: { email: 'admin@restaurante.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@restaurante.com',
      password: 'admin123',
      role: Enum_Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@restaurante.com' },
    update: {},
    create: {
      name: 'Usuario',
      email: 'user@restaurante.com',
      password: 'user123',
      role: Enum_Role.USER,
    },
  });

  // Productos
  const count = await prisma.producto.count();
  if (count === 0) {
    await prisma.producto.createMany({
      data: [
        { name: 'Bandeja Paisa', description: 'Frijoles, chicharrón, carne molida, chorizo, morcilla, arroz, huevo y aguacate', price: 28000 },
        { name: 'Ajiaco', description: 'Sopa típica bogotana con pollo, papas y guascas', price: 22000 },
        { name: 'Sancocho de Gallina', description: 'Sopa de gallina criolla con yuca, papa y mazorca', price: 25000 },
        { name: 'Mondongo', description: 'Sopa de tripa con verduras y papa', price: 20000 },
        { name: 'Arroz con Pollo', description: 'Arroz amarillo con pollo y verduras', price: 18000 },
        { name: 'Limonada Natural', description: 'Limonada natural con agua o leche', price: 6000 },
        { name: 'Jugo de Maracuyá', description: 'Jugo natural de maracuyá', price: 6000 },
        { name: 'Agua Panela', description: 'Agua panela con limón', price: 4000 },
      ],
    });
    console.log('Productos creados');
  }

  console.log('Seed completado');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());