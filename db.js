// ===================================================================
// BANCO DE DADOS
// Usamos o SQLite, um banco de dados SQL que fica salvo num arquivo
// (banco.db) dentro da pasta do projeto. Ele já vem dentro do Node.js.
// ===================================================================
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const ARQUIVO = path.join(__dirname, 'banco.db');
const db = new DatabaseSync(ARQUIVO);

// Cria a tabela "objetos" se ela ainda não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS objetos (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    nome             TEXT    NOT NULL,
    categoria        TEXT    NOT NULL,
    descricao        TEXT,
    local_encontrado TEXT    NOT NULL,
    data_encontrada  TEXT    NOT NULL,
    status           TEXT    NOT NULL DEFAULT 'disponivel'
                     CHECK (status IN ('disponivel', 'aguardando', 'devolvido')),
    foto             TEXT,
    desenho          TEXT,
    criado_em        TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

// Se a tabela estiver vazia, coloca alguns objetos de exemplo
const total = db.prepare('SELECT COUNT(*) AS total FROM objetos').get().total;

if (total === 0) {
  const inserir = db.prepare(`
    INSERT INTO objetos (nome, categoria, descricao, local_encontrado, data_encontrada, status, desenho)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const exemplos = [
    ['Mochila preta', 'mochila', 'Mochila preta com chaveiro de ursinho no zíper. Tinha um caderno de matemática dentro.', 'Sala 203', '2026-10-01', 'disponivel', 'mochila-preta'],
    ['Garrafa azul', 'garrafa', 'Garrafa térmica azul de 500 ml com um adesivo de estrela.', 'Biblioteca', '2026-10-02', 'disponivel', 'garrafa-azul'],
    ['Chaveiro com duas chaves', 'chaves', 'Uma chave prateada e uma dourada num chaveiro de pompom rosa.', 'Quadra', '2026-09-30', 'aguardando', 'chaveiro'],
    ['Estojo rosa', 'estojo', 'Estojo rosa de tecido com canetas coloridas e uma borracha de morango.', 'Sala 105', '2026-10-03', 'disponivel', 'estojo-rosa'],
    ['Moletom cinza', 'roupa', 'Moletom cinza tamanho M com capuz, sem estampa.', 'Pátio', '2026-09-28', 'devolvido', 'moletom-cinza'],
    ['Fone de ouvido branco', 'eletronico', 'Fone com fio, branco, deixado em cima de uma mesa da cantina.', 'Cantina', '2026-10-05', 'disponivel', 'fone-branco'],
    ['Caderno de capa roxa', 'livro', 'Caderno de 10 matérias, capa roxa com o nome riscado.', 'Laboratório', '2026-10-06', 'aguardando', 'caderno-roxo'],
    ['Guarda-chuva preto', 'outros', 'Guarda-chuva preto dobrável com cabo de madeira.', 'Secretaria', '2026-09-25', 'devolvido', 'guarda-chuva']
  ];

  for (const exemplo of exemplos) {
    inserir.run(...exemplo);
  }
  console.log('Banco de dados criado com ' + exemplos.length + ' objetos de exemplo.');
}

module.exports = db;
