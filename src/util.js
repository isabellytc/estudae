// Funções pequenas usadas pelas três rotas.

function idValido(id) {
  const numero = Number(id);
  return Number.isInteger(numero) && numero > 0 && numero <= 2147483647;
}

function textoValido(valor) {
  return typeof valor === "string" && valor.trim() !== "";
}

function tratarErro(res, erro) {
  console.error(erro);

  if (erro.code === "23505") {
    return res.status(409).json({ erro: "Já existe um registro com esse e-mail." });
  }
  if (erro.code === "23503") {
    if (erro.detail && erro.detail.includes("still referenced")) {
      return res.status(409).json({ erro: "Não é possível excluir: existem tarefas ligadas a este registro." });
    }
    return res.status(400).json({ erro: "O usuário ou a disciplina informada não existe." });
  }
  if (erro.code === "22001") {
    return res.status(400).json({ erro: "Algum texto é grande demais." });
  }

  res.status(500).json({ erro: "Erro interno do servidor." });
}

module.exports = { idValido, textoValido, tratarErro };
