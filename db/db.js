const Sequelize = require('sequelize');
const { Pool } = require('pg');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: '123456',
  database: 'postgres',
  define: {
    timestamps: false,
  },
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
    acquire: 30000,
    evict: 10000,
    handleDisconnects: true,
    validate: (client) => {
      return client.query('SELECT 1')
        .then(() => true)
        .catch(() => false);
    },
  },
});

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '123456',
  port: 5432,
});

module.exports = {
  sequelize,
  pool,
};
