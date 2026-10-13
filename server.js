// ===================================================================
// BACKEND (Node.js + Express)
// Recebe as requisições do frontend, aplica as regras do sistema
// e conversa com o banco de dados.
// ===================================================================
const path = require('node:path');
const express = require('express');
const db = require('./db');

const app = express();
const PORTA = process.env.PORT || 3000;

// Entende o corpo das requisições em JSON (limite maior por causa das fotos)
app.use(express.json({ limit: '5mb' }));

// Entrega os arquivos do frontend (pasta public)
app.use(express.static(path.join(__dirname, 'public')));

// -------------------------------------------------------------------
// REGRAS DO SISTEMA
// -------------------------------------------------------------------
const CATEGORIAS = ['mochila', 'garrafa', 'chaves', 'estojo', 'roupa', 'eletronico', 'livro', 'outros'];
const STATUS = ['disponivel', 'aguardando', 'devolvido'];

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

// Confere se os dados de um objeto estão certos. Devolve a lista de erros.
function validar(o) {
  const erros = [];
  if (!texto(o.nome)) erros.push('O nome do objeto é obrigatório.');
  if (texto(o.nome).length > 60) erros.push('O nome pode ter no máximo 60 letras.');
  if (!CATEGORIAS.includes(o.categoria)) erros.push('Categoria inválida.');
  if (!texto(o.local_encontrado)) erros.push('O local onde foi encontrado é obrigatório.');
  if (texto(o.local_encontrado).length > 40) erros.push('O local pode ter no máximo 40 letras.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(o.data_encontrada || '')) erros.push('A data deve estar no formato AAAA-MM-DD.');
  if (!STATUS.includes(o.status)) erros.push('Status inválido.');
  if (o.descricao && String(o.descricao).length > 280) erros.push('A descrição pode ter no máximo 280 letras.');
  if (o.foto && !String(o.foto).startsWith('data:image/')) erros.push('A foto precisa ser uma imagem.');
  return erros;
}

function buscarPorId(id) {
  return db.prepare('SELECT * FROM objetos WHERE id = ?').get(id);
}

// -------------------------------------------------------------------
// API — ENDPOINTS DO CRUD
// -------------------------------------------------------------------

// GET /api/objetos → lista todos os objetos (consulta)
app.get('/api/objetos', (req, res) => {
  const objetos = db.prepare('SELECT * FROM objetos ORDER BY data_encontrada DESC, id DESC').all();
  res.json(objetos);
});

// GET /api/objetos/:id → mostra um objeto
app.get('/api/objetos/:id', (req, res) => {
  const objeto = buscarPorId(Number(req.params.id));
  if (!objeto) return res.status(404).json({ erro: 'Objeto não encontrado.' });
  res.json(objeto);
});

// POST /api/objetos → cadastra um objeto novo (cadastro)
app.post('/api/objetos', (req, res) => {
  const novo = {
    nome: texto(req.body.nome),
    categoria: req.body.categoria,
    descricao: texto(req.body.descricao),
    local_encontrado: texto(req.body.local_encontrado),
    data_encontrada: req.body.data_encontrada,
    status: req.body.status || 'disponivel',
    foto: req.body.foto || null
  };

  const erros = validar(novo);
  if (erros.length) return res.status(400).json({ erro: erros.join(' ') });

  const resultado = db.prepare(`
    INSERT INTO objetos (nome, categoria, descricao, local_encontrado, data_encontrada, status, foto)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(novo.nome, novo.categoria, novo.descricao, novo.local_encontrado, novo.data_encontrada, novo.status, novo.foto);

  res.status(201).json(buscarPorId(Number(resultado.lastInsertRowid)));
});

// PUT /api/objetos/:id → altera um objeto (alteração)
// Aceita só os campos que mudaram, por exemplo { "status": "devolvido" }
app.put('/api/objetos/:id', (req, res) => {
  const id = Number(req.params.id);
  const atual = buscarPorId(id);
  if (!atual) return res.status(404).json({ erro: 'Objeto não encontrado.' });

  const campos = ['nome', 'categoria', 'descricao', 'local_encontrado', 'data_encontrada', 'status', 'foto'];
  const atualizado = { ...atual };
  for (const campo of campos) {
    if (req.body[campo] !== undefined) atualizado[campo] = req.body[campo];
  }
  atualizado.nome = texto(atualizado.nome);
  atualizado.descricao = texto(atualizado.descricao);
  atualizado.local_encontrado = texto(atualizado.local_encontrado);

  // Se mudou a categoria, o desenho antigo não serve mais
  if (atualizado.categoria !== atual.categoria) atualizado.desenho = null;

  const erros = validar(atualizado);
  if (erros.length) return res.status(400).json({ erro: erros.join(' ') });

  db.prepare(`
    UPDATE objetos
    SET nome = ?, categoria = ?, descricao = ?, local_encontrado = ?, data_encontrada = ?, status = ?, foto = ?, desenho = ?
    WHERE id = ?
  `).run(atualizado.nome, atualizado.categoria, atualizado.descricao, atualizado.local_encontrado,
    atualizado.data_encontrada, atualizado.status, atualizado.foto || null, atualizado.desenho || null, id);

  res.json(buscarPorId(id));
});

// DELETE /api/objetos/:id → exclui um objeto (exclusão)
app.delete('/api/objetos/:id', (req, res) => {
  const resultado = db.prepare('DELETE FROM objetos WHERE id = ?').run(Number(req.params.id));
  if (resultado.changes === 0) return res.status(404).json({ erro: 'Objeto não encontrado.' });
  res.status(204).end();
});

// Qualquer outro endereço da API que não existe
app.use('/api', (req, res) => {
  res.status(404).json({ erro: 'Endereço da API não encontrado.' });
});

// Se der algum erro inesperado (ex.: JSON quebrado ou foto grande demais)
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') return res.status(400).json({ erro: 'A foto é grande demais.' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ erro: 'Os dados enviados não são um JSON válido.' });
  console.error(err);
  res.status(500).json({ erro: 'Erro no servidor.' });
});

app.listen(PORTA, () => {
  console.log('Achados e Perdidos rodando em http://localhost:' + PORTA);
});
