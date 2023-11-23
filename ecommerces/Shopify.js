const axios = require('axios');

const getProducts = async () => {

  const response = await axios
    .get(`https://${process.env.SHOPIFY_SHOP}.myshopify.com/admin/api/2023-10/products.json`, {
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_PASSWORD,
      },
    })

  return response.data?.products || [];
};

module.exports = {
  getProducts,
};
