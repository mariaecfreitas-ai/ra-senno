# Achados e Perdidos

Sistema web para a escola: quem encontra um objeto cadastra no site, e quem perdeu procura e vê como retirar.

**Problema:** objetos são encontrados na escola, mas os alunos não sabem onde procurar nem a quem pedir.
**Solução:** um sistema com cadastro, busca e controle de status de cada objeto.

## Tecnologias

| Parte | Tecnologia | O que faz |
|---|---|---|
| Frontend | HTML, CSS e JavaScript | As telas do site, os formulários e a busca |
| Backend | Node.js + Express | Recebe as requisições, aplica as regras e fala com o banco |
| API | REST com JSON | Comunicação entre o frontend e o backend |
| Banco de dados | SQLite | Guarda os objetos na tabela `objetos` (arquivo `banco.db`) |

## Como rodar

1. Instale o **Node.js** (versão 22.13 ou mais nova; a versão LTS do site nodejs.org serve).
2. Abra o terminal nesta pasta e rode:

   ```
   npm install
   npm start
   ```

3. Abra **http://localhost:3000** no navegador.

Na primeira vez, o banco é criado sozinho com 8 objetos de exemplo.
Para voltar aos exemplos, pare o servidor (Ctrl + C), apague o arquivo `banco.db` e rode `npm start` de novo.

## Estrutura

```
achados-e-perdidos/
├── server.js        → backend: servidor Express e rotas da API
├── db.js            → banco de dados: cria a tabela e os exemplos
├── package.json     → dependências e o comando npm start
└── public/          → frontend
    ├── index.html   → as 4 telas
    ├── style.css    → o visual
    └── app.js       → lógica das telas e chamadas para a API
```

## Telas

- **Início:** apresentação, botões principais e objetos encontrados recentemente
- **Objetos encontrados:** lista com busca e filtros por categoria, local e status
- **Cadastrar:** formulário com foto opcional e prévia do card
- **Gerenciar:** editar, excluir e mudar o status, com o painel das requisições feitas à API

## API (CRUD)

| Método | Endereço | Ação | Resposta |
|---|---|---|---|
| GET | `/api/objetos` | Listar todos (consulta) | 200 |
| GET | `/api/objetos/:id` | Ver um objeto | 200 ou 404 |
| POST | `/api/objetos` | Cadastrar (cadastro) | 201 ou 400 |
| PUT | `/api/objetos/:id` | Editar (alteração) | 200, 400 ou 404 |
| DELETE | `/api/objetos/:id` | Excluir (exclusão) | 204 ou 404 |

Regras que o backend confere antes de salvar: nome, local e data são obrigatórios; a categoria e o status precisam ser um dos valores aceitos; a data tem que estar no formato AAAA-MM-DD.

## Banco de dados — tabela `objetos`

| Campo | Tipo | Descrição |
|---|---|---|
| id | INTEGER (chave primária) | Número do registro, criado automaticamente |
| nome | TEXT | Nome do objeto |
| categoria | TEXT | mochila, garrafa, chaves, estojo, roupa, eletronico, livro ou outros |
| descricao | TEXT | Cor, marca e detalhes |
| local_encontrado | TEXT | Onde foi encontrado |
| data_encontrada | TEXT | Data em que foi encontrado |
| status | TEXT | disponivel, aguardando ou devolvido |
| foto | TEXT | Foto enviada no cadastro (opcional) |
| desenho | TEXT | Desenho usado nos objetos de exemplo |
| criado_em | TEXT | Data e hora do cadastro |

## Fluxo de uma operação (cadastrar objeto)

1. O usuário preenche o formulário na tela **Cadastrar** (frontend).
2. O JavaScript envia os dados em JSON com `POST /api/objetos` (API).
3. O Express confere os dados e grava na tabela `objetos` com um `INSERT` (backend + banco).
4. A API responde `201 Created` com o objeto salvo, e o site mostra ele na lista.

## Colocar online

O Netlify só hospeda sites estáticos, então ele não roda o backend. Para ter um link público, use um serviço que roda Node.js, como o **Render**:

1. Suba esta pasta para um repositório no GitHub.
2. No Render, crie um **Web Service** ligado ao repositório.
3. Build command: `npm install` · Start command: `npm start`

No plano grátis, o disco é apagado quando o serviço reinicia, então o banco volta para os 8 exemplos. Para a apresentação, isso não atrapalha.
