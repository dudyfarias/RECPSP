const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'forum-recpsp-secret-2024';

const db = new Database(path.join(__dirname, 'forum.db'));

// =================== SCHEMA ===================
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    banned INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6366f1',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    pinned INTEGER DEFAULT 0,
    locked INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    topic_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS topic_tags (
    topic_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (topic_id, tag_id),
    FOREIGN KEY (topic_id) REFERENCES topics(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
  );

  CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, topic_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (topic_id) REFERENCES topics(id)
  );

  CREATE TABLE IF NOT EXISTS post_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    reference_id INTEGER,
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS poll_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    FOREIGN KEY (topic_id) REFERENCES topics(id)
  );

  CREATE TABLE IF NOT EXISTS poll_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    option_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, topic_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (option_id) REFERENCES poll_options(id),
    FOREIGN KEY (topic_id) REFERENCES topics(id)
  );
`);

// Adicionar coluna best_answer se nao existir
try { db.exec('ALTER TABLE posts ADD COLUMN best_answer INTEGER DEFAULT 0'); } catch {}

// Adicionar coluna type se nao existir
try { db.exec('ALTER TABLE topics ADD COLUMN type TEXT DEFAULT "discussion"'); } catch {}

// Adicionar coluna color se nao existir (para upgrade)
try { db.exec('ALTER TABLE categories ADD COLUMN color TEXT DEFAULT "#6366f1"'); } catch {}

// Adicionar colunas de perfil
try { db.exec('ALTER TABLE users ADD COLUMN location TEXT DEFAULT ""'); } catch {}
try { db.exec('ALTER TABLE users ADD COLUMN organization TEXT DEFAULT ""'); } catch {}
try { db.exec('ALTER TABLE users ADD COLUMN bio TEXT DEFAULT ""'); } catch {}

// Adicionar colunas para tipos de topico
try { db.exec('ALTER TABLE topics ADD COLUMN image_url TEXT DEFAULT ""'); } catch {}
try { db.exec('ALTER TABLE topics ADD COLUMN video_url TEXT DEFAULT ""'); } catch {}

// =================== SEED ===================
const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run('admin', 'admin@forum.com', hashedPassword, 'admin');

  const cats = [
    ['Planejamento', 'Planejamento de contratacoes publicas', '#3b82f6'],
    ['Obras Publicas', 'Contratacao de obras e servicos de engenharia', '#ef4444'],
    ['Contratacao Direta', 'Dispensa e inexigibilidade de licitacao', '#22c55e'],
    ['Sustentabilidade', 'Criterios de sustentabilidade nas compras', '#6b7280'],
    ['Documentos', 'Modelos de editais e termos de referencia', '#22c55e'],
    ['Gestao Contratual', 'Fiscalizacao e gestao de contratos', '#6b7280'],
    ['Licitacao', 'Pregao eletronico e processos licitatorios', '#ef4444'],
    ['Inovacao', 'Ferramentas digitais e modernizacao', '#f97316'],
    ['Central de Compras', 'Centralizacao e registro de precos', '#0ea5e9'],
    ['Governanca', 'Boas praticas e agentes publicos', '#f97316'],
    ['Capacitacao', 'Formacao e treinamento de agentes', '#6b7280'],
  ];
  for (const [name, desc, color] of cats) {
    db.prepare('INSERT INTO categories (name, description, color) VALUES (?, ?, ?)').run(name, desc, color);
  }

  const tags = ['Planejamento', 'Gestao Publica', 'Inexigibilidade', 'Dispensa', 'Compras Sustentaveis', 'ODS', 'Pregao', 'Licitacao', 'Boas Praticas', 'Agentes Publicos'];
  for (const tag of tags) {
    db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)').run(tag);
  }

  console.log('Admin criado: admin / admin123');
  console.log('Categorias e tags iniciais criadas');

  // =================== DADOS DE TESTE ===================
  const testPass = bcrypt.hashSync('teste123', 10);
  const testUsers = [
    ['MariaLicitacao', 'maria@teste.com', testPass, 'user', 'SP', 'Prefeitura de Sao Paulo'],
    ['JoaoContratos', 'joao@teste.com', testPass, 'user', 'RJ', 'Tribunal de Contas do Estado'],
    ['AnaSustentavel', 'ana@teste.com', testPass, 'user', 'MG', 'Secretaria de Meio Ambiente'],
    ['CarlosPregao', 'carlos@teste.com', testPass, 'user', 'BA', 'Governo do Estado da Bahia'],
    ['FernandaGestao', 'fernanda@teste.com', testPass, 'user', 'DF', 'Ministerio da Economia'],
  ];
  for (const [username, email, pass, role, loc, org] of testUsers) {
    db.prepare('INSERT INTO users (username, email, password, role, location, organization) VALUES (?, ?, ?, ?, ?, ?)').run(username, email, pass, role, loc, org);
  }

  // IDs: admin=1, Maria=2, Joao=3, Ana=4, Carlos=5, Fernanda=6
  // Categorias: 1=Planejamento, 2=Obras, 3=Contratacao Direta, 4=Sustentabilidade, 5=Documentos, 6=Gestao Contratual, 7=Licitacao, 8=Inovacao, 9=Central de Compras, 10=Governanca, 11=Capacitacao

  const testTopics = [
    // Discussoes
    { title: 'Impacto do PCA na eficiencia das contratacoes', cat: 1, user: 2, type: 'discussion',
      content: 'Gostaria de abrir uma discussao sobre como o Plano de Contratacoes Anual tem impactado a eficiencia dos processos nas suas instituicoes. Na minha experiencia, a implementacao do PCA trouxe mais previsibilidade, mas tambem alguns desafios operacionais. Como tem sido na pratica de voces?' },
    { title: 'Fiscalizacao de contratos de obras: melhores praticas', cat: 2, user: 3, type: 'discussion',
      content: 'Venho compartilhar algumas praticas que temos adotado na fiscalizacao de contratos de obras publicas. A medicao por etapas com verificacao fotografica tem sido fundamental para garantir a qualidade. Quais ferramentas e metodologias voces utilizam?' },
    { title: 'Criterios ESG em licitacoes: como implementar?', cat: 4, user: 4, type: 'discussion',
      content: 'Com a crescente demanda por sustentabilidade nas compras publicas, como voces tem incorporado criterios ESG nos editais? Temos conseguido bons resultados com exigencia de certificacoes ambientais, mas ainda ha resistencia de alguns fornecedores.' },
    { title: 'Papel do agente de contratacao vs pregoeiro', cat: 10, user: 5, type: 'discussion',
      content: 'Com a Nova Lei de Licitacoes, o papel do agente de contratacao ficou mais amplo que o do antigo pregoeiro. Na pratica, como tem sido essa transicao nos orgaos de voces? Quais as principais dificuldades encontradas?' },
    { title: 'Portal PNCP: experiencias e dificuldades', cat: 8, user: 6, type: 'discussion',
      content: 'O Portal Nacional de Contratacoes Publicas ja e uma realidade. Gostaria de saber como tem sido a experiencia de voces com a plataforma. Encontraram dificuldades na integracao com os sistemas internos? Quais melhorias sugerem?' },

    // Perguntas
    { title: 'Qual o prazo minimo entre publicacao do edital e abertura no pregao eletronico?', cat: 7, user: 2, type: 'question',
      content: 'Qual o prazo minimo entre publicacao do edital e abertura no pregao eletronico?' },
    { title: 'Qual o limite de valor atualizado para dispensa por baixo valor?', cat: 3, user: 5, type: 'question',
      content: 'Qual o limite de valor atualizado para dispensa por baixo valor?' },
    { title: 'ETP e obrigatorio para todas as contratacoes?', cat: 1, user: 3, type: 'question',
      content: 'ETP e obrigatorio para todas as contratacoes?' },
    { title: 'Precisa de certificacao especifica para ser agente de contratacao?', cat: 10, user: 6, type: 'question',
      content: 'Precisa de certificacao especifica para ser agente de contratacao?' },
    { title: 'Existem cursos gratuitos sobre a Nova Lei de Licitacoes?', cat: 11, user: 4, type: 'question',
      content: 'Existem cursos gratuitos sobre a Nova Lei de Licitacoes?' },

    // Votacoes
    { title: 'Qual ferramenta digital voce mais utiliza nas contratacoes?', cat: 8, user: 2, type: 'poll',
      content: 'Queremos mapear as ferramentas mais utilizadas pelos profissionais de contratacoes publicas.',
      pollOptions: ['ComprasNet/ComprasGov', 'Sistemas proprios do orgao', 'Portal PNCP', 'Banco de Precos', 'Planilhas Excel'] },
    { title: 'Qual formato de capacitacao voce prefere?', cat: 11, user: 6, type: 'poll',
      content: 'Para melhorar nossos programas de treinamento, queremos saber a preferencia de formato.',
      pollOptions: ['Cursos online ao vivo', 'Cursos gravados (EAD)', 'Workshops presenciais', 'Mentorias individuais'] },
    { title: 'Maior desafio no planejamento de contratacoes?', cat: 1, user: 3, type: 'poll',
      content: 'Identifique o maior desafio que voce enfrenta na fase de planejamento.',
      pollOptions: ['Pesquisa de precos', 'Elaboracao do ETP', 'Definicao de requisitos tecnicos', 'Analise de riscos', 'Cronograma apertado'] },

    // Videos
    { title: 'Aula completa sobre Sistema de Registro de Precos', cat: 9, user: 4, type: 'video',
      content: 'Excelente aula sobre o Sistema de Registro de Precos na Nova Lei de Licitacoes. Aborda desde os conceitos basicos ate as particularidades da adesao a ata.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { title: 'Tutorial: Como elaborar o Orcamento Estimativo', cat: 1, user: 5, type: 'video',
      content: 'Tutorial pratico mostrando passo a passo como elaborar o orcamento estimativo para contratacoes publicas utilizando diferentes fontes de pesquisa de precos.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  ];

  for (const t of testTopics) {
    const topicRes = db.prepare('INSERT INTO topics (title, category_id, user_id, type, video_url) VALUES (?, ?, ?, ?, ?)')
      .run(t.title, t.cat, t.user, t.type, t.videoUrl || '');
    db.prepare('INSERT INTO posts (content, topic_id, user_id) VALUES (?, ?, ?)').run(t.content, topicRes.lastInsertRowid, t.user);

    // Tags aleatorias por topico
    const topicTags = [];
    if (t.cat === 1) topicTags.push('Planejamento');
    if (t.cat === 7 || t.type === 'question') topicTags.push('Licitacao');
    if (t.cat === 3) topicTags.push('Dispensa');
    if (t.cat === 4) topicTags.push('Compras Sustentaveis');
    if (t.cat === 10) topicTags.push('Agentes Publicos');
    if (t.cat === 8) topicTags.push('Boas Praticas');
    if (topicTags.length === 0) topicTags.push('Gestao Publica');
    for (const tagName of topicTags) {
      const tag = db.prepare('SELECT id FROM tags WHERE name = ?').get(tagName);
      if (tag) db.prepare('INSERT OR IGNORE INTO topic_tags (topic_id, tag_id) VALUES (?, ?)').run(topicRes.lastInsertRowid, tag.id);
    }

    // Opcoes de votacao
    if (t.type === 'poll' && t.pollOptions) {
      for (const opt of t.pollOptions) {
        db.prepare('INSERT INTO poll_options (topic_id, text) VALUES (?, ?)').run(topicRes.lastInsertRowid, opt);
      }
    }
  }

  // Respostas nos topicos de discussao e perguntas
  const replies = [
    // Topico 1 (PCA) - id 1 e o admin, topicos de teste comecam no id 2
    { topicId: 2, userId: 3, content: 'Na nossa instituicao o PCA reduziu em 30% o tempo medio dos processos. A chave foi o envolvimento das areas demandantes desde o inicio do planejamento.' },
    { topicId: 2, userId: 4, content: 'Concordo! Aqui tambem melhorou bastante. O maior desafio foi convencer as areas a planejarem com antecedencia, mas depois que viram os resultados, a adesao aumentou.' },
    { topicId: 2, userId: 6, content: 'No nosso caso, ainda estamos em fase de implementacao. Uma dica que dou e comecar com as contratacoes recorrentes - elas sao mais faceis de planejar e ja mostram resultados rapidos.' },

    { topicId: 3, userId: 2, content: 'Otimas praticas! Aqui usamos um checklist digital para cada etapa da obra. Cada item verificado gera automaticamente um registro com foto, data e responsavel.' },
    { topicId: 3, userId: 5, content: 'A medicao fotografica realmente e essencial. Complementaria sugerindo o uso de drones para obras maiores - reduz muito o tempo de verificacao em campo.' },

    { topicId: 4, userId: 2, content: 'Temos usado a exigencia de logistica reversa como criterio de sustentabilidade. Funciona bem para contratos de materiais de consumo.' },
    { topicId: 4, userId: 6, content: 'Na nossa experiencia, o importante e colocar criterios de sustentabilidade como requisito da contratacao, nao como criterio de julgamento. Assim evita questionamentos.' },

    { topicId: 5, userId: 2, content: 'A transicao tem sido desafiadora. O agente de contratacao agora precisa dominar todo o processo, nao apenas a sessao publica. Capacitacao continua e fundamental.' },
    { topicId: 5, userId: 4, content: 'Concordo. Aqui criamos um programa de mentoria onde agentes mais experientes acompanham os novos nos primeiros processos.' },

    // Respostas nas perguntas
    { topicId: 7, userId: 3, content: 'Para bens comuns o prazo minimo e de 8 dias uteis. Para servicos comuns de engenharia, 10 dias uteis. Confira o art. 55 da Lei 14.133/21.' },
    { topicId: 8, userId: 6, content: 'O valor atualizado para dispensa por baixo valor e de R$ 59.906,02 para compras e servicos, e R$ 119.812,03 para obras e servicos de engenharia (Decreto 12.343/2024).' },
    { topicId: 9, userId: 2, content: 'O ETP e obrigatorio como regra geral. Porem, ha casos de dispensa em que pode ser simplificado. Veja o art. 18 da Lei 14.133/21.' },
    { topicId: 10, userId: 3, content: 'Nao existe certificacao obrigatoria por lei, mas o agente deve comprovar formacao compativel. Muitos orgaos exigem cursos da ENAP ou equivalentes.' },
    { topicId: 11, userId: 5, content: 'Sim! A ENAP oferece varios cursos gratuitos. Tambem recomendo os materiais do TCU e a plataforma EVG (Escola Virtual do Governo).' },

    { topicId: 6, userId: 4, content: 'Otimo mapeamento! Na minha experiencia, o Banco de Precos tem sido cada vez mais utilizado, especialmente para pesquisa de precos de referencia.' },
    { topicId: 6, userId: 3, content: 'O PNCP ainda precisa evoluir bastante, mas ja e uma ferramenta importante para transparencia. A integracao com outros sistemas ainda e um desafio.' },
  ];

  for (const r of replies) {
    db.prepare('INSERT INTO posts (content, topic_id, user_id) VALUES (?, ?, ?)').run(r.content, r.topicId, r.userId);
  }

  // Likes distribuidos nos topicos
  const topicLikes = [
    [2,3],[2,4],[2,5],[2,6],  // topico 2: 4 likes
    [3,2],[3,4],[3,6],         // topico 3: 3 likes
    [4,2],[4,3],[4,5],         // topico 4: 3 likes
    [5,2],[5,4],               // topico 5: 2 likes
    [6,3],[6,4],[6,5],[6,6],  // topico 6: 4 likes
    [7,4],[7,5],               // topico 7: 2 likes
    [8,2],[8,3],               // topico 8: 2 likes
    [9,5],[9,6],               // topico 9: 2 likes
    [12,2],[12,3],[12,4],[12,5],[12,6], // topico 12 (poll ferramentas): 5 likes
    [14,2],[14,3],             // topico 14 (video SRP): 2 likes
  ];
  for (const [tid, uid] of topicLikes) {
    try { db.prepare('INSERT INTO likes (user_id, topic_id) VALUES (?, ?)').run(uid, tid); } catch {}
  }

  // Votos nas enquetes (topicos 12, 13, 14 = polls - ids dependem da ordem de insercao)
  // Poll 1 (ferramentas digitais) = topico id 12, opcoes comecam no id 1
  // Poll 2 (formato capacitacao) = topico id 13
  // Poll 3 (desafio planejamento) = topico id 14
  // Buscar opcoes dinamicamente
  const poll1Options = db.prepare('SELECT id FROM poll_options WHERE topic_id = 12').all();
  const poll2Options = db.prepare('SELECT id FROM poll_options WHERE topic_id = 13').all();
  const poll3Options = db.prepare('SELECT id FROM poll_options WHERE topic_id = 14').all();

  if (poll1Options.length >= 5) {
    try { db.prepare('INSERT INTO poll_votes (user_id, option_id, topic_id) VALUES (?, ?, ?)').run(2, poll1Options[0].id, 12); } catch {}
    try { db.prepare('INSERT INTO poll_votes (user_id, option_id, topic_id) VALUES (?, ?, ?)').run(3, poll1Options[3].id, 12); } catch {}
    try { db.prepare('INSERT INTO poll_votes (user_id, option_id, topic_id) VALUES (?, ?, ?)').run(4, poll1Options[0].id, 12); } catch {}
    try { db.prepare('INSERT INTO poll_votes (user_id, option_id, topic_id) VALUES (?, ?, ?)').run(5, poll1Options[2].id, 12); } catch {}
    try { db.prepare('INSERT INTO poll_votes (user_id, option_id, topic_id) VALUES (?, ?, ?)').run(6, poll1Options[0].id, 12); } catch {}
  }
  if (poll2Options.length >= 4) {
    try { db.prepare('INSERT INTO poll_votes (user_id, option_id, topic_id) VALUES (?, ?, ?)').run(2, poll2Options[1].id, 13); } catch {}
    try { db.prepare('INSERT INTO poll_votes (user_id, option_id, topic_id) VALUES (?, ?, ?)').run(3, poll2Options[0].id, 13); } catch {}
    try { db.prepare('INSERT INTO poll_votes (user_id, option_id, topic_id) VALUES (?, ?, ?)').run(5, poll2Options[2].id, 13); } catch {}
  }
  if (poll3Options.length >= 5) {
    try { db.prepare('INSERT INTO poll_votes (user_id, option_id, topic_id) VALUES (?, ?, ?)').run(2, poll3Options[0].id, 14); } catch {}
    try { db.prepare('INSERT INTO poll_votes (user_id, option_id, topic_id) VALUES (?, ?, ?)').run(4, poll3Options[1].id, 14); } catch {}
    try { db.prepare('INSERT INTO poll_votes (user_id, option_id, topic_id) VALUES (?, ?, ?)').run(6, poll3Options[4].id, 14); } catch {}
  }

  console.log('Dados de teste criados: 5 usuarios, 15 topicos, respostas, likes e votos');
}

// =================== MIDDLEWARES ===================
app.use(cors());
app.use(express.json({ limit: '5mb' }));

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token necessario' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalido' });
  }
}

function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try { req.user = jwt.verify(token, JWT_SECRET); } catch {}
  }
  next();
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acesso negado' });
  next();
}

// =================== AUTH ===================

app.post('/api/auth/register', (req, res) => {
  const { username, email, password, organization, location } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Preencha todos os campos' });
  if (password.length < 6) return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
  try {
    const hashed = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (username, email, password, organization, location) VALUES (?, ?, ?, ?, ?)')
      .run(username, email, hashed, organization || '', location || '');
    const user = db.prepare('SELECT id, username, email, role FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Nome de usuario ou email ja em uso' });
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Email ou senha invalidos' });
  if (user.banned) return res.status(403).json({ error: 'Sua conta foi banida' });
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
});

// =================== PERFIL ===================

app.get('/api/auth/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, username, email, role, location, organization, bio FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuario nao encontrado' });
  res.json(user);
});

app.put('/api/auth/profile', auth, (req, res) => {
  const { username, email, password, location, organization, bio } = req.body;
  try {
    if (username) db.prepare('UPDATE users SET username = ? WHERE id = ?').run(username, req.user.id);
    if (email) db.prepare('UPDATE users SET email = ? WHERE id = ?').run(email, req.user.id);
    if (password && password.length >= 6) {
      const hashed = bcrypt.hashSync(password, 10);
      db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, req.user.id);
    }
    if (location !== undefined) db.prepare('UPDATE users SET location = ? WHERE id = ?').run(location, req.user.id);
    if (organization !== undefined) db.prepare('UPDATE users SET organization = ? WHERE id = ?').run(organization, req.user.id);
    if (bio !== undefined) db.prepare('UPDATE users SET bio = ? WHERE id = ?').run(bio, req.user.id);

    const user = db.prepare('SELECT id, username, email, role, location, organization, bio FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Nome ou email ja em uso' });
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// =================== PERFIL PUBLICO ===================

app.get('/api/users/:id', (req, res) => {
  const u = db.prepare('SELECT id, username, role, location, organization, bio, created_at FROM users WHERE id = ?').get(req.params.id);
  if (!u) return res.status(404).json({ error: 'Usuario nao encontrado' });
  const postCount = db.prepare('SELECT COUNT(*) as c FROM posts WHERE user_id = ?').get(req.params.id);
  const topicCount = db.prepare('SELECT COUNT(*) as c FROM topics WHERE user_id = ?').get(req.params.id);
  u.post_count = postCount.c;
  u.topic_count = topicCount.c;
  res.json(u);
});

// =================== MENSAGENS ===================

app.post('/api/messages', auth, (req, res) => {
  const { receiver_id, content } = req.body;
  if (!receiver_id || !content || !content.trim()) return res.status(400).json({ error: 'Destinatario e conteudo obrigatorios' });
  if (receiver_id === req.user.id) return res.status(400).json({ error: 'Nao e possivel enviar mensagem para si mesmo' });
  const receiver = db.prepare('SELECT id FROM users WHERE id = ?').get(receiver_id);
  if (!receiver) return res.status(404).json({ error: 'Destinatario nao encontrado' });

  const result = db.prepare('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)').run(req.user.id, receiver_id, content.trim());

  // Criar notificacao para o destinatario
  db.prepare('INSERT INTO notifications (user_id, type, content, reference_id) VALUES (?, ?, ?, ?)')
    .run(receiver_id, 'message', `Nova mensagem de ${req.user.username}`, req.user.id);

  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);
  res.json(msg);
});

app.get('/api/messages', auth, (req, res) => {
  // Buscar todas as conversas agrupadas pelo outro usuario
  const conversations = db.prepare(`
    SELECT
      CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as other_user_id,
      MAX(m.id) as last_message_id
    FROM messages m
    WHERE sender_id = ? OR receiver_id = ?
    GROUP BY other_user_id
    ORDER BY last_message_id DESC
  `).all(req.user.id, req.user.id, req.user.id);

  const result = conversations.map(conv => {
    const otherUser = db.prepare('SELECT id, username FROM users WHERE id = ?').get(conv.other_user_id);
    const lastMsg = db.prepare('SELECT content, created_at FROM messages WHERE id = ?').get(conv.last_message_id);
    const unreadCount = db.prepare('SELECT COUNT(*) as c FROM messages WHERE sender_id = ? AND receiver_id = ? AND read = 0')
      .get(conv.other_user_id, req.user.id);
    return {
      other_user_id: conv.other_user_id,
      other_username: otherUser?.username || 'Deletado',
      last_message: lastMsg?.content || '',
      last_message_date: lastMsg?.created_at || '',
      unread_count: unreadCount.c,
    };
  });

  res.json(result);
});

app.get('/api/messages/:userId', auth, (req, res) => {
  const otherId = parseInt(req.params.userId);
  const otherUser = db.prepare('SELECT id, username FROM users WHERE id = ?').get(otherId);
  if (!otherUser) return res.status(404).json({ error: 'Usuario nao encontrado' });

  // Marcar como lidas as mensagens recebidas do outro usuario
  db.prepare('UPDATE messages SET read = 1 WHERE sender_id = ? AND receiver_id = ?').run(otherId, req.user.id);
  // Limpar notificacoes de mensagem desse usuario
  db.prepare('DELETE FROM notifications WHERE user_id = ? AND type = ? AND reference_id = ?').run(req.user.id, 'message', otherId);

  const messages = db.prepare(`
    SELECT * FROM messages
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY created_at ASC
  `).all(req.user.id, otherId, otherId, req.user.id);

  res.json({ messages, other_user: otherUser });
});

// =================== NOTIFICACOES ===================

app.get('/api/notifications', auth, (req, res) => {
  const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(req.user.id);
  const unreadCount = db.prepare('SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND read = 0').get(req.user.id);
  res.json({ notifications, unread_count: unreadCount.c });
});

app.put('/api/notifications/read', auth, (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(req.user.id);
  res.json({ ok: true });
});

// =================== CATEGORIAS ===================

app.get('/api/categories', (req, res) => {
  const categories = db.prepare(`
    SELECT c.*,
      (SELECT COUNT(*) FROM topics WHERE category_id = c.id) as topic_count,
      (SELECT COUNT(*) FROM posts p JOIN topics t ON p.topic_id = t.id WHERE t.category_id = c.id) as post_count
    FROM categories c ORDER BY c.id
  `).all();
  res.json(categories);
});

app.post('/api/categories', auth, adminOnly, (req, res) => {
  const { name, description, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome obrigatorio' });
  const result = db.prepare('INSERT INTO categories (name, description, color) VALUES (?, ?, ?)').run(name, description || '', color || '#6366f1');
  res.json(db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid));
});

app.put('/api/categories/:id', auth, adminOnly, (req, res) => {
  const { name, description, color } = req.body;
  db.prepare('UPDATE categories SET name = COALESCE(?, name), description = COALESCE(?, description), color = COALESCE(?, color) WHERE id = ?')
    .run(name, description, color, req.params.id);
  res.json(db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id));
});

app.delete('/api/categories/:id', auth, adminOnly, (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// =================== TAGS ===================

app.get('/api/tags', (req, res) => {
  res.json(db.prepare('SELECT * FROM tags ORDER BY name').all());
});

app.post('/api/tags', auth, adminOnly, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome obrigatorio' });
  try {
    const result = db.prepare('INSERT INTO tags (name) VALUES (?)').run(name);
    res.json({ id: result.lastInsertRowid, name });
  } catch {
    res.status(400).json({ error: 'Tag ja existe' });
  }
});

// =================== TOPICOS ===================

// Lista TODOS os topicos (home page estilo Discourse)
app.get('/api/topics', optionalAuth, (req, res) => {
  const { sort, category_id } = req.query;

  let orderBy = 'ORDER BY t.pinned DESC, last_activity DESC';
  if (sort === 'new') orderBy = 'ORDER BY t.pinned DESC, t.created_at DESC';
  if (sort === 'top') orderBy = 'ORDER BY like_count DESC';
  if (sort === 'replies') orderBy = 'ORDER BY reply_count DESC';

  let where = '';
  const params = [];
  if (category_id) {
    where = 'WHERE t.category_id = ?';
    params.push(category_id);
  }

  const topics = db.prepare(`
    SELECT t.*, u.username,
      c.name as category_name, c.color as category_color,
      (SELECT COUNT(*) FROM posts WHERE topic_id = t.id) - 1 as reply_count,
      (SELECT COUNT(*) FROM likes WHERE topic_id = t.id) as like_count,
      COALESCE((SELECT MAX(p.created_at) FROM posts p WHERE p.topic_id = t.id), t.created_at) as last_activity
    FROM topics t
    JOIN users u ON t.user_id = u.id
    JOIN categories c ON t.category_id = c.id
    ${where}
    ${orderBy}
  `).all(...params);

  const tagStmt = db.prepare('SELECT tg.name FROM topic_tags tt JOIN tags tg ON tt.tag_id = tg.id WHERE tt.topic_id = ?');
  for (const topic of topics) {
    topic.tags = tagStmt.all(topic.id).map(t => t.name);
  }

  res.json(topics);
});

app.get('/api/categories/:id/topics', optionalAuth, (req, res) => {
  const topics = db.prepare(`
    SELECT t.*, u.username,
      c.name as category_name, c.color as category_color,
      (SELECT COUNT(*) FROM posts WHERE topic_id = t.id) - 1 as reply_count,
      (SELECT COUNT(*) FROM likes WHERE topic_id = t.id) as like_count,
      COALESCE((SELECT MAX(p.created_at) FROM posts p WHERE p.topic_id = t.id), t.created_at) as last_activity
    FROM topics t
    JOIN users u ON t.user_id = u.id
    JOIN categories c ON t.category_id = c.id
    WHERE t.category_id = ?
    ORDER BY t.pinned DESC, last_activity DESC
  `).all(req.params.id);

  const tagStmt = db.prepare('SELECT tg.name FROM topic_tags tt JOIN tags tg ON tt.tag_id = tg.id WHERE tt.topic_id = ?');
  for (const topic of topics) {
    topic.tags = tagStmt.all(topic.id).map(t => t.name);
  }
  res.json(topics);
});

app.post('/api/topics', auth, (req, res) => {
  const { title, category_id, content, tags, type, poll_options, image_url, video_url } = req.body;
  if (!title || !category_id || !content) return res.status(400).json({ error: 'Titulo, categoria e conteudo obrigatorios' });

  const user = db.prepare('SELECT banned FROM users WHERE id = ?').get(req.user.id);
  if (user?.banned) return res.status(403).json({ error: 'Sua conta foi banida' });

  // Validacoes por tipo
  if (type === 'question' && content.length > 100) return res.status(400).json({ error: 'Pergunta deve ter no maximo 100 caracteres' });
  if (type === 'poll' && (!poll_options || !Array.isArray(poll_options) || poll_options.filter(o => o.trim()).length < 2)) {
    return res.status(400).json({ error: 'Votacao precisa de pelo menos 2 alternativas' });
  }

  const topicResult = db.prepare('INSERT INTO topics (title, category_id, user_id, type, image_url, video_url) VALUES (?, ?, ?, ?, ?, ?)')
    .run(title, category_id, req.user.id, type || 'discussion', image_url || '', video_url || '');
  db.prepare('INSERT INTO posts (content, topic_id, user_id) VALUES (?, ?, ?)').run(content, topicResult.lastInsertRowid, req.user.id);

  // Criar opcoes de votacao
  if (type === 'poll' && poll_options && Array.isArray(poll_options)) {
    for (const optionText of poll_options) {
      if (optionText.trim()) {
        db.prepare('INSERT INTO poll_options (topic_id, text) VALUES (?, ?)').run(topicResult.lastInsertRowid, optionText.trim());
      }
    }
  }

  if (tags && Array.isArray(tags)) {
    for (const tagName of tags) {
      let tag = db.prepare('SELECT id FROM tags WHERE name = ?').get(tagName);
      if (!tag) {
        const r = db.prepare('INSERT INTO tags (name) VALUES (?)').run(tagName);
        tag = { id: r.lastInsertRowid };
      }
      db.prepare('INSERT OR IGNORE INTO topic_tags (topic_id, tag_id) VALUES (?, ?)').run(topicResult.lastInsertRowid, tag.id);
    }
  }

  res.json(db.prepare('SELECT * FROM topics WHERE id = ?').get(topicResult.lastInsertRowid));
});

app.put('/api/topics/:id/pin', auth, adminOnly, (req, res) => {
  const topic = db.prepare('SELECT pinned FROM topics WHERE id = ?').get(req.params.id);
  if (!topic) return res.status(404).json({ error: 'Topico nao encontrado' });
  db.prepare('UPDATE topics SET pinned = ? WHERE id = ?').run(topic.pinned ? 0 : 1, req.params.id);
  res.json({ ok: true });
});

app.put('/api/topics/:id/lock', auth, adminOnly, (req, res) => {
  const topic = db.prepare('SELECT locked FROM topics WHERE id = ?').get(req.params.id);
  if (!topic) return res.status(404).json({ error: 'Topico nao encontrado' });
  db.prepare('UPDATE topics SET locked = ? WHERE id = ?').run(topic.locked ? 0 : 1, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/topics/:id', auth, (req, res) => {
  const topic = db.prepare('SELECT user_id FROM topics WHERE id = ?').get(req.params.id);
  if (!topic) return res.status(404).json({ error: 'Topico nao encontrado' });
  if (topic.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Sem permissao' });
  db.prepare('DELETE FROM topic_tags WHERE topic_id = ?').run(req.params.id);
  db.prepare('DELETE FROM likes WHERE topic_id = ?').run(req.params.id);
  db.prepare('DELETE FROM posts WHERE topic_id = ?').run(req.params.id);
  db.prepare('DELETE FROM topics WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// =================== VOTACAO ===================

app.post('/api/topics/:id/vote', auth, (req, res) => {
  const { option_id } = req.body;
  const topicId = parseInt(req.params.id);

  const topic = db.prepare('SELECT type FROM topics WHERE id = ?').get(topicId);
  if (!topic || topic.type !== 'poll') return res.status(400).json({ error: 'Este topico nao e uma votacao' });

  const option = db.prepare('SELECT id FROM poll_options WHERE id = ? AND topic_id = ?').get(option_id, topicId);
  if (!option) return res.status(400).json({ error: 'Opcao invalida' });

  try {
    db.prepare('INSERT INTO poll_votes (user_id, option_id, topic_id) VALUES (?, ?, ?)').run(req.user.id, option_id, topicId);
  } catch {
    db.prepare('UPDATE poll_votes SET option_id = ? WHERE user_id = ? AND topic_id = ?').run(option_id, req.user.id, topicId);
  }

  // Retornar dados atualizados
  const options = db.prepare(`
    SELECT po.id, po.text,
      (SELECT COUNT(*) FROM poll_votes WHERE option_id = po.id) as vote_count
    FROM poll_options po WHERE po.topic_id = ?
  `).all(topicId);
  const totalVotes = options.reduce((sum, o) => sum + o.vote_count, 0);

  res.json({ ok: true, poll_options: options, total_votes: totalVotes, user_vote: option_id });
});

// =================== LIKES ===================

app.post('/api/topics/:id/like', auth, (req, res) => {
  try {
    db.prepare('INSERT INTO likes (user_id, topic_id) VALUES (?, ?)').run(req.user.id, req.params.id);
    const count = db.prepare('SELECT COUNT(*) as c FROM likes WHERE topic_id = ?').get(req.params.id);
    res.json({ liked: true, count: count.c });
  } catch {
    db.prepare('DELETE FROM likes WHERE user_id = ? AND topic_id = ?').run(req.user.id, req.params.id);
    const count = db.prepare('SELECT COUNT(*) as c FROM likes WHERE topic_id = ?').get(req.params.id);
    res.json({ liked: false, count: count.c });
  }
});

// =================== POSTS ===================

app.get('/api/topics/:id', optionalAuth, (req, res) => {
  const topic = db.prepare(`
    SELECT t.*, u.username, c.name as category_name, c.id as category_id, c.color as category_color,
      (SELECT COUNT(*) FROM likes WHERE topic_id = t.id) as like_count
    FROM topics t
    JOIN users u ON t.user_id = u.id
    JOIN categories c ON t.category_id = c.id
    WHERE t.id = ?
  `).get(req.params.id);
  if (!topic) return res.status(404).json({ error: 'Topico nao encontrado' });

  db.prepare('UPDATE topics SET views = views + 1 WHERE id = ?').run(req.params.id);

  const posts = db.prepare(`
    SELECT p.*, u.username, u.role, u.created_at as user_since,
      (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count
    FROM posts p JOIN users u ON p.user_id = u.id
    WHERE p.topic_id = ? ORDER BY p.created_at ASC
  `).all(req.params.id);

  // Check which posts the user liked
  if (req.user) {
    const likedPosts = db.prepare('SELECT post_id FROM post_likes WHERE user_id = ? AND post_id IN (SELECT id FROM posts WHERE topic_id = ?)').all(req.user.id, req.params.id);
    const likedSet = new Set(likedPosts.map(l => l.post_id));
    for (const post of posts) { post.user_liked = likedSet.has(post.id); }
  }

  // Frequent users
  const frequentUsers = db.prepare(`
    SELECT DISTINCT u.id, u.username FROM posts p JOIN users u ON p.user_id = u.id
    WHERE p.topic_id = ? LIMIT 8
  `).all(req.params.id);

  topic.tags = db.prepare('SELECT tg.name FROM topic_tags tt JOIN tags tg ON tt.tag_id = tg.id WHERE tt.topic_id = ?')
    .all(req.params.id).map(t => t.name);

  let userLiked = false;
  if (req.user) {
    userLiked = !!db.prepare('SELECT 1 FROM likes WHERE user_id = ? AND topic_id = ?').get(req.user.id, req.params.id);
  }
  topic.user_liked = userLiked;

  // Dados de votacao
  if (topic.type === 'poll') {
    const options = db.prepare(`
      SELECT po.id, po.text,
        (SELECT COUNT(*) FROM poll_votes WHERE option_id = po.id) as vote_count
      FROM poll_options po WHERE po.topic_id = ?
    `).all(req.params.id);
    topic.poll_options = options;
    topic.total_votes = options.reduce((sum, o) => sum + o.vote_count, 0);
    if (req.user) {
      const userVote = db.prepare('SELECT option_id FROM poll_votes WHERE user_id = ? AND topic_id = ?').get(req.user.id, req.params.id);
      topic.user_vote = userVote?.option_id || null;
    }
  }

  res.json({ topic, posts, frequentUsers });
});

app.post('/api/posts', auth, (req, res) => {
  const { content, topic_id } = req.body;
  if (!content || !topic_id) return res.status(400).json({ error: 'Conteudo e topico obrigatorios' });
  const user = db.prepare('SELECT banned FROM users WHERE id = ?').get(req.user.id);
  if (user?.banned) return res.status(403).json({ error: 'Sua conta foi banida' });
  const topic = db.prepare('SELECT locked FROM topics WHERE id = ?').get(topic_id);
  if (!topic) return res.status(404).json({ error: 'Topico nao encontrado' });
  if (topic.locked && req.user.role !== 'admin') return res.status(403).json({ error: 'Este topico esta bloqueado' });

  const result = db.prepare('INSERT INTO posts (content, topic_id, user_id) VALUES (?, ?, ?)').run(content, topic_id, req.user.id);
  const post = db.prepare('SELECT p.*, u.username, u.role FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?').get(result.lastInsertRowid);
  res.json(post);
});

app.put('/api/posts/:id', auth, (req, res) => {
  const post = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post nao encontrado' });
  if (post.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Sem permissao' });
  db.prepare('UPDATE posts SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.body.content, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/posts/:id', auth, (req, res) => {
  const post = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post nao encontrado' });
  if (post.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Sem permissao' });
  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// =================== POST LIKES ===================

app.post('/api/posts/:id/like', auth, (req, res) => {
  try {
    db.prepare('INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)').run(req.user.id, req.params.id);
    const count = db.prepare('SELECT COUNT(*) as c FROM post_likes WHERE post_id = ?').get(req.params.id);
    res.json({ liked: true, count: count.c });
  } catch {
    db.prepare('DELETE FROM post_likes WHERE user_id = ? AND post_id = ?').run(req.user.id, req.params.id);
    const count = db.prepare('SELECT COUNT(*) as c FROM post_likes WHERE post_id = ?').get(req.params.id);
    res.json({ liked: false, count: count.c });
  }
});

// =================== BEST ANSWER ===================

app.put('/api/posts/:id/best-answer', auth, adminOnly, (req, res) => {
  const post = db.prepare('SELECT topic_id, best_answer FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post nao encontrado' });
  // Remove best_answer de outros posts do mesmo topico
  db.prepare('UPDATE posts SET best_answer = 0 WHERE topic_id = ?').run(post.topic_id);
  if (!post.best_answer) {
    db.prepare('UPDATE posts SET best_answer = 1 WHERE id = ?').run(req.params.id);
  }
  res.json({ ok: true });
});

// =================== RELATED TOPICS ===================

app.get('/api/topics/:id/related', (req, res) => {
  const topic = db.prepare('SELECT category_id FROM topics WHERE id = ?').get(req.params.id);
  if (!topic) return res.json([]);
  const related = db.prepare(`
    SELECT t.id, t.title, c.name as category_name, c.color as category_color,
      (SELECT COUNT(*) FROM likes WHERE topic_id = t.id) as like_count,
      (SELECT COUNT(*) FROM posts WHERE topic_id = t.id) - 1 as reply_count,
      t.views,
      COALESCE((SELECT MAX(p.created_at) FROM posts p WHERE p.topic_id = t.id), t.created_at) as last_activity
    FROM topics t JOIN categories c ON t.category_id = c.id
    WHERE t.id != ? ORDER BY RANDOM() LIMIT 5
  `).all(req.params.id);
  res.json(related);
});

// =================== SEARCH ===================

app.get('/api/search', (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json([]);
  const topics = db.prepare(`
    SELECT t.id, t.title, c.name as category_name, c.color as category_color
    FROM topics t JOIN categories c ON t.category_id = c.id
    WHERE t.title LIKE ? LIMIT 10
  `).all(`%${q}%`);
  res.json(topics);
});

// =================== ADMIN ===================

app.get('/api/admin/users', auth, adminOnly, (req, res) => {
  res.json(db.prepare('SELECT id, username, email, role, banned, created_at FROM users ORDER BY created_at DESC').all());
});

app.put('/api/admin/users/:id/ban', auth, adminOnly, (req, res) => {
  const target = db.prepare('SELECT id, banned, role FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'Usuario nao encontrado' });
  if (target.id === req.user.id) return res.status(400).json({ error: 'Nao e possivel banir a si mesmo' });
  db.prepare('UPDATE users SET banned = ? WHERE id = ?').run(target.banned ? 0 : 1, req.params.id);
  res.json({ ok: true, banned: !target.banned });
});

app.delete('/api/admin/users/:id', auth, adminOnly, (req, res) => {
  const target = db.prepare('SELECT id, role FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'Usuario nao encontrado' });
  if (target.id === req.user.id) return res.status(400).json({ error: 'Nao e possivel deletar a si mesmo' });
  db.prepare('DELETE FROM post_likes WHERE user_id = ?').run(req.params.id);
  db.prepare('DELETE FROM likes WHERE user_id = ?').run(req.params.id);
  db.prepare('DELETE FROM posts WHERE user_id = ?').run(req.params.id);
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.put('/api/admin/users/:id/role', auth, adminOnly, (req, res) => {
  const { role } = req.body;
  if (!role || !['user', 'moderator', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Papel invalido. Use: user, moderator ou admin' });
  }
  const target = db.prepare('SELECT id, role FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'Usuario nao encontrado' });
  if (target.id === req.user.id) return res.status(400).json({ error: 'Nao e possivel alterar seu proprio papel' });
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  res.json({ ok: true, role });
});

// =================== SERVIR REACT BUILD ===================
// Em producao, servir os arquivos estaticos do React
const buildPath = path.join(__dirname, '..', 'build');
app.use(express.static(buildPath));

// Qualquer rota que nao seja /api, servir o index.html do React (SPA)
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\nServidor rodando na porta ${PORT}`);
  console.log('Forum RECPSP API pronta!\n');
});
