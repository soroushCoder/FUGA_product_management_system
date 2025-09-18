import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const items = [
  // Riot Games / related
  { name: 'Arcane: League of Legends (Soundtrack from the Animated Series)', artistName: 'Various Artists', coverUrl: 'https://picsum.photos/seed/seed01/600/600' },
  { name: 'Sessions: Vi', artistName: 'Riot Games Music', coverUrl: 'https://picsum.photos/seed/seed02/600/600' },
  { name: 'Sessions: Diana', artistName: 'Riot Games Music', coverUrl: 'https://picsum.photos/seed/seed03/600/600' },
  { name: 'ALL OUT', artistName: 'K/DA', coverUrl: 'https://picsum.photos/seed/seed04/600/600' },
  { name: 'POP/STARS', artistName: 'K/DA', coverUrl: 'https://picsum.photos/seed/seed05/600/600' },
  { name: 'GIANTS', artistName: 'True Damage', coverUrl: 'https://picsum.photos/seed/seed06/600/600' },
  { name: 'Smite and Ignite', artistName: 'Pentakill', coverUrl: 'https://picsum.photos/seed/seed07/600/600' },
  { name: 'Grasp of the Undying', artistName: 'Pentakill', coverUrl: 'https://picsum.photos/seed/seed08/600/600' },
  { name: 'Lost Chapter', artistName: 'Pentakill', coverUrl: 'https://picsum.photos/seed/seed09/600/600' },

  // Hospital Records (DnB)
  { name: 'High Society', artistName: 'High Contrast', coverUrl: 'https://picsum.photos/seed/seed10/600/600' },
  { name: 'The Agony & The Ecstasy', artistName: 'High Contrast', coverUrl: 'https://picsum.photos/seed/seed11/600/600' },
  { name: 'Are We There Yet?', artistName: 'London Elektricity', coverUrl: 'https://picsum.photos/seed/seed12/600/600' },
  { name: 'Netsky', artistName: 'Netsky', coverUrl: 'https://picsum.photos/seed/seed13/600/600' },
  { name: 'Rave Digger', artistName: 'Danny Byrd', coverUrl: 'https://picsum.photos/seed/seed14/600/600' },
  { name: 'Cross the Line', artistName: 'Camo & Krooked', coverUrl: 'https://picsum.photos/seed/seed15/600/600' },
  { name: 'Fear Not', artistName: 'Logistics', coverUrl: 'https://picsum.photos/seed/seed16/600/600' },
  { name: 'What the Future Holds', artistName: 'S.P.Y', coverUrl: 'https://picsum.photos/seed/seed17/600/600' },
  { name: 'Etherwood', artistName: 'Etherwood', coverUrl: 'https://picsum.photos/seed/seed18/600/600' },
  { name: 'Universal Language', artistName: 'Metrik', coverUrl: 'https://picsum.photos/seed/seed19/600/600' },

  // Epitaph Records
  { name: 'Suffer', artistName: 'Bad Religion', coverUrl: 'https://picsum.photos/seed/seed20/600/600' },
  { name: 'The Process of Belief', artistName: 'Bad Religion', coverUrl: 'https://picsum.photos/seed/seed21/600/600' },
  { name: '...And Out Come the Wolves', artistName: 'Rancid', coverUrl: 'https://picsum.photos/seed/seed22/600/600' },
  { name: 'Smash', artistName: 'The Offspring', coverUrl: 'https://picsum.photos/seed/seed23/600/600' },
  { name: 'About Time', artistName: 'Pennywise', coverUrl: 'https://picsum.photos/seed/seed24/600/600' },
  { name: 'Punk in Drublic', artistName: 'NOFX', coverUrl: 'https://picsum.photos/seed/seed25/600/600' },
  { name: 'From Here to Infirmary', artistName: 'Alkaline Trio', coverUrl: 'https://picsum.photos/seed/seed26/600/600' },
  { name: 'Sempiternal', artistName: 'Bring Me The Horizon', coverUrl: 'https://picsum.photos/seed/seed27/600/600' },
  { name: 'On the Impossible Past', artistName: 'The Menzingers', coverUrl: 'https://picsum.photos/seed/seed28/600/600' },
  { name: 'All Our Gods Have Abandoned Us', artistName: 'Architects', coverUrl: 'https://picsum.photos/seed/seed29/600/600' },

  // 4AD (Beggars Group)
  { name: 'High Violet', artistName: 'The National', coverUrl: 'https://picsum.photos/seed/seed30/600/600' },
  { name: 'Trouble Will Find Me', artistName: 'The National', coverUrl: 'https://picsum.photos/seed/seed31/600/600' },
  { name: 'Heaven or Las Vegas', artistName: 'Cocteau Twins', coverUrl: 'https://picsum.photos/seed/seed32/600/600' },
  { name: 'Doolittle', artistName: 'Pixies', coverUrl: 'https://picsum.photos/seed/seed33/600/600' },
  { name: 'If You Leave', artistName: 'Daughter', coverUrl: 'https://picsum.photos/seed/seed34/600/600' },
  { name: 'Visions', artistName: 'Grimes', coverUrl: 'https://picsum.photos/seed/seed35/600/600' },

  // XL Recordings (Beggars Group)
  { name: '21', artistName: 'Adele', coverUrl: 'https://picsum.photos/seed/seed36/600/600' },
  { name: '25', artistName: 'Adele', coverUrl: 'https://picsum.photos/seed/seed37/600/600' },
  { name: 'In Rainbows', artistName: 'Radiohead', coverUrl: 'https://picsum.photos/seed/seed38/600/600' },
  { name: 'The King of Limbs', artistName: 'Radiohead', coverUrl: 'https://picsum.photos/seed/seed39/600/600' },
  { name: 'The Fat of the Land', artistName: 'The Prodigy', coverUrl: 'https://picsum.photos/seed/seed40/600/600' },
  { name: 'Contra', artistName: 'Vampire Weekend', coverUrl: 'https://picsum.photos/seed/seed41/600/600' },

  // Matador (Beggars Group)
  { name: 'Turn On the Bright Lights', artistName: 'Interpol', coverUrl: 'https://picsum.photos/seed/seed42/600/600' },
  { name: '...Like Clockwork', artistName: 'Queens of the Stone Age', coverUrl: 'https://picsum.photos/seed/seed43/600/600' },
  { name: 'I Can Hear the Heart Beating as One', artistName: 'Yo La Tengo', coverUrl: 'https://picsum.photos/seed/seed44/600/600' },
  { name: 'Crooked Rain, Crooked Rain', artistName: 'Pavement', coverUrl: 'https://picsum.photos/seed/seed45/600/600' },
  { name: 'The Greatest', artistName: 'Cat Power', coverUrl: 'https://picsum.photos/seed/seed46/600/600' },
  { name: 'Smoke Ring for My Halo', artistName: 'Kurt Vile', coverUrl: 'https://picsum.photos/seed/seed47/600/600' },

  // Young / Rough Trade (Beggars family + peers)
  { name: 'xx', artistName: 'The xx', coverUrl: 'https://picsum.photos/seed/seed48/600/600' },
  { name: 'Coexist', artistName: 'The xx', coverUrl: 'https://picsum.photos/seed/seed49/600/600' },
  { name: 'LP1', artistName: 'FKA twigs', coverUrl: 'https://picsum.photos/seed/seed50/600/600' },
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
