 PERFIL DIGITAL - BACKEND

API RESTful para Análise de Bem-Estar Digital
Backend da plataforma desenvolvida para a Prefeitura do Recife

SOBRE O PROJETO

O Perfil Digital Backend é a API RESTful que alimenta a plataforma de análise 
de bem-estar digital. Desenvolvido com Node.js e Express, fornece endpoints 
seguros para coleta de dados de questionários, autenticação de gestores e 
geração de estatísticas e relatórios.

Este repositório é responsável por:
  - Gerenciar a lógica de negócios da aplicação
  - Realizar operações CRUD no banco de dados PostgreSQL
  - Autenticar e autorizar usuários (gestores)
  - Processar e agregar dados de questionários
  - Gerar insights e estatísticas para o dashboard

TECNOLOGIAS UTILIZADAS

  - Node.js v22            - Ambiente de execução JavaScript
  - Express.js             - Framework web minimalista
  - Sequelize              - ORM para PostgreSQL
  - PostgreSQL             - Banco de dados relacional
  - JWT                    - Autenticação via tokens
  - bcryptjs               - Hash de senhas
  - dotenv                 - Gerenciamento de variáveis de ambiente
  - cors                   - Habilitação de CORS para o frontend
  - express-validator      - Validação de dados de entrada

ESTRUTURA DE PASTAS

perfildigitalBackend/
  |
  +-- src/
  |     |
  |     +-- config/
  |     |     |
  |     |     +-- database.js          # Configuração do Sequelize e PostgreSQL
  |     |
  |     +-- controllers/
  |     |     |
  |     |     +-- authController.js
  |     |     +-- dashboardController.js
  |     |     +-- questionarioController.js
  |     |
  |     +-- middlewares/
  |     |     |
  |     |     +-- authMiddleware.js    # Verificação de JWT
  |     |
  |     +-- models/
  |     |     |
  |     |     +-- Usuario.js
  |     |     +-- Respondente.js
  |     |     +-- RespostaPerfil.js
  |     |     +-- RespostaQuestionario.js
  |     |     +-- Resultado.js
  |     |
  |     +-- routes/
  |     |     |
  |     |     +-- authRoutes.js
  |     |     +-- dashboardRoutes.js
  |     |     +-- questionarioRoutes.js
  |     |
  |     +-- services/                  # Lógica de negócios complexa
  |     |
  |     +-- utils/                     # Funções utilitárias
  |     |
  |     +-- server.js                  # Arquivo principal do servidor
  |
  +-- .env.example                     # Exemplo de variáveis de ambiente
  +-- package.json
  +-- README.md

CONFIGURAÇÃO E INSTALAÇÃO

PRÉ-REQUISITOS
--------------
  - Node.js v18 ou superior
  - PostgreSQL v12 ou superior
  - npm ou yarn

INSTALAÇÃO
----------

1. Clone o repositório:

   git clone https://github.com/seu-usuario/perfildigitalBackend.git
   cd perfildigitalBackend

2. Instale as dependências:

   npm install

3. Configure as variáveis de ambiente:

   Crie um arquivo .env na raiz do projeto com base no .env.example:

   # Servidor
   PORT=5000
   NODE_ENV=development

   # Banco de Dados PostgreSQL
   DB_NAME=perfildigitaldb
   DB_USER=seu_usuario
   DB_PASSWORD=sua_senha
   DB_HOST=localhost
   DB_PORT=5432

   # JWT
   JWT_SECRET=sua_chave_secreta_muito_segura_aqui

   # Frontend (para CORS)
   FRONTEND_URL=http://localhost:5173

4. Configure o banco de dados PostgreSQL:

   Crie o banco de dados:

   CREATE DATABASE perfildigitaldb;

5. Execute as migrations (Sequelize irá criar as tabelas):

   npm run dev

   O Sequelize está configurado para sincronizar automaticamente os 
   models com o banco.

6. Crie um usuário administrador inicial:

   Execute o script de seed ou insira manualmente no banco:

   INSERT INTO usuarios (nome, cpf, email, senha, tipo, instituicao, 
                         created_at, updated_at)
   VALUES ('Admin', '11122233304', 'admin@prefeitura.com', 
           '$2a$10$HASH_DA_SENHA_AQUI', 'admin', 'Prefeitura do Recife', 
           NOW(), NOW());

   (Use bcrypt para gerar o hash da senha antes de inserir)

7. Execute o servidor:

   npm run dev

   O servidor estará rodando em http://localhost:5000

DEPLOY

A API está hospedada no Render e pode ser acessada em:

  URL de Produção: https://perfildigitalbackend.onrender.com

CONFIGURAÇÃO DE DEPLOY NO RENDER
---------------------------------
  - Build Command: npm install
  - Start Command: node src/server.js
  - Environment Variables: Todas as variáveis do .env devem ser configuradas
  - Banco de Dados: PostgreSQL externo (Render PostgreSQL ou outro provedor)

ENDPOINTS DA API

AUTENTICAÇÃO (/api/auth)
------------------------

Método   Endpoint                 Descrição                    Autenticação
------   ---------------------    ---------------------------  ------------
POST     /api/auth/login          Login de gestor              Não
POST     /api/auth/registrar      Registrar novo gestor        Sim (Admin)
GET      /api/auth/verificar      Verificar token JWT          Sim


QUESTIONÁRIO (/api/questionario)
--------------------------------

Método   Endpoint                        Descrição                   Autenticação
------   ----------------------------    --------------------------  ------------
POST     /api/questionario/validar-cpf   Validar CPF antes          Não
POST     /api/questionario/iniciar       Iniciar questionário       Não
POST     /api/questionario/perfil        Salvar perfil demográfico  Não
POST     /api/questionario/respostas     Salvar respostas           Não
POST     /api/questionario/responder     Enviar questionário        Não
GET      /api/questionario/resultado/:id Buscar resultado           Não


DASHBOARD (/api/dashboard)
--------------------------

Método   Endpoint                      Descrição                  Autenticação
------   --------------------------    -------------------------  ------------
GET      /api/dashboard/estatisticas   Estatísticas gerais        Sim
GET      /api/dashboard/graficos       Dados para gráficos        Sim
GET      /api/dashboard/relatorio      Relatório detalhado        Sim
GET      /api/dashboard/relatorio-ia   Relatório gerado por IA    Sim
GET      /api/dashboard/exportar       Exportar dados p/ Excel    Sim


SAÚDE (/api/health)
-------------------

Método   Endpoint       Descrição                Autenticação
------   ------------   ----------------------   ------------
GET      /api/health    Verifica status da API   Não

ESTRUTURA DO BANCO DE DADOS

TABELAS PRINCIPAIS
------------------

  - usuarios                  - Gestores que acessam o dashboard
  - respondentes              - Cidadãos que responderam o questionário
  - respostas_perfil          - Dados demográficos dos respondentes
  - respostas_questionario    - Respostas das 20 perguntas
  - resultados                - Pontuação, classificação e recomendações

DIAGRAMA ER
-----------
Ver diagrama completo no DBeaver (conforme imagem compartilhada).

SEGURANÇA

  - Senhas: Hash com bcryptjs (salt rounds: 10)
  - Autenticação: JWT com expiração configurável
  - CORS: Configurado para aceitar apenas o frontend autorizado
  - Validação: Validação de entrada de dados em todos os endpoints
  - Middlewares: Proteção de rotas sensíveis com authMiddleware

TESTES

Para executar testes:

  npm test

LICENÇA

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
