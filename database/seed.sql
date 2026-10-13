INSERT INTO usuarios (nome, email) VALUES
  ('Ana Souza',   'ana.souza@exemplo.com'),
  ('Bruno Lima',  'bruno.lima@exemplo.com'),
  ('Carla Alves', 'carla.alves@exemplo.com');

INSERT INTO disciplinas (nome) VALUES
  ('Matemática'),
  ('Física'),
  ('Geografia'),
  ('Programação Web'),
  ('Banco de Dados');

INSERT INTO tarefas (titulo, descricao, prazo, status, usuario_id, disciplina_id) VALUES
  ('Lista de exercícios de funções', 'Resolver os exercícios 1 a 10 do livro.',         CURRENT_DATE + 2,  'pendente',     1, 1),
  ('Relatório do laboratório',       'Escrever o relatório sobre o experimento de MRU.', CURRENT_DATE + 5,  'em_andamento', 2, 2),
  ('Mapa dos biomas do Brasil',      'Montar o mapa e identificar os biomas.',           CURRENT_DATE + 7,  'pendente',     3, 3),
  ('Trabalho 01 - API REST',         'Criar a API com Express, Neon e Vercel.',          CURRENT_DATE + 1,  'em_andamento', 1, 4),
  ('Modelagem do banco',             'Fazer o diagrama entidade-relacionamento.',        CURRENT_DATE + 10, 'pendente',     2, 5),
  ('Seminário de Geografia',         'Apresentação sobre urbanização.',                  CURRENT_DATE - 3,  'concluida',    3, 3),
  ('Prova de Matemática',            'Estudar os capítulos 3 e 4.',                      CURRENT_DATE - 1,  'concluida',    1, 1);
