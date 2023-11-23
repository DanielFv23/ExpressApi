const CompanyPrefixEnum = require("../enums/company-prefix-enum");
const { v4: uuidv4 } = require('uuid');

/**
 * The function prepares data based on the product, type, children, parent_id, and image parameters.
 * @param product - The `product` parameter is an object that contains information about a product. It may have different
 * properties depending on the platform (e.g., VTEX or Shopify) and whether it is a parent or child product.
 * @param type - The `type` parameter is used to determine the type of product platform. It can have two possible values:
 * `CompanyPrefixEnum.vtex` or `CompanyPrefixEnum.shopify`.
 * @param children - A boolean value indicating whether the product has children or not.
 * @param parent_id - The `parent_id` parameter is the ID of the parent product. It is used when the `children` parameter
 * is `true`, indicating that the product is a variant or child product of a parent product.
 * @param image - The `image` parameter is the URL of the product image.
 * @returns an array of values based on the conditions specified in the if-else statements. The specific values returned
 * depend on the values of the parameters `product`, `type`, `children`, `parent_id`, and `image`.
 */
async function prepareData(product, type, children, parent_id, image) {
  if (type === CompanyPrefixEnum.vtex) {
    if (children) {
      return [
        uuidv4(),
        parent_id,
        false,
        product.itemId,
        product.name,
        product.name,
        Number(product.sellers[0]?.commertialOffer?.Price),
        product.images[0]?.imageUrl,
        JSON.stringify(product),
        new Date(),
        new Date(),
        null,
        product.itemId,
      ];
    } else {
      return [
        uuidv4(),
        null,
        true,
        product.productId,
        product.productName,
        product.productName,
        null,
        product.items[0]?.images[0]?.imageUrl,
        JSON.stringify(product),
        new Date(),
        new Date(),
        null,
        product.productId,
      ];
    }
  }
  else if (type === CompanyPrefixEnum.shopify) {
    if (children) {
      return [
        uuidv4(),
        parent_id,
        false,
        product.id,
        product.title,
        product.title,
        Number(product.price),
        image,
        JSON.stringify(product),
        new Date(),
        new Date(),
        product.sku,
        product.id,
      ];
    } else {
      return [
        uuidv4(),
        null,
        true,
        product.id,
        product.title,
        product.title,
        null,
        product?.image?.src,
        JSON.stringify(product),
        new Date(),
        new Date(),
        null,
        product.id,
      ];
    }
  }
  else {
    return [];
  }
}

module.exports = {
  prepareData
};
