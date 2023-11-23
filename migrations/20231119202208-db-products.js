'use strict';

const {DataTypes, Sequelize} = require("sequelize");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
      },
      parent_id: {
        type: DataTypes.UUID
      },
      init: {
        type: DataTypes.BOOLEAN,
      },
      external_id: {
        type: DataTypes.STRING,
      },
      search_text: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
      },
      price: {
        type: DataTypes.NUMERIC,
      },
      image: {
        type: DataTypes.STRING,
      },
      json_object: {
        type: DataTypes.JSONB,
      },
      created_at: {
        type: DataTypes.DATE,
      },
      update_at: {
        type: DataTypes.DATE,
      },
      sku: {
        type: DataTypes.STRING,
      },
      store_product_id: {
        type: DataTypes.STRING,
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  }
};
