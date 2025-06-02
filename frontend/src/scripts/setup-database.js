// Script to set up the database with necessary tables and functions
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// SQL to create necessary functions and tables
const SQL_SCRIPTS = [
  // Enable UUID extension
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
  
  // Create procedures table
  `CREATE TABLE IF NOT EXISTS procedures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL DEFAULT 30,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,
  
  // Create clients table
  `CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,
  
  // Create appointments table
  `CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    procedure_id UUID REFERENCES procedures(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,
  
  // Create function to update updated_at timestamp
  `
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  `,
  
  // Create triggers for each table
  `
  DROP TRIGGER IF EXISTS update_procedures_updated_at ON procedures;
  CREATE TRIGGER update_procedures_updated_at
  BEFORE UPDATE ON procedures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `,
  
  `
  DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
  CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `,
  
  `
  DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
  CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `
];

async function setupDatabase() {
  try {
    console.log('Starting database setup...');
    
    // Execute each SQL script
    for (const [index, sql] of SQL_SCRIPTS.entries()) {
      console.log(`\nExecuting script ${index + 1}/${SQL_SCRIPTS.length}...`);
      console.log(sql.split('\n')[0], '...'); // Log first line of SQL
      
      const { data, error } = await supabase.rpc('exec_sql', { query: sql });
      
      if (error) {
        // Ignore "already exists" errors
        if (!error.message.includes('already exists') && 
            !error.message.includes('does not exist')) {
          console.error('Error executing SQL:', error);
          continue;
        }
        console.log('  -', error.message);
      } else {
        console.log('  - Success');
      }
    }
    
    console.log('\nDatabase setup completed successfully!');
    
    // Verify tables were created
    console.log('\nVerifying tables...');
    const { data: tables, error: tableError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (tableError) {
      console.error('Error verifying tables:', tableError);
    } else {
      console.log('\n=== Tables in your database ===');
      tables.forEach((table, i) => {
        console.log(`${i + 1}. ${table.tablename}`);
      });
    }
    
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

// Run the setup
setupDatabase();
