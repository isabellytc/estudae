// Funções pequenas usadas pelas três rotas.

// O ID precisa ser um número inteiro positivo (ex.: 1, 2, 15).
function idValido(id) {
  const numero = Number(id);
  return Number.isInteger(numero) && numero > 0 && numero <= 2147483647;
}

// O valor precisa ser um texto que não está vazio.
function textoValido(valor) {
  return typeof valor === "string" && valor.trim() !== "";
}

// Transforma erros do banco em respostas simples para o usuário.
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
