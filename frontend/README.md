# E-Commerce Frontend

A modern e-commerce frontend built with HTML, CSS, and JavaScript, connected to a Node.js Express backend with PostgreSQL database.

## Features

- ✅ **User Authentication**: Login, registration, and session management
- ✅ **Product Management**: Dynamic product loading from database
- ✅ **Shopping Cart**: Add, remove, and update cart items
- ✅ **Wishlist**: Add/remove products to wishlist
- ✅ **Product Details**: Detailed product pages with image galleries
- ✅ **Responsive Design**: Mobile-friendly interface
- ✅ **Real-time Updates**: Cart count and authentication status
- ✅ **Error Handling**: Comprehensive error messages and loading states

## Project Structure

```
frontend/
├── index.html              # Home page with featured products
├── products-dynamic.html   # Products listing page (API-driven)
├── product-details.html    # Individual product details
├── cart-dynamic.html       # Shopping cart page
├── wishlist.html          # Wishlist page
├── login.html             # User login
├── register.html          # User registration
├── api.js                 # API utilities and functions
├── style.css              # Main stylesheet
├── server.js              # Express backend server
├── routes/                # API route handlers
│   ├── auth.js           # Authentication routes
│   ├── products.js       # Product routes
│   ├── cart.js          # Cart routes
│   ├── wishlist.js      # Wishlist routes
│   └── orders.js        # Order routes
├── config/
│   └── database.js       # Database configuration
├── middleware/
│   └── auth.js          # Authentication middleware
└── scripts/
    └── initDatabase.js   # Database initialization
```

## Setup Instructions

### Prerequisites

1. **Node.js** (v14 or higher)
2. **PostgreSQL** (v12 or higher)
3. **Git**

### 1. Database Setup

First, ensure PostgreSQL is running and create a database:

```sql
CREATE DATABASE ecommerce_db;
```

### 2. Environment Configuration

Create a `.env` file in the frontend directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://localhost:5500,http://127.0.0.1:5500
```

### 3. Install Dependencies

```bash
cd frontend
npm install
```

### 4. Initialize Database

```bash
npm run init-db
```

This will create all necessary tables and insert sample data.

### 5. Start the Backend Server

```bash
npm start
```

The backend will start on `http://localhost:3000`

### 6. Start the Frontend

You can serve the frontend using any HTTP server. Here are a few options:

**Option 1: Using Python (if installed)**
```bash
# Python 3
python -m http.server 5173

# Python 2
python -m SimpleHTTPServer 5173
```

**Option 2: Using Node.js http-server**
```bash
npx http-server -p 5173
```

**Option 3: Using Live Server (VS Code extension)**
- Install the "Live Server" extension in VS Code
- Right-click on `index.html` and select "Open with Live Server"

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/categories/all` - Get all categories

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:id` - Update cart item quantity
- `DELETE /api/cart/remove/:id` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist/add` - Add item to wishlist
- `DELETE /api/wishlist/remove/:id` - Remove item from wishlist
- `GET /api/wishlist/check/:id` - Check if item is in wishlist

### Orders
- `POST /api/orders/create` - Create new order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID

## Usage

### For Users

1. **Browse Products**: Visit the home page or products page to see available items
2. **Register/Login**: Create an account or login to access cart and wishlist features
3. **Add to Cart**: Click the cart icon on any product to add it to your cart
4. **View Cart**: Click the cart icon in the header to view and manage your cart
5. **Add to Wishlist**: Click the heart icon to add products to your wishlist
6. **Checkout**: Proceed to checkout from the cart page

### For Developers

The frontend uses a modular API system (`api.js`) that provides:

- **Authentication management**: Login, logout, token handling
- **Product operations**: Fetch products, categories
- **Cart operations**: Add, update, remove items
- **Wishlist operations**: Add, remove, check items
- **Error handling**: Comprehensive error messages
- **Loading states**: User feedback during operations

## Key Features

### Dynamic Product Loading
- Products are loaded from the database via API
- Real-time search and filtering
- Category-based filtering
- Responsive product grid

### Authentication System
- JWT-based authentication
- Automatic token refresh
- Session management
- Protected routes

### Shopping Cart
- Persistent cart data
- Real-time quantity updates
- Cart count display
- Remove items functionality

### Wishlist
- Add/remove products
- Visual feedback
- Persistent storage

### Error Handling
- Network error handling
- User-friendly error messages
- Loading states
- Retry mechanisms

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify database exists

2. **CORS Errors**
   - Check CORS_ORIGIN in `.env`
   - Ensure frontend URL is included in allowed origins

3. **JWT Errors**
   - Verify JWT_SECRET is set in `.env`
   - Check token expiration

4. **Port Already in Use**
   - Change PORT in `.env` or kill existing process
   - Use `lsof -i :3000` to find process using port

### Debug Mode

To enable debug logging, set `NODE_ENV=development` in your `.env` file.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.