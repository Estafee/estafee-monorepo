import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.rentalItem.deleteMany({});
  await prisma.rental.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.item.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('✅ Database cleared');

  // Create sample users
  const password = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      password,
      name: 'John Doe',
      address: 'Jakarta Selatan, Indonesia',
      phoneNumber: '+62812345678',
      bio: "Photography enthusiast and outdoor lover. I rent out my gear when I'm not using it!",
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      balance: 500000,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: {},
    create: {
      email: 'sarah@example.com',
      password,
      name: 'Sarah Wilson',
      address: 'Bandung, Indonesia',
      phoneNumber: '+62823456789',
      bio: 'Tech enthusiast and gadget collector. Love sharing my equipment with the community!',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      balance: 750000,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'mike@example.com' },
    update: {},
    create: {
      email: 'mike@example.com',
      password,
      name: 'Mike Chen',
      address: 'Surabaya, Indonesia',
      phoneNumber: '+62834567890',
      bio: 'Adventure seeker and camping gear expert. Always ready for the next outdoor adventure!',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      balance: 1000000,
    },
  });

  console.log('✅ Created users');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'cameras' },
      update: {},
      create: { name: 'Cameras & Photography', slug: 'cameras' },
    }),
    prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: { name: 'Electronics', slug: 'electronics' },
    }),
    prisma.category.upsert({
      where: { slug: 'camping' },
      update: {},
      create: { name: 'Camping & Outdoor', slug: 'camping' },
    }),
    prisma.category.upsert({
      where: { slug: 'sports' },
      update: {},
      create: { name: 'Sports Equipment', slug: 'sports' },
    }),
    prisma.category.upsert({
      where: { slug: 'tools' },
      update: {},
      create: { name: 'Tools & Hardware', slug: 'tools' },
    }),
  ]);

  console.log('✅ Created categories');

  // Create sample items
  const items = [
    {
      title: 'Canon EOS R6 Camera',
      description:
        'Professional mirrorless camera with 20.1MP full-frame sensor. Perfect for photography and videography. Includes battery and charger.',
      pricePerDay: 250000,
      securityDeposit: 200000,
      stock: 1,
      condition: 'GOOD',
      images: [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
        'https://images.unsplash.com/photo-1606980707749-5832e1aecc15?w=800',
      ],
      ownerId: user1.id,
      categoryIds: [categories[0].id],
    },
    {
      title: 'DJI Mavic Air 2 Drone',
      description:
        '4K camera drone with 34 minutes flight time. Includes 3 batteries, controller, and carrying case. Great for aerial photography and videos.',
      pricePerDay: 300000,
      securityDeposit: 200000,
      stock: 1,
      condition: 'GOOD',
      images: [
        'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800',
        'https://images.unsplash.com/photo-1508614999368-9260051292e5?w=800',
      ],
      ownerId: user1.id,
      categoryIds: [categories[0].id, categories[1].id],
    },
    {
      title: 'MacBook Pro 16" M2',
      description:
        'High-performance laptop for creative work. 32GB RAM, 1TB SSD. Perfect for video editing, design, and development. Includes charger.',
      pricePerDay: 350000,
      securityDeposit: 200000,
      stock: 1,
      condition: 'GOOD',
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
      ],
      ownerId: user2.id,
      categoryIds: [categories[1].id],
    },
    {
      title: 'GoPro Hero 11 Black',
      description:
        'Action camera with 5.3K video and waterproof design. Comes with multiple mounts and accessories. Perfect for adventure sports.',
      pricePerDay: 150000,
      securityDeposit: 200000,
      stock: 2,
      condition: 'GOOD',
      images: [
        'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800',
        'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=800',
      ],
      ownerId: user2.id,
      categoryIds: [categories[0].id, categories[3].id],
    },
    {
      title: '4-Person Camping Tent',
      description:
        'Spacious waterproof tent for family camping. Easy to set up, includes carry bag. Used only twice, excellent condition.',
      pricePerDay: 100000,
      securityDeposit: 200000,
      stock: 1,
      condition: 'GOOD',
      images: [
        'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800',
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
      ],
      ownerId: user3.id,
      categoryIds: [categories[2].id],
    },
    {
      title: 'Sleeping Bag (Cold Weather)',
      description:
        'High-quality sleeping bag rated for -10°C. Lightweight and compact. Perfect for mountain camping and cold weather trips.',
      pricePerDay: 50000,
      securityDeposit: 200000,
      stock: 3,
      condition: 'GOOD',
      images: [
        'https://images.unsplash.com/photo-1520095972714-909e91b038e5?w=800',
      ],
      ownerId: user3.id,
      categoryIds: [categories[2].id],
    },
    {
      title: 'Professional Guitar (Fender Stratocaster)',
      description:
        'Authentic Fender Stratocaster electric guitar. Perfect condition, recently serviced. Includes cable and strap.',
      pricePerDay: 200000,
      securityDeposit: 200000,
      stock: 1,
      condition: 'GOOD',
      images: [
        'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800',
        'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800',
      ],
      ownerId: user1.id,
      categoryIds: [categories[1].id],
    },
    {
      title: 'Portable Generator 3000W',
      description:
        'Reliable portable generator for outdoor events or power outages. Quiet operation, fuel-efficient. Includes extension cord.',
      pricePerDay: 180000,
      securityDeposit: 200000,
      stock: 1,
      condition: 'GOOD',
      images: [
        'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800',
      ],
      ownerId: user2.id,
      categoryIds: [categories[4].id],
    },
    {
      title: 'Mountain Bike (Full Suspension)',
      description:
        'High-end mountain bike with full suspension. 27.5" wheels, 21-speed. Perfect for trail riding. Helmet included.',
      pricePerDay: 150000,
      securityDeposit: 200000,
      stock: 1,
      condition: 'GOOD',
      images: [
        'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800',
        'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=800',
      ],
      ownerId: user3.id,
      categoryIds: [categories[3].id],
    },
    {
      title: 'Sony A7III Camera Body',
      description:
        'Full-frame mirrorless camera with excellent low-light performance. 24.2MP sensor. Body only, perfect for lens collectors.',
      pricePerDay: 200000,
      securityDeposit: 200000,
      stock: 1,
      condition: 'GOOD',
      images: [
        'https://images.unsplash.com/photo-1606980707749-5832e1aecc15?w=800',
      ],
      ownerId: user1.id,
      categoryIds: [categories[0].id],
    },
    {
      title: 'Portable Projector 1080p',
      description:
        'Compact projector for presentations or home theater. 1080p resolution, built-in speakers. Includes HDMI cable and tripod.',
      pricePerDay: 120000,
      securityDeposit: 200000,
      stock: 1,
      condition: 'GOOD',
      images: [
        'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800',
      ],
      ownerId: user2.id,
      categoryIds: [categories[1].id],
    },
    {
      title: 'Power Drill Set (Professional)',
      description:
        'Cordless power drill with 2 batteries and complete bit set. 20V lithium-ion. Great for DIY projects and construction.',
      pricePerDay: 80000,
      securityDeposit: 200000,
      stock: 1,
      condition: 'GOOD',
      images: [
        'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800',
      ],
      ownerId: user3.id,
      categoryIds: [categories[4].id],
    },
  ];

  for (const itemData of items) {
    const { categoryIds, ...itemDetails } = itemData;

    await prisma.item.create({
      data: {
        ...itemDetails,
        categories: {
          connect: categoryIds.map((id) => ({ id })),
        },
      },
    });
  }

  console.log('✅ Created items');
  console.log('🎉 Seed completed successfully!');
  console.log('\n📝 Test credentials:');
  console.log('Email: john@example.com, sarah@example.com, mike@example.com');
  console.log('Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
