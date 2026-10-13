// Arquivo principal do servidor Express.
// Localmente: "npm start". Na Vercel: o arquivo api/index.js usa este app.
const express = require("express");
const path = require("path");
const pool = require("./db");

const rotasUsuarios = require("./routes/usuarios");
const rotasDisciplinas = require("./routes/disciplinas");
const rotasTarefas = require("./routes/tarefas");

const app = express();

app.use(express.json()); // permite ler o JSON enviado no corpo (req.body)
app.use(express.static(path.join(__dirname, "..", "public"))); // site (usado no modo local)

// Rota para verificar se a API e o banco estão funcionando
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ api: "funcionando", banco: "conectado" });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ api: "funcionando", banco: "sem conexão" });
  }
});

app.use("/api/usuarios", rotasUsuarios);
app.use("/api/disciplinas", rotasDisciplinas);
app.use("/api/tarefas", rotasTarefas);

// Rota de API que não existe
app.use("/api", (req, res) => {
  res.status(404).json({ erro: "Rota não encontrada." });
});

// JSON enviado com erro de sintaxe e outros erros inesperados
app.use((erro, req, res, next) => {
  if (erro.type === "entity.parse.failed") {
    return res.status(400).json({ erro: "JSON inválido." });
  }
  console.error(erro);
  res.status(500).json({ erro: "Erro interno do servidor." });
});

// Só inicia o servidor quando rodamos "node src/app.js" (computador local).
// Na Vercel o arquivo é importado, então o app.listen não é executado.
if (require.main === module) {
  const porta = process.env.PORT || 3000;
  app.listen(porta, () => {
    console.log("Estudaê rodando em http://localhost:" + porta);
  });
}

module.exports = app;
