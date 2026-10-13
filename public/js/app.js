// Estudaê - JavaScript do site (frontend)
// Tudo que aparece na tela vem da API (fetch) e do banco Neon.

const API = "/api";

// Listas guardadas na memória apenas para desenhar a tela.
// Os dados de verdade ficam no banco.
let usuarios = [];
let disciplinas = [];
let todasTarefas = [];   // usada no painel da página inicial
let tarefasFiltradas = []; // usada na página de tarefas

// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================

// Envia uma requisição para a API e devolve o JSON da resposta.
async function chamarApi(caminho, metodo = "GET", dados = null) {
  const opcoes = { method: metodo, headers: {} };

  if (dados) {
    opcoes.headers["Content-Type"] = "application/json";
    opcoes.body = JSON.stringify(dados);
  }

  const resposta = await fetch(API + caminho, opcoes);

  if (resposta.status === 204) return null; // 204 = sem conteúdo (exclusão)

  const json = await resposta.json();
  if (!resposta.ok) {
    throw new Error(json.erro || "Erro ao falar com o servidor.");
  }
  return json;
}

// Evita que um texto digitado vire código HTML na tela.
function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto == null ? "" : texto;
  return div.innerHTML;
}

// Mostra uma mensagem de sucesso ou erro no topo da página.
function mostrarMensagem(texto, tipo) {
  const caixa = document.getElementById("mensagem");
  caixa.textContent = texto;
  caixa.className = "mensagem " + tipo;
  setTimeout(() => caixa.classList.add("escondido"), 4000);
}

// "2026-10-14" -> "14/10/2026"
function formatarData(data) {
  const partes = data.split("-");
  return partes[2] + "/" + partes[1] + "/" + partes[0];
}

// Data de hoje no formato "AAAA-MM-DD"
function dataDeHoje() {
  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return hoje.getFullYear() + "-" + mes + "-" + dia;
}

const NOMES_STATUS = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluida: "Concluída",
};

// ======================================================
// NAVEGAÇÃO ENTRE PÁGINAS
// ======================================================

function mostrarPagina(nome) {
  document.querySelectorAll(".pagina").forEach((pagina) => {
    pagina.classList.add("escondido");
  });
  document.getElementById("pagina-" + nome).classList.remove("escondido");

  document.querySelectorAll(".botao-menu").forEach((botao) => {
    botao.classList.toggle("ativo", botao.dataset.pagina === nome);
  });
}

// ======================================================
// CARREGAR DADOS DA API
// ======================================================

async function carregarUsuarios() {
  usuarios = await chamarApi("/usuarios");
  desenharUsuarios();
}

async function carregarDisciplinas() {
  disciplinas = await chamarApi("/disciplinas");
  desenharDisciplinas();
  preencherFiltroDisciplinas();
}

async function carregarTarefas() {
  // Lê os filtros escolhidos e monta a URL, ex.: /tarefas?status=pendente
  const status = document.getElementById("filtro-status").value;
  const disciplinaId = document.getElementById("filtro-disciplina").value;

  let url = "/tarefas";
  const filtros = [];
  if (status) filtros.push("status=" + status);
  if (disciplinaId) filtros.push("disciplina_id=" + disciplinaId);
  if (filtros.length > 0) url += "?" + filtros.join("&");

  tarefasFiltradas = await chamarApi(url);
  desenharTarefas();
}

async function carregarPainel() {
  todasTarefas = await chamarApi("/tarefas");
  desenharPainel();
}

// Carrega tudo de uma vez (usado ao abrir o site e depois de alterações)
async function carregarTudo() {
  try {
    await Promise.all([
      carregarUsuarios(),
      carregarDisciplinas(),
      carregarTarefas(),
      carregarPainel(),
    ]);
  } catch (erro) {
    mostrarMensagem("Não foi possível carregar os dados: " + erro.message, "erro");
  }
}

// ======================================================
// DESENHAR NA TELA
// ======================================================

