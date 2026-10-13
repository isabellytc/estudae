CREATE TABLE IF NOT EXISTS usuarios (
  id        SERIAL PRIMARY KEY,
  nome      VARCHAR(100) NOT NULL,
  email     VARCHAR(150) NOT NULL UNIQUE,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS disciplinas (
  id        SERIAL PRIMARY KEY,
  nome      VARCHAR(100) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tarefas (
  id            SERIAL PRIMARY KEY,
  titulo        VARCHAR(150) NOT NULL,
  descricao     TEXT,
  prazo         DATE NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'pendente'
                CHECK (status IN ('pendente', 'em_andamento', 'concluida')),
  usuario_id    INTEGER NOT NULL REFERENCES usuarios(id),
  disciplina_id INTEGER NOT NULL REFERENCES disciplinas(id),
  criado_em     TIMESTAMP NOT NULL DEFAULT NOW()
);
