import pool from '../src/config/db';

async function checkStudents() {
  const connection = await pool.getConnection();
  try {
    const [cols]: any = await connection.query('SHOW COLUMNS FROM students');
    console.log(JSON.stringify(cols, null, 2));
  } finally {
    connection.release();
    process.exit(0);
  }
}

checkStudents();