function desenharPainel() {
  const pendentes = todasTarefas.filter((t) => t.status === "pendente");
  const concluidas = todasTarefas.filter((t) => t.status === "concluida");

  document.getElementById("total-tarefas").textContent = todasTarefas.length;
  document.getElementById("total-pendentes").textContent = pendentes.length;
  document.getElementById("total-concluidas").textContent = concluidas.length;

  // Próximas atividades: tarefas não concluídas, as 5 com prazo mais próximo
  // (a API já entrega as tarefas ordenadas por prazo)
  const proximas = todasTarefas.filter((t) => t.status !== "concluida").slice(0, 5);
  const lista = document.getElementById("lista-proximas");

  if (proximas.length === 0) {
    lista.innerHTML = '<li class="vazio">Nenhuma atividade pendente. Cadastre uma tarefa!</li>';
    return;
  }

  lista.innerHTML = proximas
    .map(
      (t) => `
      <li>
        <span><strong>${escapar(t.titulo)}</strong><br>
          <small>${escapar(t.disciplina_nome)} - ${escapar(t.usuario_nome)}</small></span>
        <span class="${t.prazo < dataDeHoje() ? "atrasada" : ""}">${formatarData(t.prazo)}</span>
      </li>`
    )
    .join("");
}

function desenharTarefas() {
  const lista = document.getElementById("lista-tarefas");

  if (tarefasFiltradas.length === 0) {
    lista.innerHTML = '<div class="cartao vazio">Nenhuma tarefa encontrada.</div>';
    return;
  }

  lista.innerHTML = tarefasFiltradas
    .map((t) => {
      const atrasada = t.status !== "concluida" && t.prazo < dataDeHoje();
      return `
      <div class="cartao ${t.status === "concluida" ? "concluida" : ""}">
        <div class="tarefa-topo">
          <p class="tarefa-titulo">${escapar(t.titulo)}</p>
          <span class="etiqueta etiqueta-${t.status}">${NOMES_STATUS[t.status]}</span>
        </div>
        <p class="tarefa-info">
          ${escapar(t.disciplina_nome)} - Responsável: ${escapar(t.usuario_nome)} -
          <span class="${atrasada ? "atrasada" : ""}">Prazo: ${formatarData(t.prazo)}${atrasada ? " (atrasada)" : ""}</span>
        </p>
        ${t.descricao ? `<p class="tarefa-descricao">${escapar(t.descricao)}</p>` : ""}
        <div class="tarefa-acoes">
          <select onchange="mudarStatus(${t.id}, this.value)" aria-label="Alterar status">
            <option value="pendente" ${t.status === "pendente" ? "selected" : ""}>Pendente</option>
            <option value="em_andamento" ${t.status === "em_andamento" ? "selected" : ""}>Em andamento</option>
            <option value="concluida" ${t.status === "concluida" ? "selected" : ""}>Concluída</option>
          </select>
          ${t.status !== "concluida" ? `<button class="botao botao-pequeno" onclick="mudarStatus(${t.id}, 'concluida')">Concluir</button>` : ""}
          <button class="botao botao-claro botao-pequeno" onclick="abrirFormTarefa(${t.id})">Editar</button>
          <button class="botao botao-perigo botao-pequeno" onclick="excluirTarefa(${t.id})">Excluir</button>
        </div>
      </div>`;
    })
    .join("");
}

function desenharDisciplinas() {
  const tabela = document.getElementById("tabela-disciplinas");

  if (disciplinas.length === 0) {
    tabela.innerHTML = '<tr><td colspan="3" class="vazio">Nenhuma disciplina cadastrada.</td></tr>';
    return;
  }

  tabela.innerHTML = disciplinas
    .map(
      (d) => `
      <tr>
        <td>${d.id}</td>
        <td>${escapar(d.nome)}</td>
        <td class="acoes">
          <button class="botao botao-claro botao-pequeno" onclick="abrirFormDisciplina(${d.id})">Editar</button>
          <button class="botao botao-perigo botao-pequeno" onclick="excluirDisciplina(${d.id})">Excluir</button>
        </td>
      </tr>`
    )
    .join("");
}

function desenharUsuarios() {
  const tabela = document.getElementById("tabela-usuarios");

  if (usuarios.length === 0) {
    tabela.innerHTML = '<tr><td colspan="4" class="vazio">Nenhum usuário cadastrado.</td></tr>';
    return;
  }

  tabela.innerHTML = usuarios
    .map(
      (u) => `
      <tr>
        <td>${u.id}</td>
        <td>${escapar(u.nome)}</td>
        <td>${escapar(u.email)}</td>
        <td class="acoes">
          <button class="botao botao-claro botao-pequeno" onclick="abrirFormUsuario(${u.id})">Editar</button>
          <button class="botao botao-perigo botao-pequeno" onclick="excluirUsuario(${u.id})">Excluir</button>
        </td>
      </tr>`
    )
    .join("");
}

