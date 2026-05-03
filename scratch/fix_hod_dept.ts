import pool from '../src/config/db';

async function fixHOD() {
  const connection = await pool.getConnection();
  try {
    const [depts]: any = await connection.query('SELECT id, name FROM departments');
    console.log('Departments:', depts);
    
    if (depts.length > 0) {
      const deptId = depts[0].id;
      console.log(`Assigning HOD (user_id 9) to Dept ID: ${deptId}`);
      await connection.query('UPDATE faculty_details SET department_id = ? WHERE user_id = 9', [deptId]);
      console.log('Fixed HOD assignment.');
    }
  } finally {
    connection.release();
    process.exit(0);
  }
}

fixHOD();
