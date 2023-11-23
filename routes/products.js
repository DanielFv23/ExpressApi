const express = require('express');
const router = express.Router();
const productService = require('../services/products');

/* GET products listing. */
router.get('/search/:prefix', async function (req, res, next) {
  try {
    const product = await productService.getProductsPrefix(req, res);
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/search', async function (req, res, next) {
  try {
    const product = await productService.searchProducts(req, res);
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async function (req, res, next) {
  try {
    const product = await productService.getProduct(req, res);
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

