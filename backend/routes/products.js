const express = require('express');
const prisma = require('../config/database');
const { authenticateAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 20, offset = 0 } = req.query;
    
    const where = {};
    
    if (category) {
      where.category = {
        name: {
          contains: category,
          mode: 'insensitive'
        }
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            name: true
          }
        }
      },
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total = await prisma.product.count({ where });
    
    res.json({
      products,
      total
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new product (Admin only)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, description, price, brand, categoryId, stockQuantity, mainImage, images } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        brand,
        categoryId: categoryId ? parseInt(categoryId) : null,
        stockQuantity: parseInt(stockQuantity),
        mainImage,
        images: images || []
      },
      include: {
        category: true
      }
    });

    res.status(201).json({
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product (Admin only)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, brand, categoryId, stockQuantity, mainImage, images } = req.body;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        brand,
        categoryId: categoryId ? parseInt(categoryId) : null,
        stockQuantity: parseInt(stockQuantity),
        mainImage,
        images: images || []
      },
      include: {
        category: true
      }
    });

    res.json({
      message: 'Product updated successfully',
      product
    });

  } catch (error) {
    console.error('Error updating product:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete product (Admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Error deleting product:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get categories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 