// Coloca as disciplinas no filtro da página de tarefas
function preencherFiltroDisciplinas() {
  const filtro = document.getElementById("filtro-disciplina");
  const escolhida = filtro.value;

  filtro.innerHTML =
    '<option value="">Todas</option>' +
    disciplinas.map((d) => `<option value="${d.id}">${escapar(d.nome)}</option>`).join("");

  filtro.value = escolhida;
}

// ======================================================
// TAREFAS: cadastrar, editar, mudar status e excluir
// ======================================================

function abrirFormTarefa(id) {
  if (usuarios.length === 0 || disciplinas.length === 0) {
    mostrarMensagem("Cadastre pelo menos um usuário e uma disciplina antes de criar tarefas.", "erro");
    return;
  }

  // Preenche as listas de usuário e disciplina
  document.getElementById("tarefa-usuario").innerHTML = usuarios
    .map((u) => `<option value="${u.id}">${escapar(u.nome)}</option>`)
    .join("");
  document.getElementById("tarefa-disciplina").innerHTML = disciplinas
    .map((d) => `<option value="${d.id}">${escapar(d.nome)}</option>`)
    .join("");

  document.getElementById("form-tarefa").reset();
  document.getElementById("tarefa-id").value = "";
  document.getElementById("titulo-form-tarefa").textContent = "Nova tarefa";

  if (id) {
    // Edição: preenche o formulário com os dados da tarefa
    const tarefa = todasTarefas.find((t) => t.id === id);
    document.getElementById("titulo-form-tarefa").textContent = "Editar tarefa";
    document.getElementById("tarefa-id").value = tarefa.id;
    document.getElementById("tarefa-titulo").value = tarefa.titulo;
    document.getElementById("tarefa-descricao").value = tarefa.descricao || "";
    document.getElementById("tarefa-prazo").value = tarefa.prazo;
    document.getElementById("tarefa-status").value = tarefa.status;
    document.getElementById("tarefa-usuario").value = tarefa.usuario_id;
    document.getElementById("tarefa-disciplina").value = tarefa.disciplina_id;
  }

  document.getElementById("janela-tarefa").showModal();
}

async function salvarTarefa(evento) {
  evento.preventDefault();

  const id = document.getElementById("tarefa-id").value;
  const dados = {
    titulo: document.getElementById("tarefa-titulo").value,
    descricao: document.getElementById("tarefa-descricao").value,
    prazo: document.getElementById("tarefa-prazo").value,
    status: document.getElementById("tarefa-status").value,
    usuario_id: Number(document.getElementById("tarefa-usuario").value),
    disciplina_id: Number(document.getElementById("tarefa-disciplina").value),
  };

  try {
    if (id) {
      await chamarApi("/tarefas/" + id, "PUT", dados);
      mostrarMensagem("Tarefa atualizada!", "sucesso");
    } else {
      await chamarApi("/tarefas", "POST", dados);
      mostrarMensagem("Tarefa cadastrada!", "sucesso");
    }
    document.getElementById("janela-tarefa").close();
    carregarTudo();
  } catch (erro) {
    mostrarMensagem(erro.message, "erro");
  }
}

async function mudarStatus(id, novoStatus) {
  try {
    await chamarApi("/tarefas/" + id + "/status", "PATCH", { status: novoStatus });
    mostrarMensagem("Status alterado!", "sucesso");
    carregarTudo();
  } catch (erro) {
    mostrarMensagem(erro.message, "erro");
    carregarTudo();
  }
}

async function excluirTarefa(id) {
  if (!confirm("Deseja excluir esta tarefa?")) return;

  try {
    await chamarApi("/tarefas/" + id, "DELETE");
    mostrarMensagem("Tarefa excluída!", "sucesso");
    carregarTudo();
  } catch (erro) {
    mostrarMensagem(erro.message, "erro");
  }
}

// ======================================================
// DISCIPLINAS: cadastrar, editar e excluir
// ======================================================

