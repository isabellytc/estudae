# Estudaê - Explicação do projeto

Este documento ajuda a **entender o próprio projeto** e a explicá-lo com suas palavras. Os exemplos de código foram tirados dos arquivos reais do Estudaê.

---

## 1. O que é o Estudaê?

É um sistema web para estudantes organizarem as tarefas escolares. Você cadastra **disciplinas**, cria **tarefas** com prazo e responsável, acompanha o que está pendente e marca como concluída.

**Problema que resolve:** prazos e atividades de várias disciplinas ficam espalhados em cadernos e conversas. No Estudaê tudo fica em um lugar só, salvo em um banco de dados.

## 2. O que é uma API REST?

Uma API é um "garçom": o site (cliente) faz um pedido, a API leva o pedido ao banco de dados (cozinha) e traz a resposta.

**REST** é um jeito organizado de montar essa API:

- Cada coisa tem um **endereço (URL)**: `/api/tarefas`, `/api/usuarios/3`.
- O **método HTTP** diz o que fazer: `GET` (buscar), `POST` (criar), `PUT` (editar), `PATCH` (editar uma parte), `DELETE` (excluir).
- Os dados viajam em **JSON**.
- A resposta traz um **código** que diz se deu certo: `200` ok, `201` criado, `204` excluído, `400` pedido inválido, `404` não encontrado, `500` erro no servidor.

## 3. O que é CRUD?

São as quatro operações básicas com dados:

| Letra | Operação | Método HTTP | SQL | Exemplo no projeto |
|---|---|---|---|---|
| C | Create (criar) | POST | INSERT | Cadastrar tarefa |
| R | Read (ler) | GET | SELECT | Listar tarefas |
| U | Update (atualizar) | PUT / PATCH | UPDATE | Editar tarefa, mudar status |
| D | Delete (excluir) | DELETE | DELETE | Excluir tarefa |

## 4. Qual é a função do HTML?

Monta a **estrutura** da página: título, menu, botões, formulários, listas. Está em `public/index.html`. Exemplo (menu):

```html
<button class="botao-menu" data-pagina="tarefas">Tarefas</button>
```

## 5. Qual é a função do CSS?

Cuida da **aparência**: cores, tamanhos, espaços. Está em `public/css/style.css`. As cores ficam guardadas em variáveis, para mudar o verde do site em um lugar só:

```css
:root {
  --verde: #176B42;
  --fundo: #F4F8F4;
}
```

## 6. Qual é a função do JavaScript?

Dá **vida** à página. Em `public/js/app.js`, o JavaScript:

- chama a API com `fetch()`;
- desenha as tarefas, disciplinas e usuários na tela;
- reage aos cliques e ao envio dos formulários.

## 7. O que é Node.js?

Permite rodar JavaScript **fora do navegador**, no computador ou em um servidor. É por causa dele que podemos usar JavaScript também no backend (`src/app.js`).

## 8. Para que serve o Express?

É uma biblioteca do Node.js que facilita criar servidores e rotas. Sem ele, seria preciso escrever muito mais código. Com o Express, uma rota é só:

```js
router.get("/", async (req, res) => { ... });
```

## 9. O que é PostgreSQL?

É um **banco de dados relacional**: guarda informações em tabelas (como planilhas), com linhas e colunas, e permite ligar tabelas entre si. Usamos SQL para conversar com ele.

## 10. Para que serve o Neon?

É um serviço na internet que **hospeda o PostgreSQL** para nós. Assim não precisamos instalar o banco no computador, e o site publicado consegue acessá-lo de qualquer lugar.

## 11. Para que serve a Vercel?

É a plataforma que **publica o site e a API** na internet, gerando um endereço público. Ela puxa o código do GitHub. Como a Vercel é *serverless* (não deixa um servidor ligado o tempo todo), o arquivo `api/index.js` entrega o app do Express para ela:

```js
module.exports = require("../src/app");
```

E o `vercel.json` manda tudo que começa com `/api/` para esse arquivo:

```json
{ "rewrites": [{ "source": "/api/(.*)", "destination": "/api/index.js" }] }
```

## 12. Como funciona a conexão entre frontend, backend e banco?

```
Navegador (HTML/CSS/JS)  --fetch-->  API Express  --pg-->  Banco Neon
                         <--JSON---               <--linhas--
```

