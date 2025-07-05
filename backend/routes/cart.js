const express = require('express');
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            mainImage: true,
            brand: true,
            stockQuantity: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(cartItems);

  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add item to cart
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1, size } = req.body;

    // Check if product exists and has enough stock
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
      select: { stockQuantity: true }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stockQuantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cart.findFirst({
      where: {
        userId,
        productId: parseInt(productId),
        size: size || null
      }
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      
      if (product.stockQuantity < newQuantity) {
        return res.status(400).json({ error: 'Insufficient stock for requested quantity' });
      }

      const updatedItem = await prisma.cart.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              mainImage: true,
              brand: true,
              stockQuantity: true
            }
          }
        }
      });

      res.json({
        message: 'Cart updated successfully',
        item: updatedItem
      });
    } else {
      // Add new item
      const newItem = await prisma.cart.create({
        data: {
          userId,
          productId: parseInt(productId),
          quantity,
          size: size || null
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              mainImage: true,
              brand: true,
              stockQuantity: true
            }
          }
        }
      });

      res.status(201).json({
        message: 'Item added to cart successfully',
        item: newItem
      });
    }

  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update cart item quantity
router.put('/update/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    // Check if cart item belongs to user and get product info
    const cartItem = await prisma.cart.findFirst({
      where: {
        id: parseInt(id),
        userId
      },
      include: {
        product: {
          select: {
            stockQuantity: true
          }
        }
      }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (cartItem.product.stockQuantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const updatedItem = await prisma.cart.update({
      where: { id: parseInt(id) },
      data: { quantity },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            mainImage: true,
            brand: true,
            stockQuantity: true
          }
        }
      }
    });

    res.json({
      message: 'Cart item updated successfully',
      item: updatedItem
    });

  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove item from cart
router.delete('/remove/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deletedItem = await prisma.cart.deleteMany({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (deletedItem.count === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });

  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear entire cart
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.cart.deleteMany({
      where: { userId }
    });

    res.json({ message: 'Cart cleared successfully' });

  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 