function abrirFormDisciplina(id) {
  document.getElementById("form-disciplina").reset();
  document.getElementById("disciplina-id").value = "";
  document.getElementById("titulo-form-disciplina").textContent = "Nova disciplina";

  if (id) {
    const disciplina = disciplinas.find((d) => d.id === id);
    document.getElementById("titulo-form-disciplina").textContent = "Editar disciplina";
    document.getElementById("disciplina-id").value = disciplina.id;
    document.getElementById("disciplina-nome").value = disciplina.nome;
  }

  document.getElementById("janela-disciplina").showModal();
}

async function salvarDisciplina(evento) {
  evento.preventDefault();

  const id = document.getElementById("disciplina-id").value;
  const dados = { nome: document.getElementById("disciplina-nome").value };

  try {
    if (id) {
      await chamarApi("/disciplinas/" + id, "PUT", dados);
      mostrarMensagem("Disciplina atualizada!", "sucesso");
    } else {
      await chamarApi("/disciplinas", "POST", dados);
      mostrarMensagem("Disciplina cadastrada!", "sucesso");
    }
    document.getElementById("janela-disciplina").close();
    carregarTudo();
  } catch (erro) {
    mostrarMensagem(erro.message, "erro");
  }
}

async function excluirDisciplina(id) {
  if (!confirm("Deseja excluir esta disciplina?")) return;

  try {
    await chamarApi("/disciplinas/" + id, "DELETE");
    mostrarMensagem("Disciplina excluída!", "sucesso");
    carregarTudo();
  } catch (erro) {
    mostrarMensagem(erro.message, "erro");
  }
}

// ======================================================
// USUÁRIOS: cadastrar, editar e excluir
// ======================================================

function abrirFormUsuario(id) {
  document.getElementById("form-usuario").reset();
  document.getElementById("usuario-id").value = "";
  document.getElementById("titulo-form-usuario").textContent = "Novo usuário";

  if (id) {
    const usuario = usuarios.find((u) => u.id === id);
    document.getElementById("titulo-form-usuario").textContent = "Editar usuário";
    document.getElementById("usuario-id").value = usuario.id;
    document.getElementById("usuario-nome").value = usuario.nome;
    document.getElementById("usuario-email").value = usuario.email;
  }

  document.getElementById("janela-usuario").showModal();
}

async function salvarUsuario(evento) {
  evento.preventDefault();

  const id = document.getElementById("usuario-id").value;
  const dados = {
    nome: document.getElementById("usuario-nome").value,
    email: document.getElementById("usuario-email").value,
  };

  try {
    if (id) {
      await chamarApi("/usuarios/" + id, "PUT", dados);
      mostrarMensagem("Usuário atualizado!", "sucesso");
    } else {
      await chamarApi("/usuarios", "POST", dados);
      mostrarMensagem("Usuário cadastrado!", "sucesso");
    }
    document.getElementById("janela-usuario").close();
    carregarTudo();
  } catch (erro) {
    mostrarMensagem(erro.message, "erro");
  }
}

async function excluirUsuario(id) {
  if (!confirm("Deseja excluir este usuário?")) return;

  try {
    await chamarApi("/usuarios/" + id, "DELETE");
    mostrarMensagem("Usuário excluído!", "sucesso");
    carregarTudo();
  } catch (erro) {
    mostrarMensagem(erro.message, "erro");
  }
}

// ======================================================
// LIGAR OS BOTÕES E INICIAR
// ======================================================

document.querySelectorAll(".botao-menu").forEach((botao) => {
  botao.addEventListener("click", () => mostrarPagina(botao.dataset.pagina));
});

document.querySelectorAll("[data-fechar]").forEach((botao) => {
  botao.addEventListener("click", () => document.getElementById(botao.dataset.fechar).close());
});

document.getElementById("botao-nova-tarefa").addEventListener("click", () => abrirFormTarefa());
document.getElementById("botao-nova-disciplina").addEventListener("click", () => abrirFormDisciplina());
document.getElementById("botao-novo-usuario").addEventListener("click", () => abrirFormUsuario());

document.getElementById("form-tarefa").addEventListener("submit", salvarTarefa);
document.getElementById("form-disciplina").addEventListener("submit", salvarDisciplina);
document.getElementById("form-usuario").addEventListener("submit", salvarUsuario);

document.getElementById("filtro-status").addEventListener("change", carregarTarefas);
document.getElementById("filtro-disciplina").addEventListener("change", carregarTarefas);

carregarTudo();
