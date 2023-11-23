const CompanyPrefixEnum = require("../enums/company-prefix-enum");
const ecommerces = require("../ecommerces");
const {pool} = require("../db/db");
const {prepareData} = require("../utils/utils");
const Product = require("../class/Product");

/**
 * The function `getProducts` retrieves products from an ecommerce store based on a given prefix, processes the products,
 * and returns an array of Product objects.
 * @param req - The `req` parameter is an object that represents the HTTP request made to the server. It contains
 * information such as the request method, headers, query parameters, and request body.
 * @param res - The `res` parameter is the response object. It is used to send the response back to the client.
 * @returns an array of Product objects.
 */
const getProductsPrefix = async (req, res) => {
  const prefix = req.params.prefix;
  const storeConfig = CompanyPrefixEnum[prefix];

  if (!storeConfig) {
    throw new Error('Store not found');
  }
  const products = await ecommerces[prefix].getProducts(req,res);

  await processProducts(products, prefix);

  const productTransform = products.map(product => {
    return new Product(product);
  });

  return {
    success: true,
    message: 'OK',
    result: {
      count: products.length,
      items: productTransform,
    }
  }
};

/**
 * The function `searchProducts` is an asynchronous function that takes in a request and response object, and performs a
 * search query on a database table based on the provided search text, price, and operator. It returns the count and items
 * of the search results.
 * @param req - The `req` parameter is an object that represents the HTTP request made to the server. It contains
 * information such as the request method, headers, query parameters, and body.
 * @param res - The `res` parameter is the response object that is used to send the response back to the client. It
 * contains methods and properties that allow you to control the response, such as setting the status code, headers, and
 * sending the response body.
 * @returns an object with the following properties:
 * - success: a boolean value indicating whether the search was successful or not
 * - message: a string message indicating the status of the search
 * - result: an object containing the count of the search results and an array of items that match the search criteria.
 */
const searchProducts = async (req, res) => {
  const { searchText, price, operator } = req.query;

  let comparisonOperator = '';
  switch (operator) {
    case 'equal':
      comparisonOperator = '=';
      break;
    case 'less':
      comparisonOperator = '<';
      break;
    case 'more':
      comparisonOperator = '>';
      break;
  }
  const textCondition = searchText ? `UPPER(search_text) LIKE UPPER('%${searchText}%')` : '';
  const priceCondition = price ? `${searchText ? 'AND' : ''} price ${comparisonOperator} ${price}` : '';
  const query = `SELECT * FROM products ${(textCondition || priceCondition) ? 'WHERE' : ''} ${textCondition} ${priceCondition}`;
  const results = await pool.query(query);

  return {
    success: true,
    message: 'OK',
    result: {
      count: results.rows.length,
      items: results.rows
    }
  };

};

/**
 * The function `getProduct` retrieves all products from a database and returns them along with a count of the number of
 * products.
 * @param req - The `req` parameter is the request object, which contains information about the incoming HTTP request, such
 * as the request headers, query parameters, and body. It is typically provided by the web framework or server handling the
 * request.
 * @param res - The "res" parameter is the response object that is used to send the response back to the client. It is
 * typically used to set the status code, headers, and send the response body.
 * @returns an object with the following properties:
 * - success: a boolean value indicating whether the operation was successful or not
 * - message: a string message indicating the status of the operation
 * - result: an object containing the count of items returned and an array of items retrieved from the database.
 */
const getProduct = async (req, res) => {
  const query = `SELECT * FROM products`;
  const results = await pool.query(query);
  return {
    success: true,
    message: 'OK',
    result: {
      count: results.rows.length,
      items: results.rows
    }
  };
};

/// -------- Functions for processing products ------- ///

