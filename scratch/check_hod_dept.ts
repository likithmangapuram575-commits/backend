import pool from '../src/config/db';

async function checkHOD() {
  const connection = await pool.getConnection();
  try {
    const [hods]: any = await connection.query('SELECT u.id, u.name, fd.department_id FROM users u LEFT JOIN faculty_details fd ON u.id = fd.user_id WHERE u.role = "HOD"');
    console.log('HODs in DB:');
    console.table(hods);
  } finally {
    connection.release();
    process.exit(0);
  }
}

checkHOD();
