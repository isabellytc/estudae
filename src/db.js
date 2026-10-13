// Conexão com o banco PostgreSQL do Neon.
// O endereço do banco vem da variável de ambiente DATABASE_URL
// (arquivo .env no computador, "Environment Variables" na Vercel).
require("dotenv").config();
const { Pool, types } = require("pg");

// Faz o campo DATE (prazo) chegar como texto "2026-10-14", sem mudar o fuso horário.
types.setTypeParser(1082, (valor) => valor);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3, // poucas conexões, ideal para o ambiente serverless da Vercel
});

module.exports = pool;
