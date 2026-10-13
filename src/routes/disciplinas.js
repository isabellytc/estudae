const express = require("express");
const pool = require("../db");
const { idValido, textoValido, tratarErro } = require("../util");

const router = express.Router();

// LISTAR todas as disciplinas
router.get("/", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM disciplinas ORDER BY nome");
    res.json(resultado.rows);
  } catch (erro) {
    tratarErro(res, erro);
  }
});

// CONSULTAR uma disciplina pelo ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!idValido(id)) return res.status(400).json({ erro: "ID inválido." });

  try {
    const resultado = await pool.query("SELECT * FROM disciplinas WHERE id = $1", [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Disciplina não encontrada." });
    }
    res.json(resultado.rows[0]);
  } catch (erro) {
    tratarErro(res, erro);
  }
});

// CADASTRAR disciplina
router.post("/", async (req, res) => {
  if (!textoValido(req.body.nome)) {
    return res.status(400).json({ erro: "O nome é obrigatório." });
  }

  try {
    const resultado = await pool.query(
      "INSERT INTO disciplinas (nome) VALUES ($1) RETURNING *",
      [req.body.nome.trim()]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    tratarErro(res, erro);
  }
});

// EDITAR disciplina
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  if (!idValido(id)) return res.status(400).json({ erro: "ID inválido." });

  if (!textoValido(req.body.nome)) {
    return res.status(400).json({ erro: "O nome é obrigatório." });
  }

  try {
    const resultado = await pool.query(
      "UPDATE disciplinas SET nome = $1 WHERE id = $2 RETURNING *",
      [req.body.nome.trim(), id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Disciplina não encontrada." });
    }
    res.json(resultado.rows[0]);
  } catch (erro) {
    tratarErro(res, erro);
  }
});

// EXCLUIR disciplina
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!idValido(id)) return res.status(400).json({ erro: "ID inválido." });

  try {
    const resultado = await pool.query("DELETE FROM disciplinas WHERE id = $1", [id]);
    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: "Disciplina não encontrada." });
    }
    res.status(204).send();
  } catch (erro) {
    tratarErro(res, erro);
  }
});

module.exports = router;
