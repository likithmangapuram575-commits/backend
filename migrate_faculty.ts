import pool from './src/config/db';

async function migrateFaculty() {
  const connection = await pool.getConnection();
  try {
    console.log('Starting Faculty Module migration...');

    // 1. Create Attendance Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        subject_id INT NOT NULL,
        faculty_id INT NOT NULL,
        date DATE NOT NULL,
        status ENUM('present', 'absent') DEFAULT 'present',
        approval_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 2. Update Marks Table
    // Check if columns exist first
    const [marksCols]: any = await connection.query('SHOW COLUMNS FROM marks');
    const colNames = marksCols.map((c: any) => c.Field);

    if (!colNames.includes('faculty_id')) {
      await connection.query('ALTER TABLE marks ADD COLUMN faculty_id INT NOT NULL');
      await connection.query('ALTER TABLE marks ADD FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE');
    }
    if (!colNames.includes('exam_type')) {
      await connection.query("ALTER TABLE marks ADD COLUMN exam_type ENUM('internal', 'external') DEFAULT 'internal'");
    }
    if (!colNames.includes('approval_status')) {
      await connection.query("ALTER TABLE marks ADD COLUMN approval_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING'");
    }
    if (!colNames.includes('max_marks')) {
      await connection.query('ALTER TABLE marks ADD COLUMN max_marks INT DEFAULT 30');
    }
    if (!colNames.includes('created_at')) {
      await connection.query('ALTER TABLE marks ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    }

    // 3. Create Leaves Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS leaves (
        id INT AUTO_INCREMENT PRIMARY KEY,
        faculty_id INT NOT NULL,
        from_date DATE NOT NULL,
        to_date DATE NOT NULL,
        reason TEXT NOT NULL,
        status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Faculty Module migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

migrateFaculty();
