import pool from '../src/config/db';

async function checkSchema() {
  const connection = await pool.getConnection();
  try {
    const tables = ['users', 'students', 'faculty_details', 'subject_assignments', 'marks'];
    for (const table of tables) {
      console.log(`--- ${table} ---`);
      const [cols]: any = await connection.query(`SHOW COLUMNS FROM ${table}`);
      console.table(cols.map((c: any) => ({ Field: c.Field, Type: c.Type, Null: c.Null })));
    }
  } catch (error) {
    console.error(error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

checkSchema();