1. O usuário clica em um botão no site.
2. O `app.js` do frontend usa `fetch()` para chamar a API.
3. A rota do Express executa um comando SQL no Neon.
4. O banco devolve o resultado, a API responde em JSON e o site atualiza a tela.

O endereço do banco fica na variável de ambiente `DATABASE_URL` (nunca no código), lida em `src/db.js`:

```js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
});
```

## 13. Como funciona o arquivo app.js?

Existem dois `app.js`; não confunda:

- **`src/app.js` (backend):** cria o servidor Express, liga as rotas e tem a rota `/api/health`.
- **`public/js/app.js` (frontend):** roda no navegador e controla a tela.

Trechos importantes do `src/app.js`:

```js
app.use(express.json());                       // entende JSON enviado pelo site
app.use("/api/usuarios", rotasUsuarios);       // rotas de usuários
app.use("/api/disciplinas", rotasDisciplinas); // rotas de disciplinas
app.use("/api/tarefas", rotasTarefas);         // rotas de tarefas
```

E o final do arquivo:

```js
if (require.main === module) {
  app.listen(porta, ...);   // só liga o servidor no computador local
}
module.exports = app;        // na Vercel o app é apenas importado
```

## 14. Como funcionam as rotas?

Uma rota liga **método + endereço** a uma função. Em `src/app.js`, o prefixo `/api/tarefas` é definido; em `src/routes/tarefas.js`, ficam as partes finais:

| Em `tarefas.js` | Endereço completo | Ação |
|---|---|---|
| `router.get("/")` | `GET /api/tarefas` | listar |
| `router.get("/:id")` | `GET /api/tarefas/5` | consultar uma |
| `router.post("/")` | `POST /api/tarefas` | cadastrar |
| `router.put("/:id")` | `PUT /api/tarefas/5` | editar |
| `router.patch("/:id/status")` | `PATCH /api/tarefas/5/status` | mudar status |
| `router.delete("/:id")` | `DELETE /api/tarefas/5` | excluir |

O `:id` é um valor variável da URL, lido com `req.params`.

## 15. Como o sistema cadastra uma tarefa?

Passo a passo:

1. O usuário preenche o formulário e clica em **Salvar**. A função `salvarTarefa` (frontend) monta um objeto e envia:

```js
await chamarApi("/tarefas", "POST", dados);
```

2. A função `chamarApi` faz o `fetch` com o método `POST` e o JSON no corpo.
3. A rota `router.post("/")` em `tarefas.js` **valida** os dados com `validarTarefa` (título preenchido, data válida, status permitido, usuário e disciplina escolhidos). Se algo estiver errado, responde `400`.
4. Se estiver tudo certo, grava no banco com SQL **parametrizado**:

```js
await pool.query(
  `INSERT INTO tarefas (titulo, descricao, prazo, status, usuario_id, disciplina_id)
   VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
  [titulo, descricao, prazo, status, usuario_id, disciplina_id]
);
```

5. Responde `201` com a tarefa criada, e o site recarrega a lista.

**Por que `$1, $2...`?** Os valores são enviados separados do comando SQL. Isso evita o ataque chamado *SQL Injection*, em que alguém digitaria comandos SQL no formulário.

## 16. Como o sistema consulta os dados?

Com `GET` e `SELECT`. A listagem de tarefas junta três tabelas com `JOIN` para mostrar o nome do usuário e da disciplina, e não só os números:

```sql
SELECT t.id, t.titulo, t.prazo, t.status,
       u.nome AS usuario_nome, d.nome AS disciplina_nome
FROM tarefas t
JOIN usuarios u ON u.id = t.usuario_id
JOIN disciplinas d ON d.id = t.disciplina_id
```

Os **filtros** chegam na URL (`/api/tarefas?status=pendente&disciplina_id=2`). Se um filtro não for enviado, ele vale `null` e a condição é ignorada:

```sql
WHERE ($1::text IS NULL OR t.status = $1)
  AND ($2::int  IS NULL OR t.disciplina_id = $2)
