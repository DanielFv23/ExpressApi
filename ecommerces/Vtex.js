const axios = require('axios');

const getProducts = async () => {

  const response = await axios.get(`https://${process.env.VTEX_ACCOUNT_NAME}.vtexcommercestable.com.br/api/catalog_system/pub/products/search`, {
    headers: {
      'Accept': 'application/json',
      'X-VTEX-API-AppKey': process.env.VTEX_APP_KEY,
      'X-VTEX-API-AppToken': process.env.VTEX_APP_TOKEN
    }
  });
  return response.data;
};

module.exports = {
  getProducts,
};
