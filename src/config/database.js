require('dotenv').config(); // Garante que as variáveis de ambiente sejam carregadas
const { Sequelize } = require('sequelize');

// Render geralmente fornece a URL do banco de dados em uma variável de ambiente DATABASE_URL
// Ou você pode usar a External Database URL que você anotou
const databaseUrl = process.env.DATABASE_URL; 

if (!databaseUrl) {
  console.error("DATABASE_URL não definida. Verifique suas variáveis de ambiente.");
  // Fallback para ambiente local se DATABASE_URL não estiver definida
  module.exports = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'mysql', // Mantenha 'mysql' para desenvolvimento local se ainda usar MySQL
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // Para ambientes de desenvolvimento ou se o certificado for autoassinado
        }
      }
    }
  );
} else {
  // Configuração para PostgreSQL no Render
  module.exports = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false, // Desabilita logs do Sequelize
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Necessário para Render/Heroku com SSL
      }
    }
  });
}
