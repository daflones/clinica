const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração da conexão com o banco de dados
// Em vez de usar a connection string diretamente, vamos separar os parâmetros
const dbConfig = {
  user: 'postgres.xqdezzenxempvbgrgtik',
  password: '22660202Ju$$$',
  host: 'aws-0-sa-east-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  ssl: { rejectUnauthorized: false } // Permite conexões SSL sem verificar o certificado
};

// Lê o arquivo SQL
const sqlFilePath = path.join(__dirname, 'setup_database.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

async function setupDatabase() {
  const client = new Client(dbConfig);

  try {
    console.log('Conectando ao banco de dados Supabase...');
    await client.connect();
    console.log('Conexão estabelecida com sucesso!');

    console.log('Executando script SQL...');
    await client.query(sqlContent);
    console.log('Script SQL executado com sucesso!');

    // Consulta para verificar se as tabelas foram criadas
    const tablesResult = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    console.log('\nTabelas criadas:');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

    // Verifica se o usuário foi criado
    const usersResult = await client.query(
      "SELECT email FROM auth.users WHERE email = 'contatodaflonedu@gmail.com'"
    );
    
    if (usersResult.rows.length > 0) {
      console.log('\nUsuário contatodaflonedu@gmail.com criado com sucesso!');
    } else {
      console.log('\nNota: O usuário não foi encontrado. Pode ser necessário criar manualmente.');
    }

  } catch (err) {
    console.error('Erro ao configurar o banco de dados:', err);
  } finally {
    await client.end();
    console.log('Conexão encerrada.');
  }
}

setupDatabase();
