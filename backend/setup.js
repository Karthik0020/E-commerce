#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 E-commerce Backend Setup');
console.log('============================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN="http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('⚠️  Please update the DATABASE_URL and JWT_SECRET in the .env file');
} else {
  console.log('✅ .env file already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully!');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Generate Prisma client
console.log('\n🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully!');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  console.log('⚠️  Make sure your DATABASE_URL is correct in the .env file');
  process.exit(1);
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Update the DATABASE_URL in .env file with your PostgreSQL connection string');
console.log('2. Run: npm run db:push (to create database tables)');
console.log('3. Run: npm run db:seed (to populate with sample data)');
console.log('4. Run: npm run dev (to start the development server)');
console.log('\n📖 For more information, check the README.md file'); 