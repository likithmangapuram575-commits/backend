const mysql = require('mysql2/promise');

async function fix() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'likithliki90',
    database: 'college_erp'
  });

  try {
    // 1. Find bhargavi's user ID (17) and department (2)
    const facultyId = 17;
    const deptId = 2;

    // 2. Get subjects for Dept 2
    const [subjects] = await conn.query('SELECT id FROM subjects WHERE department_id = ?', [deptId]);
    
    // 3. Get new sections for Dept 2
    const [sections] = await conn.query('SELECT id FROM sections WHERE department_id = ? AND name LIKE "%-SEC-%"', [deptId]);

    console.log(`Assigning ${subjects.length} subjects to bhargavi across ${sections.length} sections...`);

    for (const subject of subjects) {
      for (const section of sections) {
        await conn.query(
          'INSERT INTO subject_assignments (faculty_id, subject_id, section_id, semester, department_id, batch_id, year) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [facultyId, subject.id, section.id, 1, deptId, 1, 1]
        );
      }
    }

    console.log('Successfully assigned subjects to bhargavi.');
  } catch (error) {
    console.error('Failed to assign subjects:', error);
  } finally {
    await conn.end();
  }
}

fix();
