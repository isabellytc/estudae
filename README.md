# Estudaê - Gerenciador de Tarefas Escolares

Trabalho 01 de Programação Web - IFAL - Turma 913-A - Prof. Flavio Mota Medeiros.

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

# Tutorial passo a passo

As plataformas mudam o visual de vez em quando. Se algum botão estiver em outro lugar, procure pelo nome citado aqui.

## 1. Criar a conta no Neon

1. Acesse **https://neon.tech**.
2. Clique em **Sign up** e entre com sua conta do GitHub ou do Google (ou com e-mail).
3. Confirme o e-mail, se for pedido.

## 2. Criar o banco PostgreSQL

1. No painel do Neon, clique em **Create project** (ou **New project**).
2. Em **Name**, escreva `estudae`.
3. Deixe a versão do Postgres sugerida e, se aparecer a opção, escolha uma região próxima (por exemplo, São Paulo).
4. Clique em **Create**. O banco (`neondb`) já é criado junto com o projeto.

## 3. Criar as tabelas (schema.sql)

1. No menu do projeto, abra o **SQL Editor**.
2. Abra o arquivo `database/schema.sql` no seu computador, copie **todo** o conteúdo e cole no editor.
3. Clique em **Run**. Deve aparecer uma mensagem de sucesso.
4. Para conferir, abra **Tables**: devem existir `usuarios`, `disciplinas` e `tarefas`.

## 4. Inserir os dados de exemplo (seed.sql)

1. Ainda no **SQL Editor**, apague o texto anterior.
2. Copie o conteúdo de `database/seed.sql`, cole e clique em **Run**.
3. Execute o seed **só uma vez**, senão os dados ficam repetidos (os e-mails repetidos darão erro).

## 5. Pegar o endereço do banco (DATABASE_URL)

1. No painel do projeto, clique em **Connect**.
2. Copie a **connection string**, que é parecida com:
   `postgresql://usuario:senha@ep-xxxx.aws.neon.tech/neondb?sslmode=require`
3. Essa string contém sua **senha**. Não mostre para ninguém e nunca coloque no código ou no GitHub.

## 6. Instalar o projeto no computador

Pré-requisito: ter o **Node.js** (versão 18 ou mais nova) instalado. Teste com `node -v` no terminal.

```bash
cd estudae
npm install
```

## 7. Configurar o DATABASE_URL localmente

1. Copie o arquivo `.env.example` e renomeie a cópia para `.env`.
2. Abra o `.env` e troque o valor pela sua connection string do Neon:

```
DATABASE_URL=postgresql://...sua-string-aqui...
```

O `.gitignore` já impede que o `.env` seja enviado ao GitHub.

## 8. Iniciar a aplicação localmente

```bash
npm start
```

Abra **http://localhost:3000** no navegador. Para testar a API, acesse **http://localhost:3000/api/health**: deve aparecer `{"api":"funcionando","banco":"conectado"}`.

## 9. Criar o repositório no GitHub

1. Entre em **https://github.com** e clique em **New repository**.
2. Nome: `estudae`. Deixe **vazio** (sem README, sem .gitignore). Clique em **Create repository**.

## 10. Enviar o projeto para o GitHub

No terminal, dentro da pasta `estudae`:

```bash
git init
git add .
git commit -m "Estudaê - primeira versão"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/estudae.git
git push -u origin main
```

Troque `SEU-USUARIO` pelo seu usuário. Depois, atualize a página do repositório e confira que **o arquivo `.env` NÃO aparece** (só o `.env.example`).

## 11. Importar o repositório na Vercel

1. Acesse **https://vercel.com** e entre com sua conta do GitHub.
2. Clique em **Add New... > Project**.
3. Encontre o repositório `estudae` e clique em **Import**.
4. Em **Framework Preset**, deixe **Other**. Não precisa mudar *Build Command* nem *Output Directory*.

## 12. Configurar a variável de ambiente na Vercel

