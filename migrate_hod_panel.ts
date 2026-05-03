import pool from './src/config/db';

async function migrate() {
  const connection = await pool.getConnection();
  try {
    console.log('Starting HOD Panel migration...');

    // 1. Faculty Details Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS faculty_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        department_id INT NOT NULL,
        qualification VARCHAR(255),
        experience VARCHAR(100),
        salary DECIMAL(10, 2),
        joining_date DATE,
        address TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
      )
    `);

    // 2. Subject Assignments Table
    // Links faculty to subjects they teach in specific sections/semesters
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subject_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        faculty_id INT NOT NULL,
        subject_id INT NOT NULL,
        section_id INT NOT NULL,
        semester INT NOT NULL,
        FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
      )
    `);

    // 3. Timetable Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS timetable (
        id INT AUTO_INCREMENT PRIMARY KEY,
        department_id INT NOT NULL,
        section_id INT NOT NULL,
        subject_id INT NOT NULL,
        faculty_id INT NOT NULL,
        day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        room_number VARCHAR(50),
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('HOD Panel migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

migrate();
