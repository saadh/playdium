import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create achievements
  const achievements = [
    // Garden achievements
    { key: 'garden_first_plant', name: 'First Seed', description: 'Plant your first seed', iconUrl: '/assets/achievements/first-seed.png', category: 'garden', points: 10, isShared: false, requirement: { action: 'plant', count: 1 } },
    { key: 'garden_10_plants', name: 'Budding Gardener', description: 'Plant 10 seeds', iconUrl: '/assets/achievements/budding-gardener.png', category: 'garden', points: 25, isShared: false, requirement: { action: 'plant', count: 10 } },
    { key: 'garden_50_plants', name: 'Green Thumb', description: 'Plant 50 seeds', iconUrl: '/assets/achievements/green-thumb.png', category: 'garden', points: 50, isShared: false, requirement: { action: 'plant', count: 50 } },
    { key: 'garden_first_water_partner', name: 'Helping Hand', description: 'Water your partner\'s plant for the first time', iconUrl: '/assets/achievements/helping-hand.png', category: 'garden', points: 15, isShared: false, requirement: { action: 'water_partner', count: 1 } },
    { key: 'garden_first_gift', name: 'Gift Giver', description: 'Send your first gift', iconUrl: '/assets/achievements/gift-giver.png', category: 'garden', points: 20, isShared: false, requirement: { action: 'send_gift', count: 1 } },
    { key: 'garden_level_5', name: 'Garden Masters', description: 'Reach garden level 5 together', iconUrl: '/assets/achievements/garden-masters.png', category: 'garden', points: 100, isShared: true, requirement: { garden_level: 5 } },

    // Doodle achievements
    { key: 'doodle_first_drawing', name: 'First Stroke', description: 'Complete your first drawing', iconUrl: '/assets/achievements/first-stroke.png', category: 'doodle', points: 10, isShared: false, requirement: { action: 'draw', count: 1 } },
    { key: 'doodle_10_drawings', name: 'Aspiring Artist', description: 'Complete 10 drawings', iconUrl: '/assets/achievements/aspiring-artist.png', category: 'doodle', points: 25, isShared: false, requirement: { action: 'draw', count: 10 } },
    { key: 'doodle_first_guess', name: 'Mind Reader', description: 'Guess a drawing correctly', iconUrl: '/assets/achievements/mind-reader.png', category: 'doodle', points: 15, isShared: false, requirement: { action: 'guess_correct', count: 1 } },
    { key: 'doodle_gallery_10', name: 'Art Collectors', description: 'Save 10 drawings to your gallery', iconUrl: '/assets/achievements/art-collectors.png', category: 'doodle', points: 30, isShared: true, requirement: { gallery_count: 10 } },

    // Treasure achievements
    { key: 'treasure_first_find', name: 'Treasure Hunter', description: 'Find your first treasure', iconUrl: '/assets/achievements/treasure-hunter.png', category: 'treasure', points: 10, isShared: false, requirement: { action: 'find_treasure', count: 1 } },
    { key: 'treasure_first_hide', name: 'Secret Keeper', description: 'Hide a treasure for your partner', iconUrl: '/assets/achievements/secret-keeper.png', category: 'treasure', points: 15, isShared: false, requirement: { action: 'hide_treasure', count: 1 } },
    { key: 'treasure_world_complete', name: 'Explorers', description: 'Complete an entire world together', iconUrl: '/assets/achievements/explorers.png', category: 'treasure', points: 100, isShared: true, requirement: { world_complete: true } },
    { key: 'treasure_collection_50', name: 'Collectors', description: 'Collect 50 items together', iconUrl: '/assets/achievements/collectors.png', category: 'treasure', points: 50, isShared: true, requirement: { collection_count: 50 } },

    // General achievements
    { key: 'general_first_voice', name: 'Voice Message', description: 'Send your first voice message', iconUrl: '/assets/achievements/voice-message.png', category: 'general', points: 10, isShared: false, requirement: { action: 'voice_message', count: 1 } },
    { key: 'general_week_streak', name: 'Week Warriors', description: 'Play together 7 days in a row', iconUrl: '/assets/achievements/week-warriors.png', category: 'general', points: 50, isShared: true, requirement: { streak_days: 7 } },
    { key: 'general_all_games', name: 'Game Masters', description: 'Play all three games', iconUrl: '/assets/achievements/game-masters.png', category: 'general', points: 25, isShared: true, requirement: { games_played: ['garden', 'doodle', 'treasure'] } },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
  }

  console.log(`Created ${achievements.length} achievements`);

  // Create word bank for Doodle Duo
  const wordCategories = {
    animals: ['cat', 'dog', 'elephant', 'giraffe', 'lion', 'monkey', 'penguin', 'rabbit', 'snake', 'tiger', 'bear', 'bird', 'butterfly', 'cow', 'crocodile', 'deer', 'dolphin', 'duck', 'eagle', 'fish', 'fox', 'frog', 'horse', 'kangaroo', 'koala', 'octopus', 'owl', 'panda', 'parrot', 'pig', 'shark', 'sheep', 'spider', 'squirrel', 'turtle', 'whale', 'wolf', 'zebra', 'bee', 'chicken'],
    food: ['apple', 'banana', 'bread', 'burger', 'cake', 'candy', 'carrot', 'cheese', 'cherry', 'chocolate', 'cookie', 'donut', 'egg', 'grapes', 'hamburger', 'hotdog', 'ice cream', 'lemon', 'orange', 'pancake', 'pear', 'pie', 'pizza', 'popcorn', 'potato', 'rice', 'salad', 'sandwich', 'soup', 'spaghetti', 'strawberry', 'sushi', 'taco', 'tomato', 'watermelon', 'broccoli', 'corn', 'cupcake', 'mushroom', 'onion'],
    objects: ['airplane', 'ball', 'balloon', 'bed', 'bell', 'bicycle', 'book', 'bottle', 'box', 'camera', 'car', 'chair', 'clock', 'computer', 'cup', 'door', 'drum', 'flag', 'flower', 'guitar', 'hat', 'house', 'key', 'kite', 'lamp', 'moon', 'phone', 'piano', 'rocket', 'scissors', 'shirt', 'shoe', 'star', 'sun', 'table', 'train', 'tree', 'umbrella', 'watch', 'window'],
    actions: ['climbing', 'cooking', 'dancing', 'diving', 'drawing', 'drinking', 'eating', 'fishing', 'flying', 'hiding', 'jumping', 'laughing', 'painting', 'playing', 'reading', 'running', 'singing', 'skating', 'sleeping', 'smiling', 'surfing', 'swimming', 'walking', 'waving', 'writing'],
    fantasy: ['castle', 'crown', 'dragon', 'fairy', 'giant', 'knight', 'magic wand', 'mermaid', 'monster', 'pirate', 'princess', 'rainbow', 'robot', 'superhero', 'treasure chest', 'unicorn', 'vampire', 'witch', 'wizard', 'zombie'],
    science: ['astronaut', 'atom', 'beaker', 'brain', 'crystal', 'dinosaur', 'DNA', 'earth', 'electricity', 'experiment', 'fossil', 'galaxy', 'laboratory', 'magnet', 'microscope', 'molecule', 'moon', 'planet', 'robot', 'satellite', 'skeleton', 'solar system', 'spaceship', 'telescope', 'volcano'],
  };

  let wordCount = 0;
  for (const [category, words] of Object.entries(wordCategories)) {
    for (const word of words) {
      await prisma.wordBank.upsert({
        where: { word_category: { word, category } },
        update: {},
        create: {
          word,
          category,
          difficulty: category === 'fantasy' || category === 'science' ? 2 : 1,
        },
      });
      wordCount++;
    }
  }

  console.log(`Created ${wordCount} words in word bank`);

  // Create game worlds for Treasure Hunters
  const worlds = [
    {
      gameType: 'treasure',
      worldKey: 'enchanted_forest',
      name: 'Enchanted Forest',
      description: 'A magical forest filled with ancient trees and hidden wonders',
      thumbnailUrl: '/assets/worlds/enchanted-forest.png',
      mapData: {
        areas: [
          { id: 'clearing', name: 'Forest Clearing', x: 0, y: 0 },
          { id: 'old_oak', name: 'The Old Oak', x: 100, y: -50 },
          { id: 'mushroom_ring', name: 'Mushroom Ring', x: -80, y: 60 },
          { id: 'crystal_cave', name: 'Crystal Cave', x: 150, y: 80 },
          { id: 'fairy_glen', name: 'Fairy Glen', x: -120, y: -70 },
        ],
      },
      items: {
        common: ['golden_acorn', 'forest_gem', 'ancient_key', 'silver_feather'],
        rare: ['enchanted_map_piece', 'fairy_dust', 'dragon_scale'],
        legendary: ['heart_of_forest'],
      },
      puzzles: [
        { id: 'mushroom_sequence', type: 'pattern', difficulty: 1 },
        { id: 'crystal_beams', type: 'light_puzzle', difficulty: 2, requiresBoth: true },
        { id: 'oak_riddle', type: 'cipher', difficulty: 2 },
      ],
      unlockRequirement: null,
      sortOrder: 1,
    },
    {
      gameType: 'treasure',
      worldKey: 'sunken_ship',
      name: 'Sunken Ship',
      description: 'Explore the mysterious depths of an ancient pirate vessel',
      thumbnailUrl: '/assets/worlds/sunken-ship.png',
      mapData: {
        areas: [
          { id: 'deck', name: 'Main Deck', x: 0, y: 0 },
          { id: 'captains_quarters', name: 'Captain\'s Quarters', x: 50, y: -80 },
          { id: 'cargo_hold', name: 'Cargo Hold', x: -60, y: 60 },
          { id: 'treasure_room', name: 'Treasure Room', x: 100, y: 50 },
          { id: 'crow_nest', name: 'Crow\'s Nest', x: 0, y: -120 },
          { id: 'underwater_cave', name: 'Underwater Cave', x: -100, y: -30 },
        ],
      },
      items: {
        common: ['gold_coin', 'pearl', 'old_compass', 'silver_chalice'],
        rare: ['captains_log', 'treasure_map_piece', 'magic_shell'],
        legendary: ['pirates_crown'],
      },
      puzzles: [
        { id: 'compass_puzzle', type: 'sequence', difficulty: 1 },
        { id: 'pressure_plates', type: 'cooperation', difficulty: 2, requiresBoth: true },
        { id: 'treasure_lock', type: 'combination', difficulty: 3 },
        { id: 'water_level', type: 'lever_puzzle', difficulty: 2 },
      ],
      unlockRequirement: { world: 'enchanted_forest', progress: 50 },
      sortOrder: 2,
    },
    {
      gameType: 'treasure',
      worldKey: 'crystal_caves',
      name: 'Crystal Caves',
      description: 'Venture into sparkling caverns of ancient crystals',
      thumbnailUrl: '/assets/worlds/crystal-caves.png',
      mapData: {
        areas: [
          { id: 'entrance', name: 'Cave Entrance', x: 0, y: 0 },
          { id: 'crystal_hall', name: 'Crystal Hall', x: 80, y: -40 },
          { id: 'underground_lake', name: 'Underground Lake', x: -70, y: 50 },
          { id: 'gem_gallery', name: 'Gem Gallery', x: 120, y: 60 },
          { id: 'echo_chamber', name: 'Echo Chamber', x: -100, y: -60 },
          { id: 'lava_bridge', name: 'Lava Bridge', x: 0, y: 120 },
          { id: 'ancient_shrine', name: 'Ancient Shrine', x: 150, y: 130 },
        ],
      },
      items: {
        common: ['crystal_shard', 'glowing_stone', 'cave_pearl', 'mineral_sample'],
        rare: ['rainbow_crystal', 'ancient_fossil', 'glowing_mushroom'],
        legendary: ['heart_crystal'],
      },
      puzzles: [
        { id: 'crystal_harmony', type: 'sound', difficulty: 2, requiresBoth: true },
        { id: 'bridge_crossing', type: 'cooperation', difficulty: 3, requiresBoth: true },
        { id: 'gem_matching', type: 'pattern', difficulty: 2 },
        { id: 'light_reflection', type: 'light_puzzle', difficulty: 3 },
        { id: 'shrine_riddles', type: 'cipher', difficulty: 3 },
      ],
      unlockRequirement: { world: 'sunken_ship', progress: 75 },
      sortOrder: 3,
    },
  ];

  for (const world of worlds) {
    await prisma.gameWorld.upsert({
      where: { worldKey: world.worldKey },
      update: world,
      create: world,
    });
  }

  console.log(`Created ${worlds.length} game worlds`);

  // Create demo users (only in development)
  if (process.env.NODE_ENV === 'development') {
    const passwordHash = await bcrypt.hash('demo1234', 12);

    const user1 = await prisma.user.upsert({
      where: { email: 'parent@demo.com' },
      update: {},
      create: {
        email: 'parent@demo.com',
        passwordHash,
        username: 'demoparent',
        displayName: 'Demo Parent',
        emailVerified: true,
        isChild: false,
      },
    });

    const user2 = await prisma.user.upsert({
      where: { email: 'child@demo.com' },
      update: {},
      create: {
        email: 'child@demo.com',
        passwordHash,
        username: 'demochild',
        displayName: 'Demo Child',
        emailVerified: true,
        isChild: true,
        dateOfBirth: new Date('2015-01-01'),
      },
    });

    // Create demo partnership
    const existingPartnership = await prisma.partnership.findFirst({
      where: {
        OR: [
          { user1Id: user1.id, user2Id: user2.id },
          { user1Id: user2.id, user2Id: user1.id },
        ],
      },
    });

    if (!existingPartnership) {
      const partnership = await prisma.partnership.create({
        data: {
          user1Id: user1.id,
          user2Id: user2.id,
          inviteCode: 'DEMO-ABCD-1234',
          status: 'ACTIVE',
          acceptedAt: new Date(),
        },
      });

      // Create shared garden
      await prisma.sharedGarden.create({
        data: {
          partnershipId: partnership.id,
          name: 'Demo Garden',
        },
      });

      // Create treasure map
      await prisma.treasureMap.create({
        data: {
          partnershipId: partnership.id,
        },
      });

      // Create doodle gallery
      await prisma.doodleGallery.create({
        data: {
          partnershipId: partnership.id,
        },
      });

      console.log('Created demo users and partnership');
    }
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
