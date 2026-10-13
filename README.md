# Estudaê - Gerenciador de Tarefas Escolares

Trabalho 01 de PRMO - IFAL - Turma 913-A - Prof. Flavio Mota Medeiros.

O Estudaê ajuda estudantes a organizar suas atividades: cadastrar disciplinas, criar tarefas, acompanhar prazos e marcar tarefas como concluídas.

**Tecnologias:** HTML, CSS, JavaScript puro, Node.js, Express, PostgreSQL (Neon), biblioteca `pg`, GitHub e Vercel.

## Estrutura de arquivos

```
estudae/
├── api/index.js            <- ponto de entrada da Vercel (usa o app do Express)
├── src/
│   ├── app.js              <- servidor Express (arquivo principal)
│   ├── db.js               <- conexão com o Neon (DATABASE_URL)
│   ├── util.js             <- validação de ID/texto e tratamento de erros
│   └── routes/
│       ├── usuarios.js     <- CRUD de usuários
│       ├── disciplinas.js  <- CRUD de disciplinas
│       └── tarefas.js      <- CRUD de tarefas + status + filtros
├── public/                 <- site (frontend)
│   ├── index.html
│   ├── favicon.svg         <- ícone do Estudaê
│   ├── css/style.css
│   └── js/app.js
├── database/
│   ├── schema.sql          <- cria as tabelas
│   └── seed.sql            <- dados de exemplo
├── .env.example            <- modelo do arquivo .env
├── .gitignore
├── package.json
├── vercel.json
├── README.md
└── EXPLICACAO_PROFESSOR.md <- explicação do código + roteiro de apresentação
```

> Observação: além dos arquivos sugeridos no enunciado, foi criado apenas o `src/util.js`, para não repetir as mesmas funções de validação em três arquivos.

## Rotas da API

| Método | Rota | O que faz |
|---|---|---|
| GET | `/api/health` | Verifica se a API e o banco estão funcionando |
| GET | `/api/usuarios` | Lista usuários |
| GET | `/api/usuarios/:id` | Consulta um usuário |
| POST | `/api/usuarios` | Cadastra usuário (`nome`, `email`) |
| PUT | `/api/usuarios/:id` | Edita nome e e-mail |
| DELETE | `/api/usuarios/:id` | Exclui usuário |
| GET | `/api/disciplinas` | Lista disciplinas |
| GET | `/api/disciplinas/:id` | Consulta uma disciplina |
| POST | `/api/disciplinas` | Cadastra disciplina (`nome`) |
| PUT | `/api/disciplinas/:id` | Edita disciplina |
| DELETE | `/api/disciplinas/:id` | Exclui disciplina |
| GET | `/api/tarefas` | Lista tarefas. Filtros: `?status=pendente&disciplina_id=2` |
| GET | `/api/tarefas/:id` | Consulta uma tarefa |
| POST | `/api/tarefas` | Cadastra tarefa |
| PUT | `/api/tarefas/:id` | Edita tarefa |
| PATCH | `/api/tarefas/:id/status` | Altera só o status (`{ "status": "concluida" }`) |
| DELETE | `/api/tarefas/:id` | Exclui tarefa |

Exemplo de corpo (JSON) para `POST /api/tarefas`:

```json
{
  "titulo": "Estudar para a prova",
  "descricao": "Capítulos 3 e 4",
  "prazo": "2026-10-20",
  "status": "pendente",
  "usuario_id": 1,
  "disciplina_id": 1
}
```

Códigos de resposta usados: `200` (ok), `201` (criado), `204` (excluído, sem conteúdo), `400` (dados inválidos), `404` (não encontrado), `409` (conflito, ex.: e-mail repetido ou exclusão de usuário/disciplina que ainda tem tarefas), `500` (erro interno).

---


