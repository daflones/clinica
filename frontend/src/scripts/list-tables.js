// Simple script to list all tables in the Supabase database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function listTables() {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Please check your .env file.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('Connecting to Supabase...');
    
    // List all tables in the public schema
    const { data: tables, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');

    if (error) throw error;

    if (!tables || tables.length === 0) {
      console.log('No tables found in the public schema.');
      return;
    }

    console.log('\n=== Tables in your Supabase database ===');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.tablename}`);
    });

  } catch (error) {
    console.error('Error listing tables:', error);
  }
}

listTables();
