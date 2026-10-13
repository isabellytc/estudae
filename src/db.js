// Conexão com o banco PostgreSQL do Neon.

require("dotenv").config();
const { Pool, types } = require("pg");

types.setTypeParser(1082, (valor) => valor);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3, 
});

module.exports = pool;
