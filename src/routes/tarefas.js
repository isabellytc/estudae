const express = require("express");
const pool = require("../db");
const { idValido, textoValido, tratarErro } = require("../util");

const router = express.Router();

const STATUS_PERMITIDOS = ["pendente", "em_andamento", "concluida"];

// Consulta base: traz a tarefa junto com o nome do usuário e da disciplina (JOIN)
const SELECT_TAREFAS = `
  SELECT t.id, t.titulo, t.descricao, t.prazo, t.status,
         t.usuario_id, u.nome AS usuario_nome,
         t.disciplina_id, d.nome AS disciplina_nome,
         t.criado_em
  FROM tarefas t
  JOIN usuarios u ON u.id = t.usuario_id
  JOIN disciplinas d ON d.id = t.disciplina_id`;

// Confere se a data está no formato AAAA-MM-DD e se existe de verdade
function dataValida(texto) {
  if (typeof texto !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const data = new Date(texto + "T00:00:00Z");
  return !isNaN(data.getTime()) && data.toISOString().slice(0, 10) === texto;
}

// Confere os campos da tarefa. Retorna a mensagem de erro, ou null se estiver tudo certo.
function validarTarefa(corpo) {
  if (!textoValido(corpo.titulo)) return "O título é obrigatório.";
  if (!dataValida(corpo.prazo)) return "O prazo é obrigatório (formato AAAA-MM-DD).";
  if (!STATUS_PERMITIDOS.includes(corpo.status)) {
    return "Status inválido. Use: pendente, em_andamento ou concluida.";
  }
  if (!idValido(corpo.usuario_id)) return "Escolha o usuário responsável.";
  if (!idValido(corpo.disciplina_id)) return "Escolha a disciplina.";
  return null;
}

// Busca uma tarefa pelo ID (com os nomes do usuário e da disciplina)
async function buscarTarefa(id) {
  const resultado = await pool.query(SELECT_TAREFAS + " WHERE t.id = $1", [id]);
  return resultado.rows[0];
}

// LISTAR tarefas (filtros opcionais: ?status=pendente&disciplina_id=2)
router.get("/", async (req, res) => {
  const { status, disciplina_id } = req.query;

  if (status && !STATUS_PERMITIDOS.includes(status)) {
    return res.status(400).json({ erro: "Status inválido no filtro." });
  }
  if (disciplina_id && !idValido(disciplina_id)) {
    return res.status(400).json({ erro: "Disciplina inválida no filtro." });
  }

  try {
    // Quando o filtro não foi enviado, o valor é null e a condição é ignorada
    const resultado = await pool.query(
      SELECT_TAREFAS +
        ` WHERE ($1::text IS NULL OR t.status = $1)
            AND ($2::int IS NULL OR t.disciplina_id = $2)
          ORDER BY t.prazo ASC, t.id ASC`,
      [status || null, disciplina_id || null]
    );
    res.json(resultado.rows);
  } catch (erro) {
    tratarErro(res, erro);
  }
});

// CONSULTAR uma tarefa pelo ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!idValido(id)) return res.status(400).json({ erro: "ID inválido." });

  try {
    const tarefa = await buscarTarefa(id);
    if (!tarefa) return res.status(404).json({ erro: "Tarefa não encontrada." });
    res.json(tarefa);
  } catch (erro) {
    tratarErro(res, erro);
  }
});

// CADASTRAR tarefa
router.post("/", async (req, res) => {
  const mensagem = validarTarefa(req.body);
  if (mensagem) return res.status(400).json({ erro: mensagem });

  const { titulo, descricao, prazo, status, usuario_id, disciplina_id } = req.body;

  try {
    const resultado = await pool.query(
      `INSERT INTO tarefas (titulo, descricao, prazo, status, usuario_id, disciplina_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [titulo.trim(), textoValido(descricao) ? descricao.trim() : null, prazo, status, usuario_id, disciplina_id]
    );
    const tarefa = await buscarTarefa(resultado.rows[0].id);
    res.status(201).json(tarefa);
  } catch (erro) {
    tratarErro(res, erro);
  }
});

// EDITAR tarefa (todos os campos)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  if (!idValido(id)) return res.status(400).json({ erro: "ID inválido." });

  const mensagem = validarTarefa(req.body);
  if (mensagem) return res.status(400).json({ erro: mensagem });

  const { titulo, descricao, prazo, status, usuario_id, disciplina_id } = req.body;

  try {
    const resultado = await pool.query(
      `UPDATE tarefas
       SET titulo = $1, descricao = $2, prazo = $3, status = $4,
           usuario_id = $5, disciplina_id = $6
       WHERE id = $7 RETURNING id`,
      [titulo.trim(), textoValido(descricao) ? descricao.trim() : null, prazo, status, usuario_id, disciplina_id, id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Tarefa não encontrada." });
    }
    const tarefa = await buscarTarefa(id);
    res.json(tarefa);
  } catch (erro) {
    tratarErro(res, erro);
  }
});

// ALTERAR apenas o status (marcar como concluída, em andamento...)
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  if (!idValido(id)) return res.status(400).json({ erro: "ID inválido." });

  const { status } = req.body;
  if (!STATUS_PERMITIDOS.includes(status)) {
    return res.status(400).json({ erro: "Status inválido. Use: pendente, em_andamento ou concluida." });
  }

  try {
    const resultado = await pool.query(
      "UPDATE tarefas SET status = $1 WHERE id = $2 RETURNING id",
      [status, id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Tarefa não encontrada." });
    }
    const tarefa = await buscarTarefa(id);
    res.json(tarefa);
  } catch (erro) {
    tratarErro(res, erro);
  }
});

// EXCLUIR tarefa
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!idValido(id)) return res.status(400).json({ erro: "ID inválido." });

  try {
    const resultado = await pool.query("DELETE FROM tarefas WHERE id = $1", [id]);
    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: "Tarefa não encontrada." });
    }
    res.status(204).send();
  } catch (erro) {
    tratarErro(res, erro);
  }
});

module.exports = router;
