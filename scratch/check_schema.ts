import pool from '../src/config/db';

async function checkSchema() {
  try {
    const [rows]: any = await pool.query('DESCRIBE students');
    console.log('Students Table Schema:');
    console.table(rows);
    
    try {
        const [users]: any = await pool.query('DESCRIBE users');
        console.log('Users Table Schema:');
        console.table(users);
    } catch (e) {
        console.log('Users table does not exist');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error fetching schema:', error);
    process.exit(1);
  }
}

checkSchema();
