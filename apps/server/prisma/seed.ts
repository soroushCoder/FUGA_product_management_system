import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const items = [
  { name: 'Neon Skies',       artistName: 'Aeris',     coverUrl: 'https://picsum.photos/seed/neon/600/600' },
  { name: 'Midnight Echoes',  artistName: 'Reverb',    coverUrl: 'https://picsum.photos/seed/midnight/600/600' },
  { name: 'Analog Dreams',    artistName: 'Cassette',  coverUrl: 'https://picsum.photos/seed/analog/600/600' },
  { name: 'Golden Era',       artistName: 'Retrograde',coverUrl: 'https://picsum.photos/seed/golden/600/600' },
  { name: 'Lo-Fi Sundays',    artistName: 'Dust Loop', coverUrl: 'https://picsum.photos/seed/lofi/600/600' },
  { name: 'Ocean Tapes',      artistName: 'Pelagic',   coverUrl: 'https://picsum.photos/seed/ocean/600/600' },
  { name: 'City Pop',         artistName: 'Harbor',    coverUrl: 'https://picsum.photos/seed/city/600/600' },
  { name: 'Satellite Love',   artistName: 'Orbiter',   coverUrl: 'https://picsum.photos/seed/satlove/600/600' },
];

async function main() {
  // dev-friendly reset; fine for a take-home
  await prisma.product.deleteMany();
  await prisma.product.createMany({ data: items });
  console.log(`Seeded ${items.length} products`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
