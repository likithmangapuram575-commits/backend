import pool from './src/config/db';

async function check() {
  try {
    const [rows]: any = await pool.query('SELECT * FROM subject_assignments');
    console.log('--- SUBJECT ASSIGNMENTS ---');
    console.log(JSON.stringify(rows, null, 2));

    const [batches]: any = await pool.query('SELECT * FROM batches');
    console.log('--- BATCHES ---');
    console.log(JSON.stringify(batches, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

check();
