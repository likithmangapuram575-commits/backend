import pool from './src/config/db';

async function migrate() {
  const connection = await pool.getConnection();
  try {
    console.log('Starting V2 migration...');

    // 1. Create Courses Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        duration_years INT NOT NULL,
        total_semesters INT NOT NULL
      )
    `);

    // 2. Create Default Course if none exists
    const [courses]: any = await connection.query('SELECT id FROM courses LIMIT 1');
    let defaultCourseId;
    if (courses.length === 0) {
      const [result]: any = await connection.query(
        'INSERT INTO courses (name, duration_years, total_semesters) VALUES (?, ?, ?)',
        ['B.Tech', 4, 8]
      );
      defaultCourseId = result.insertId;
      console.log('Default course created.');
    } else {
      defaultCourseId = courses[0].id;
    }

    // 3. Update Departments
    const [deptCols]: any = await connection.query('SHOW COLUMNS FROM departments LIKE "course_id"');
    if (deptCols.length === 0) {
      await connection.query(`ALTER TABLE departments ADD COLUMN course_id INT NOT NULL DEFAULT ${defaultCourseId}`);
      await connection.query('ALTER TABLE departments ADD FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE');
      console.log('Departments table updated.');
    }

    // 4. Update Batches
    const [batchCols]: any = await connection.query('SHOW COLUMNS FROM batches LIKE "course_id"');
    if (batchCols.length === 0) {
      await connection.query(`ALTER TABLE batches ADD COLUMN course_id INT NOT NULL DEFAULT ${defaultCourseId}`);
      await connection.query('ALTER TABLE batches ADD FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE');
      // Also remove UNIQUE constraint on name if it exists, as multiple courses can have same batch name
      try {
        await connection.query('ALTER TABLE batches DROP INDEX name');
      } catch (e) {}
      console.log('Batches table updated.');
    }

    // 5. Create Subjects Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(20) UNIQUE NOT NULL,
        credits INT NOT NULL,
        type ENUM('Theory', 'Lab') NOT NULL,
        department_id INT NOT NULL,
        semester INT NOT NULL,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
      )
    `);

    // 6. Update Marks Table
    const [marksCols]: any = await connection.query('SHOW COLUMNS FROM marks LIKE "subject_id"');
    if (marksCols.length > 0) {
       try {
         await connection.query('ALTER TABLE marks ADD FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL');
       } catch (e) {}
    }

    // 7. Create Fees Structure Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS fees_structure (
        id INT AUTO_INCREMENT PRIMARY KEY,
        batch_id INT NOT NULL,
        tuition_fee DECIMAL(10, 2) NOT NULL,
        bus_fee DECIMAL(10, 2) DEFAULT 0,
        hostel_fee DECIMAL(10, 2) DEFAULT 0,
        other_charges DECIMAL(10, 2) DEFAULT 0,
        FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
      )
    `);

    // 8. Create Announcements Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        target_role ENUM('All', 'Faculty', 'Student') DEFAULT 'All',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 9. Create Audit Logs Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(50) NOT NULL,
        table_name VARCHAR(50) NOT NULL,
        record_id INT,
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // 10. Create Academic Calendar Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS academic_calendar (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_name VARCHAR(100) NOT NULL,
        type ENUM('Exam', 'Holiday', 'Event') NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        batch_id INT,
        FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
      )
    `);

    console.log('Migration V2 completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

migrate();
