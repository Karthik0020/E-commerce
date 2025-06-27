# E-commerce Backend with PostgreSQL

A complete e-commerce backend built with Node.js, Express, and PostgreSQL, integrated with the existing frontend.

## Features

- **User Authentication**: Registration, login, JWT-based authentication
- **Admin Panel**: Separate admin authentication and management
- **Product Management**: CRUD operations for products with categories
- **Shopping Cart**: Add, update, remove items from cart
- **Wishlist**: Save favorite products
- **Order Management**: Create orders, track status, admin order management
- **Database**: PostgreSQL with proper relationships and constraints
- **Security**: Helmet, rate limiting, input validation, password hashing

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

1. Install PostgreSQL on your system
2. Create a new database called `ecommerce_db`
3. Update the `.env` file with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce_db
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

### 3. Initialize Database

Run the database initialization script to create tables and insert sample data:

```bash
npm run init-db
```

### 4. Start the Server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

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
- `DELETE /api/wishlist/remove/:product_id` - Remove item from wishlist

### Orders
- `POST /api/orders/create` - Create new order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `GET /api/orders/admin/all` - Get all orders (Admin only)
- `PUT /api/orders/admin/:id/status` - Update order status (Admin only)

## Database Schema

### Tables
- **users**: User accounts with authentication
- **admin_users**: Admin accounts
- **categories**: Product categories
- **products**: Product catalog with images and details
- **cart**: User shopping carts
- **wishlist**: User wishlists
- **orders**: Order records
- **order_items**: Individual items in orders

## Frontend Integration

The frontend has been updated with:

1. **API Integration**: `api.js` file with all API functions
2. **Updated Login/Register**: Now connects to the backend
3. **Admin Login**: Connects to admin authentication
4. **Token Management**: Automatic token handling for authenticated requests

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- CORS protection
- Helmet security headers
- SQL injection prevention with parameterized queries

## Development

The backend includes:
- Error handling middleware
- Request validation
- Database connection pooling
- Environment-based configuration
- Comprehensive logging

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a production PostgreSQL database
3. Set strong JWT secrets
4. Configure proper CORS origins
5. Use HTTPS in production
6. Set up proper logging and monitoring

## Testing

You can test the API endpoints using tools like Postman or curl. The server includes a health check endpoint at `/api/health`.

## Sample Data

The initialization script includes sample products and categories to get you started. You can modify the `scripts/initDatabase.js` file to add more sample data as needed.