const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get user's wishlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT w.*, p.name, p.price, p.main_image, p.brand, p.description
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
    `, [userId]);

    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add item to wishlist
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    // Check if product exists
    const productResult = await pool.query('SELECT id FROM products WHERE id = $1', [product_id]);
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if item already exists in wishlist
    const existingItem = await pool.query(
      'SELECT * FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [userId, product_id]
    );

    if (existingItem.rows.length > 0) {
      return res.status(400).json({ error: 'Product already in wishlist' });
    }

    // Add new item
    const result = await pool.query(
      'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) RETURNING *',
      [userId, product_id]
    );

    res.status(201).json({
      message: 'Item added to wishlist successfully',
      item: result.rows[0]
    });

  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove item from wishlist
router.delete('/remove/:product_id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.params;

    const result = await pool.query(
      'DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [userId, product_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }

    res.json({ message: 'Item removed from wishlist successfully' });

  } catch (error) {
    console.error('Error removing wishlist item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;