const pool = require('../config/database');

const createTables = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        brand VARCHAR(255),
        category_id INTEGER REFERENCES categories(id),
        stock_quantity INTEGER DEFAULT 0,
        main_image VARCHAR(500),
        images TEXT[], -- Array of image URLs
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Cart table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        size VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id, size)
      )
    `);

    // Wishlist table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `);

    // Orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50),
        shipping_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        size VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Admin users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('All tables created successfully!');
    
    // Insert sample data
    await insertSampleData();
    
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

const insertSampleData = async () => {
  try {
    // Insert categories
    await pool.query(`
      INSERT INTO categories (name, description) VALUES
      ('Shirts', 'Various types of shirts'),
      ('Dresses', 'Elegant dresses for all occasions'),
      ('T-Shirts', 'Casual and comfortable t-shirts'),
      ('Suits', 'Formal suits and blazers'),
      ('Accessories', 'Jewelry and other accessories'),
      ('Jackets', 'Jackets and outerwear')
      ON CONFLICT DO NOTHING
    `);

    // Insert sample products
    const products = [
      {
        name: 'Olive Green Check shirt',
        description: 'Stay effortlessly stylish with this olive green check shirt. The classic check pattern combined with a modern fit makes it ideal for casual outings or layered looks.',
        price: 40.08,
        brand: 'POWERLOOK',
        category_id: 1,
        stock_quantity: 50,
        main_image: 'https://media.powerlook.in/catalog/product/d/p/dp1172021-1.jpg?aio=w-640',
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
        category_id: 2,
        stock_quantity: 30,
        main_image: 'https://img105.savana.com/goods-pic/b049333d32d14e6598bdafa68539827c_w540_h720_q85.webp',
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
        category_id: 3,
        stock_quantity: 75,
        main_image: 'https://image.hm.com/assets/hm/a1/2e/a12e0c0a127637ab1ae51ca74c0bc0e527a390ad.jpg?imwidth=768',
        images: [
          'https://image.hm.com/assets/hm/a1/2e/a12e0c0a127637ab1ae51ca74c0bc0e527a390ad.jpg?imwidth=768',
          'https://d29c1z66frfv6c.cloudfront.net/pub/media/catalog/product/large/510316f9e6819ab4fc07bbb2ad585674c08b7073_xxl-1.jpg'
        ]
      }
    ];

    for (const product of products) {
      await pool.query(`
        INSERT INTO products (name, description, price, brand, category_id, stock_quantity, main_image, images)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT DO NOTHING
      `, [
        product.name,
        product.description,
        product.price,
        product.brand,
        product.category_id,
        product.stock_quantity,
        product.main_image,
        product.images
      ]);
    }

    console.log('Sample data inserted successfully!');
    
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
};

// Run the initialization
createTables().then(() => {
  console.log('Database initialization completed!');
  process.exit(0);
}).catch((error) => {
  console.error('Database initialization failed:', error);
  process.exit(1);
});