/**
 * The function `getProductByExternalId` retrieves a product from the database based on its external ID, with an optional
 * parameter to specify whether to include only top-level products or all products.
 * @param id - The `id` parameter is the external ID of the product you want to retrieve from the database. It is used in
 * the SQL query to filter the products based on their external ID.
 * @param [init=true] - The `init` parameter is a boolean value that determines whether to include products with a
 * parent_id or not. If `init` is true, the query will only return products with a null parent_id (i.e., products that do
 * not have a parent). If `init` is false, the
 * @returns the first row of the result set from the database query.
 */
async function getProductByExternalId(id, init = true) {
  const query = `SELECT * FROM products WHERE external_id = $1 AND parent_id ${init ? 'IS NULL' : ' IS NOT NULL'}`;
  const res = await pool.query(query, [id]);
  return res.rows[0];
}

/**
 * The function processes a list of products, checking if each product already exists and updating it if it does, or
 * inserting it if it doesn't, and then recursively processes any child items.
 * @param products - An array of product objects. Each product object should have a unique identifier, either as
 * `productId` or `id`.
 * @param prefix - The `prefix` parameter is a string that is used as a prefix for inserting products. It is passed to the
 * `insertProduct` function.
 */
async function processProducts(products, prefix) {
  for (let product of products) {
    const existingProduct = await getProductByExternalId(product?.productId || product?.id);
    if (existingProduct) {
     // await updateProduct(product);
    } else {
      await insertProduct(product, prefix);
    }
    const items = product?.items || product?.variants;
    if (items && items.length > 0) {
      await processChildren(product.items || product.variants, prefix, product?.productId || product?.id);
    }
  }
}

/**
 * The function processes an array of variants, checks if each variant already exists in the database, and either updates
 * the variant or inserts a new variant if it doesn't exist.
 * @param variants - An array of objects representing different product variants. Each variant object should have an "id"
 * or "itemId" property.
 * @param prefix - The `prefix` parameter is a string that is used as a prefix for the product name or identifier. It is
 * used to differentiate products with similar names or identifiers.
 * @param external_id - The `external_id` parameter is an identifier for a product. It is used to retrieve the product from
 * the database using the `getProductByExternalId` function.
 */
async function processChildren(variants, prefix, external_id) {
  const fatherItem = await getProductByExternalId(external_id);
  for (let variant of variants) {
    const id = variant.id || variant.itemId;
    const existingProduct = await getProductByExternalId(id, false);
    if (existingProduct) {
    //   await updateProduct(variant);
    } else {
      const parent_id = fatherItem ? fatherItem.product_id : null;
      await insertProduct(variant, prefix, true, parent_id, fatherItem?.image || '');
    }
  }
}

/**
 * The function `insertProduct` inserts a product into a database table with the provided data.
 * @param product - The `product` parameter is an object that represents the product you want to insert into the database.
 * It should contain properties such as `product_id`, `init`, `external_id`, `search_text`, `name`, `price`, `json_object`,
 * `created_at`, `update_at`, `
 * @param prefix - The `prefix` parameter is a string that represents a prefix for the product. It is used to generate a
 * unique product ID by combining it with the product's external ID.
 * @param [children=false] - The "children" parameter is a boolean value that indicates whether the product has any child
 * products. If set to true, it means the product has child products, and if set to false, it means the product does not
 * have any child products.
 * @param [parent_id=null] - The `parent_id` parameter is used to specify the ID of the parent product if the current
 * product is a child product. If the current product is not a child product, the `parent_id` should be set to `null`.
 * @param [image] - The `image` parameter is a string that represents the image URL or path of the product. It is optional
 * and can be left empty if there is no image associated with the product.
 */
async function insertProduct(product, prefix, children = false, parent_id = null, image = '') {

  const data = await prepareData(product, prefix, children, parent_id, image);
  const query = `
    INSERT INTO products (product_id, parent_id, init, external_id, search_text, name, price, image, json_object, created_at, update_at, sku, store_product_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
  `;
  await pool.query(query, data);
}


module.exports = {
  getProductsPrefix,
  searchProducts,
  getProduct,
};