1. Na mesma tela de importação, abra **Environment Variables**.
2. Em **Key**, escreva `DATABASE_URL`.
3. Em **Value**, cole a connection string do Neon.
4. Clique em **Add**.

(Se você esquecer, vá em **Settings > Environment Variables** do projeto, adicione a variável e faça um novo **Redeploy** em **Deployments**.)

## 13. Publicar a aplicação

1. Clique em **Deploy** e aguarde.
2. Quando terminar, a Vercel mostra o endereço do site (algo como `https://estudae.vercel.app`).

## 14. Testar a API publicada

1. Abra `https://SEU-SITE.vercel.app/api/health` e confira `"banco":"conectado"`.
2. Abra `https://SEU-SITE.vercel.app/api/tarefas`: deve listar as tarefas em JSON.
3. Abra o site, cadastre uma tarefa e atualize a página (F5): ela deve continuar lá, porque foi salva no Neon.

Se aparecer `"banco":"sem conexão"`, veja a seção **Problemas comuns** abaixo.

---

# Checklist de testes

> **Estado atual:** o código foi escrito e a sintaxe dos arquivos JavaScript foi verificada, mas **os testes abaixo ainda não foram executados**. Quem preparou o projeto não teve acesso à internet nem a um banco Neon, então não foi possível instalar as dependências nem conectar ao banco. **Execute a lista abaixo e marque cada item** antes de entregar. Não declare a publicação como feita enquanto não tiver testado na Vercel.

| # | Teste | Como fazer | Feito |
|---|---|---|---|
| 1 | Frontend carrega | Abrir `http://localhost:3000` | [ ] |
| 2 | API responde | Abrir `/api/health` | [ ] |
| 3 | Banco conecta | `/api/health` mostra `"banco":"conectado"` | [ ] |
| 4 | Cadastrar usuário | Página Usuários > Novo usuário | [ ] |
| 5 | E-mail repetido é recusado | Cadastrar o mesmo e-mail duas vezes (erro 409) | [ ] |
| 6 | Cadastrar disciplina | Página Disciplinas > Nova disciplina | [ ] |
| 7 | Cadastrar tarefa | Página Tarefas > Nova tarefa | [ ] |
| 8 | Relacionamentos | O cartão da tarefa mostra o nome do usuário e da disciplina | [ ] |
| 9 | Consultas corretas | Contadores do painel batem com a lista de tarefas | [ ] |
| 10 | Filtros | Filtrar por status e por disciplina | [ ] |
| 11 | Editar registros | Editar uma tarefa, uma disciplina e um usuário | [ ] |
| 12 | Alterar status | Botão **Concluir** e a lista de status do cartão | [ ] |
| 13 | Excluir tarefa | Botão **Excluir** na tarefa | [ ] |
| 14 | Exclusão protegida | Tentar excluir um usuário que tem tarefas (mensagem de erro) | [ ] |
| 15 | Dados persistem | Atualizar a página (F5) e conferir que tudo continua | [ ] |
| 16 | ID inválido | Abrir `/api/tarefas/abc` (erro 400) | [ ] |
| 17 | ID inexistente | Abrir `/api/tarefas/99999` (erro 404) | [ ] |
| 18 | Funciona na Vercel | Repetir os testes 1 a 15 no endereço da Vercel | [ ] |

## Problemas comuns

- **`"banco":"sem conexão"`**: confira se `DATABASE_URL` está correta (no `.env` ou na Vercel) e se rodou o `schema.sql`. Na Vercel, depois de mudar uma variável, faça **Redeploy**.
- **`relation "tarefas" does not exist`**: o `schema.sql` ainda não foi executado no Neon.
- **`Cannot find module 'express'`**: faltou rodar `npm install`.
- **A página abre mas a lista fica vazia**: o `seed.sql` não foi executado (ou você ainda não cadastrou nada).
- **Erro 404 em `/api/...` na Vercel**: confirme que o arquivo `vercel.json` e a pasta `api/` foram enviados ao GitHub.
