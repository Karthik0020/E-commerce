const express = require('express');
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get user's wishlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            mainImage: true,
            brand: true,
            stockQuantity: true,
            description: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(wishlistItems);

  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add item to wishlist
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if item already exists in wishlist
    const existingItem = await prisma.wishlist.findFirst({
      where: {
        userId,
        productId: parseInt(productId)
      }
    });

    if (existingItem) {
      return res.status(400).json({ error: 'Product already in wishlist' });
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId,
        productId: parseInt(productId)
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            mainImage: true,
            brand: true,
            stockQuantity: true,
            description: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Product added to wishlist successfully',
      item: wishlistItem
    });

  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove item from wishlist
router.delete('/remove/:productId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const deletedItem = await prisma.wishlist.deleteMany({
      where: {
        userId,
        productId: parseInt(productId)
      }
    });

    if (deletedItem.count === 0) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }

    res.json({ message: 'Product removed from wishlist successfully' });

  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if product is in wishlist
router.get('/check/:productId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const wishlistItem = await prisma.wishlist.findFirst({
      where: {
        userId,
        productId: parseInt(productId)
      }
    });

    res.json({ inWishlist: !!wishlistItem });

  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 