```

Os contadores do painel inicial são calculados no frontend a partir da lista de tarefas que veio da API.

## 17. Como funciona a atualização de registros?

Com `PUT` (edita todos os campos) ou `PATCH` (edita só uma parte). Para marcar como concluída, o botão **Concluir** chama:

```js
await chamarApi("/tarefas/" + id + "/status", "PATCH", { status: novoStatus });
```

E a rota executa:

```js
"UPDATE tarefas SET status = $1 WHERE id = $2 RETURNING id"
```

Se nenhuma linha for alterada, o ID não existe e a API responde `404`.

## 18. Como funciona a exclusão de registros?

O botão **Excluir** pergunta com `confirm()` e chama `DELETE`:

```js
await pool.query("DELETE FROM tarefas WHERE id = $1", [id]);
```

A API responde `204` (sem conteúdo). Ao tentar excluir um **usuário ou disciplina que ainda tem tarefas**, o banco recusa por causa da chave estrangeira, e a API responde `409` com uma mensagem explicando.

## 19. O que são chaves primárias e estrangeiras?

- **Chave primária (PRIMARY KEY):** identifica cada linha de forma única. Em todas as tabelas, é a coluna `id`.
- **Chave estrangeira (FOREIGN KEY):** é uma coluna que aponta para a chave primária de outra tabela, criando o relacionamento. Em `tarefas`:

```sql
usuario_id    INTEGER NOT NULL REFERENCES usuarios(id),
disciplina_id INTEGER NOT NULL REFERENCES disciplinas(id),
```

Isso garante que **não existe tarefa de um usuário ou disciplina que não existe**.

Relacionamentos: um usuário tem várias tarefas; uma disciplina tem várias tarefas; cada tarefa pertence a um usuário e a uma disciplina (1:N).

Outras restrições do `schema.sql`: `NOT NULL` (campo obrigatório), `UNIQUE` (e-mail não repete) e `CHECK` (status só pode ser `pendente`, `em_andamento` ou `concluida`).

## 20. Como demonstrar o projeto ao professor?

Veja o roteiro abaixo e a lista de preparação.

---

# Roteiro de apresentação (3 a 5 minutos)

**Antes de começar:** abra o site publicado, a página `/api/health` em outra aba e o Neon (tabela `tarefas`) em outra aba. Confira se o banco tem dados.

**Divisão sugerida:** cada aluno fala de uma parte. Os tempos são aproximados. Use as frases como guia e explique com as suas palavras.

### 1. Apresentação da ideia (30 s)
- Qual problema o Estudaê resolve.
- Quais são as três entidades: usuários, disciplinas e tarefas.

### 2. Como o sistema é montado (45 s)
- Mostre o esquema: **site -> API Express -> banco Neon**.
- Diga onde cada parte está hospedada: site e API na Vercel, banco no Neon, código no GitHub.
- Abra `/api/health` e mostre que a API e o banco responderam.

### 3. Demonstração do CRUD (2 min)
1. **Create:** crie uma disciplina nova e depois uma tarefa nova. Explique que o botão chamou `POST`.
2. **Read:** mostre o painel com os contadores e a lista de tarefas. Use um filtro por status ou disciplina.
3. **Update:** edite a tarefa (`PUT`) e clique em **Concluir** (`PATCH`). Veja o contador de concluídas subir.
4. **Delete:** exclua a tarefa criada (`DELETE`).
5. **Prova do banco:** atualize a página com F5 (os dados continuam) e mostre a tabela no Neon com as mesmas informações.

### 4. Mostrar o código (1 min)
- Abra `src/routes/tarefas.js` e mostre uma rota (por exemplo `router.post("/")`), a validação e o SQL com `$1, $2`.
- Abra `database/schema.sql` e mostre as chaves primárias e estrangeiras.

### 5. Encerramento (30 s)
- O que aprenderam: API REST, CRUD, banco relacional, publicação.
- O que poderia melhorar no futuro (ex.: login de usuários).

### Perguntas que o professor pode fazer
- *Qual a diferença entre PUT e PATCH?* PUT envia todos os campos da tarefa; PATCH envia só o que muda (aqui, o status).
- *Por que não colocar a senha do banco no código?* Quem vê o código (ex.: no GitHub) teria acesso ao banco. Por isso usamos `DATABASE_URL`.
- *O que acontece se tentar excluir um usuário com tarefas?* O banco recusa pela chave estrangeira e a API responde 409.
- *Para que serve o `async/await`?* A chamada ao banco ou à API demora; o `await` espera a resposta sem travar a página.
- *Por que `$1` no SQL?* Para separar os dados do comando e evitar SQL Injection.
- *O sistema tem login?* Não. Os usuários são de demonstração e o trabalho não pedia autenticação.
