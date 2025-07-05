# E-commerce Backend API

A modern Node.js Express backend with PostgreSQL and Prisma ORM for an e-commerce application.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication for users and admins
- **Product Management**: CRUD operations for products with categories
- **Shopping Cart**: Add, update, remove items from cart
- **Wishlist**: Save favorite products
- **Order Management**: Create and manage orders with status tracking
- **Admin Dashboard**: Admin-only endpoints for managing products and orders
- **Security**: Rate limiting, CORS, helmet, input validation
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
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
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📊 Database Schema

The application uses the following main entities:

- **Users**: Customer accounts with authentication
- **AdminUsers**: Admin accounts for managing the store
- **Categories**: Product categories
- **Products**: Product information with images and stock
- **Cart**: Shopping cart items for users
- **Wishlist**: User's favorite products
- **Orders**: Customer orders with status tracking
- **OrderItems**: Individual items within orders

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/register` - Admin registration
- `POST /api/auth/admin/login` - Admin login

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)
- `GET /api/products/categories/all` - Get all categories

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:id` - Update cart item quantity
- `DELETE /api/cart/remove/:id` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist/add` - Add item to wishlist
- `DELETE /api/wishlist/remove/:productId` - Remove item from wishlist
- `GET /api/wishlist/check/:productId` - Check if product is in wishlist

### Orders
- `POST /api/orders/create` - Create new order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `GET /api/orders/admin/all` - Get all orders (Admin only)
- `PUT /api/orders/admin/:id/status` - Update order status (Admin only)
- `GET /api/orders/admin/stats` - Get order statistics (Admin only)

### Health Check
- `GET /api/health` - API health status

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Sample Credentials (after seeding)

**Admin User:**
- Username: `admin`
- Password: `admin123`

**Regular User:**
- Email: `user@example.com`
- Password: `user123`

## 🛡️ Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **Input Validation**: Request validation using express-validator
- **Password Hashing**: bcrypt for secure password storage
- **JWT Tokens**: Secure authentication tokens

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:5173 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## 🚀 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

## 🧪 Testing

The API can be tested using tools like:
- Postman
- Insomnia
- curl commands
- Frontend application

## 📦 Dependencies

### Production Dependencies
- `@prisma/client` - Database ORM
- `express` - Web framework
- `cors` - CORS middleware
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `dotenv` - Environment variables
- `express-validator` - Input validation
- `multer` - File upload handling
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `compression` - Response compression
- `morgan` - HTTP request logging

### Development Dependencies
- `prisma` - Database toolkit
- `nodemon` - Development server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the repository or contact the development team. 