const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await prisma.cart.deleteMany();
    await prisma.wishlist.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    await prisma.adminUser.deleteMany();

    console.log('✅ Existing data cleared');

    // Create categories
    const categories = await prisma.category.createMany({
      data: [
        {
          name: 'Shirts',
          description: 'Various types of shirts'
        },
        {
          name: 'Dresses',
          description: 'Elegant dresses for all occasions'
        },
        {
          name: 'T-Shirts',
          description: 'Casual and comfortable t-shirts'
        },
        {
          name: 'Suits',
          description: 'Formal suits and blazers'
        },
        {
          name: 'Accessories',
          description: 'Jewelry and other accessories'
        },
        {
          name: 'Jackets',
          description: 'Jackets and outerwear'
        }
      ]
    });

    console.log('✅ Categories created');

    // Get category IDs
    const shirtsCategory = await prisma.category.findFirst({ where: { name: 'Shirts' } });
    const dressesCategory = await prisma.category.findFirst({ where: { name: 'Dresses' } });
    const tshirtsCategory = await prisma.category.findFirst({ where: { name: 'T-Shirts' } });

    // Create sample products
    const products = [
      {
        name: 'Olive Green Check shirt',
        description: 'Stay effortlessly stylish with this olive green check shirt. The classic check pattern combined with a modern fit makes it ideal for casual outings or layered looks.',
        price: 40.08,
        brand: 'POWERLOOK',
        categoryId: shirtsCategory.id,
        stockQuantity: 50,
        mainImage: 'https://media.powerlook.in/catalog/product/d/p/dp1172021-1.jpg?aio=w-640',
        images: [
          'https://media.powerlook.in/catalog/product/d/p/dp1172021-1.jpg?aio=w-640',
          'https://media.powerlook.in/catalog/product/9/1/91172021-1.jpg?aio=w-1080',
          'https://media.powerlook.in/catalog/product/2/1/21172021-1.jpg?aio=w-1080',
          'https://media.powerlook.in/catalog/product/4/1/41172021-1.jpg?aio=w-1080'
        ]
      },
      {
        name: 'Darted Shirt Dress',
        description: 'Designed for modern elegance, this Darted Shirt Dress features tailored darts that flatter your silhouette while offering all-day comfort.',
        price: 58.20,
        brand: 'Savana',
        categoryId: dressesCategory.id,
        stockQuantity: 30,
        mainImage: 'https://img105.savana.com/goods-pic/b049333d32d14e6598bdafa68539827c_w540_h720_q85.webp',
        images: [
          'https://img105.savana.com/goods-pic/b049333d32d14e6598bdafa68539827c_w540_h720_q85.webp',
          'https://images.asos-media.com/products/abercrombie-fitch-draped-satin-shirt-dress-in-mink/205327472-2?$n_640w$&wid=513&fit=constrain'
        ]
      },
      {
        name: 'Oversized printed T-shirts',
        description: 'Stay cool and relaxed with our Oversized Printed T-Shirts. Featuring bold, eye-catching prints and a loose, comfortable fit.',
        price: 34.90,
        brand: 'H&M',
        categoryId: tshirtsCategory.id,
        stockQuantity: 75,
        mainImage: 'https://image.hm.com/assets/hm/a1/2e/a12e0c0a127637ab1ae51ca74c0bc0e527a390ad.jpg?imwidth=768',
        images: [
          'https://image.hm.com/assets/hm/a1/2e/a12e0c0a127637ab1ae51ca74c0bc0e527a390ad.jpg?imwidth=768',
          'https://d29c1z66frfv6c.cloudfront.net/pub/media/catalog/product/large/510316f9e6819ab4fc07bbb2ad585674c08b7073_xxl-1.jpg'
        ]
      },
      {
        name: 'Classic White Oxford Shirt',
        description: 'A timeless classic that never goes out of style. This white Oxford shirt is perfect for both casual and formal occasions.',
        price: 45.00,
        brand: 'Ralph Lauren',
        categoryId: shirtsCategory.id,
        stockQuantity: 40,
        mainImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
        images: [
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'
        ]
      },
      {
        name: 'Summer Floral Dress',
        description: 'Perfect for summer days, this floral dress features a light, breathable fabric and a flattering silhouette.',
        price: 65.00,
        brand: 'Zara',
        categoryId: dressesCategory.id,
        stockQuantity: 25,
        mainImage: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
        images: [
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400'
        ]
      }
    ];

    for (const product of products) {
      await prisma.product.create({
        data: product
      });
    }

    console.log('✅ Products created');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.adminUser.create({
      data: {
        username: 'admin',
        password: hashedPassword
      }
    });

    console.log('✅ Admin user created (username: admin, password: admin123)');

    // Create sample user
    const userPassword = await bcrypt.hash('user123', 10);
    await prisma.user.create({
      data: {
        fullName: 'John Doe',
        email: 'user@example.com',
        password: userPassword
      }
    });

    console.log('✅ Sample user created (email: user@example.com, password: user123)');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample credentials:');
    console.log('Admin - Username: admin, Password: admin123');
    console.log('User - Email: user@example.com, Password: user123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

// Run the seeding
seedDatabase(); 