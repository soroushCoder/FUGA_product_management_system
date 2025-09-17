import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const items = [
  // Riot Games / OSTs
  { name: 'Arcane: Piltover Nights (Original Soundtrack)', artistName: 'Riot Games Music', coverUrl: 'https://picsum.photos/seed/arcane-ost/600/600' },
  { name: 'Worlds Anthems Collection (LoL Esports)',       artistName: 'Riot Games Music', coverUrl: 'https://picsum.photos/seed/worlds-anthems/600/600' },

  // Hospital Records / DnB
  { name: 'Hospital Records: 2025 Drum & Bass Sampler',    artistName: 'Various Artists',   coverUrl: 'https://picsum.photos/seed/hospital-sampler/600/600' },
  { name: 'Hospitality: Arena Classics',                    artistName: 'Various Artists',   coverUrl: 'https://picsum.photos/seed/hospitality/600/600' },

  // Epitaph / Punk & Alt
  { name: 'Epitaph: Punk Revival 2025',                    artistName: 'Various Artists',   coverUrl: 'https://picsum.photos/seed/epitaph-punk/600/600' },
  { name: 'Epitaph: Alternative Essentials',                artistName: 'Various Artists',   coverUrl: 'https://picsum.photos/seed/epitaph-alt/600/600' },

  // Beggars Group family (4AD, XL, Matador, etc.)
  { name: 'Beggars Group: Indie Discovery Vol. 1',         artistName: 'Various Artists',   coverUrl: 'https://picsum.photos/seed/beggars-indie/600/600' },
  { name: '4AD Sessions Vol. 3',                           artistName: 'Various Artists',   coverUrl: 'https://picsum.photos/seed/4ad-sessions/600/600' },
  { name: 'Matador Records: New Voices',                   artistName: 'Various Artists',   coverUrl: 'https://picsum.photos/seed/matador-voices/600/600' },
  { name: 'XL Recordings: Future Icons',                   artistName: 'Various Artists',   coverUrl: 'https://picsum.photos/seed/xl-icons/600/600' },

  // General “label services” style compilations
  { name: 'Label Services: Global New Releases',           artistName: 'Various Artists',   coverUrl: 'https://picsum.photos/seed/label-services/600/600' },
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
