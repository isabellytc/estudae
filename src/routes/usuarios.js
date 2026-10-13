const express = require("express");
const pool = require("../db");
const { idValido, textoValido, tratarErro } = require("../util");

const router = express.Router();

// Confere nome e e-mail. Retorna a mensagem de erro, ou null se estiver tudo certo.
function validarUsuario(corpo) {
  if (!textoValido(corpo.nome)) return "O nome é obrigatório.";
  if (!textoValido(corpo.email)) return "O e-mail é obrigatório.";
  if (!/^\S+@\S+\.\S+$/.test(corpo.email.trim())) return "O e-mail é inválido.";
  return null;
}

// LISTAR todos os usuários
router.get("/", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM usuarios ORDER BY nome");
    res.json(resultado.rows);
  } catch (erro) {
    tratarErro(res, erro);
  }
});

// CONSULTAR um usuário pelo ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!idValido(id)) return res.status(400).json({ erro: "ID inválido." });

  try {
    const resultado = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }
    res.json(resultado.rows[0]);
  } catch (erro) {
    tratarErro(res, erro);
  }
});

// CADASTRAR usuário
router.post("/", async (req, res) => {
  const mensagem = validarUsuario(req.body);
  if (mensagem) return res.status(400).json({ erro: mensagem });

  const nome = req.body.nome.trim();
  const email = req.body.email.trim().toLowerCase();

  try {
    const resultado = await pool.query(
      "INSERT INTO usuarios (nome, email) VALUES ($1, $2) RETURNING *",
      [nome, email]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    tratarErro(res, erro);
  }
});

// EDITAR nome e e-mail
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  if (!idValido(id)) return res.status(400).json({ erro: "ID inválido." });

  const mensagem = validarUsuario(req.body);
  if (mensagem) return res.status(400).json({ erro: mensagem });

  const nome = req.body.nome.trim();
  const email = req.body.email.trim().toLowerCase();

  try {
    const resultado = await pool.query(
      "UPDATE usuarios SET nome = $1, email = $2 WHERE id = $3 RETURNING *",
      [nome, email, id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }
    res.json(resultado.rows[0]);
  } catch (erro) {
    tratarErro(res, erro);
  }
});

// EXCLUIR usuário
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!idValido(id)) return res.status(400).json({ erro: "ID inválido." });

  try {
    const resultado = await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }
    res.status(204).send();
  } catch (erro) {
    tratarErro(res, erro);
  }
});

module.exports = router;
