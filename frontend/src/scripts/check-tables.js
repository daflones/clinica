// Script to check and create necessary tables in Supabase
import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Table definitions
const TABLE_DEFINITIONS = {
  procedures: `
    CREATE TABLE IF NOT EXISTS procedures (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT,
      duration INTEGER NOT NULL DEFAULT 30,
      price DECIMAL(10,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  clients: `
    CREATE TABLE IF NOT EXISTS clients (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  appointments: `
    CREATE TABLE IF NOT EXISTS appointments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
      procedure_id UUID REFERENCES procedures(id) ON DELETE SET NULL,
      date DATE NOT NULL,
      time TIME NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'scheduled',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
};

async function checkAndCreateTables() {
  try {
    console.log('Connecting to Supabase...');
    
    // Enable UUID extension if not exists
    console.log('Enabling UUID extension...');
    const { data: extData, error: extError } = await supabase
      .rpc('create_extension_if_not_exists', { extname: 'uuid-ossp' });
    
    if (extError && !extError.message.includes('already exists')) {
      console.error('Error enabling UUID extension:', extError);
      return;
    }
    
    // Check existing tables
    console.log('Checking existing tables...');
    const { data: tables, error: tableError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');

    if (tableError) {
      console.error('Error fetching tables:', tableError);
      return;
    }

    const existingTables = new Set(tables.map(t => t.tablename));
    console.log('\n=== Existing Tables ===');
    console.log(Array.from(existingTables).join(', ') || 'No tables found');

    // Create tables that don't exist
    for (const [tableName, createTableSQL] of Object.entries(TABLE_DEFINITIONS)) {
      if (!existingTables.has(tableName)) {
        console.log(`\nCreating table: ${tableName}...`);
        const { error: createError } = await supabase
          .rpc('exec_sql', { query: createTableSQL });
        
        if (createError) {
          console.error(`Error creating table ${tableName}:`, createError);
        } else {
          console.log(`Table ${tableName} created successfully`);
        }
      } else {
        console.log(`Table ${tableName} already exists`);
      }
    }

    console.log('\nDatabase setup completed!');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Execute the function
checkAndCreateTables();
