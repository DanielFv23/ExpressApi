const { v4: uuidv4 } = require('uuid');

class Product {
    constructor(info) {
        this.external_id = info.id || info.productId
        this.product_id = uuidv4();
        this.sku = info.id || info.productId;
        this.image = info?.image?.src || info.items[0]?.images[0]?.imageUrl || '';
        this.name = info.title || info.name || info.productName || '';
        this.short_description = info.title || info.name || info.productName || '';
        this.long_description = info.title || info.name || info.productName || '';
        this.price = info.price || 0;
        this.variants = transformVariant(info.variants || info.items || [], info.options || []);
    }
}
module.exports = Product;


/**
 * The function "transformVariant" takes a variant object and an options array as parameters, and returns an array of
 * transformed variant objects with specific properties extracted from the input variant object.
 * @param variant - The `variant` parameter is an array of objects representing different variants of a product. Each
 * variant object contains properties such as `id`, `itemId`, `inventory_quantity`, `sellers`, `commertialOffer`, `title`,
 * `name`, `price`, etc.
 * @param options - The `options` parameter is an array of objects that represent the different options for the variant.
 * Each object in the array should have the following properties:
 * @returns an array of transformed variant objects.
 */
function transformVariant(variant, options) {
    return variant.map(variant => {
        return {
            legacyResourceId: variant.id || variant.itemId,
            inventoryQuantity: variant.inventory_quantity ?? variant?.sellers[0]?.commertialOffer?.AvailableQuantity ??  0,
            selectOptions: options.map(option => {
                return {
                    name: option.name || '',
                    value: option?.values[0] || '',
                }
            }),
            displayName: variant.title || variant.name || '',
            price: variant.price || variant?.sellers[0]?.commertialOffer?.Price || 0,
        };
    });
}
