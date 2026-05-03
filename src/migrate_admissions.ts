import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'college_erp',
  });

  console.log('Starting migration for Admissions System...');

  try {
    // 1. Add new columns to students table
    // We check if columns exist first or just use ALTER TABLE and ignore errors if they exist
    // But for a cleaner migration, let's do it step by step
    
    const [columns]: any = await connection.query('SHOW COLUMNS FROM students');
    const columnNames = columns.map((c: any) => c.Field);

    const newColumns = [
      { name: 'gender', definition: "ENUM('Male', 'Female', 'Other')" },
      { name: 'dob', definition: 'DATE' },
      { name: 'phone', definition: 'VARCHAR(15) UNIQUE' },
      { name: 'aadhaar', definition: 'VARCHAR(12) UNIQUE' },
      { name: 'pan', definition: 'VARCHAR(10) UNIQUE' },
      { name: 'father_name', definition: 'VARCHAR(100)' },
      { name: 'mother_name', definition: 'VARCHAR(100)' },
      { name: 'parent_phone', definition: 'VARCHAR(15)' },
      { name: 'occupation', definition: 'VARCHAR(100)' },
      { name: 'permanent_address', definition: 'TEXT' },
      { name: 'current_address', definition: 'TEXT' },
      { name: 'student_id_card', definition: 'VARCHAR(50) UNIQUE' },
      { name: 'status', definition: "ENUM('APPLIED', 'VERIFIED', 'APPROVED', 'ACTIVE', 'DROPPED', 'GRADUATED', 'REJECTED') DEFAULT 'APPLIED'" },
      { name: 'remarks', definition: 'TEXT' },
      { name: 'course_id', definition: 'INT' },
      { name: 'created_at', definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updated_at', definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
    ];

    for (const col of newColumns) {
      if (!columnNames.includes(col.name)) {
        console.log(`Adding column ${col.name}...`);
        await connection.query(`ALTER TABLE students ADD COLUMN ${col.name} ${col.definition}`);
      }
    }

    // 2. Make roll_no and section_id nullable
    console.log('Making roll_no and section_id nullable...');
    await connection.query('ALTER TABLE students MODIFY COLUMN roll_no VARCHAR(50) UNIQUE NULL');
    await connection.query('ALTER TABLE students MODIFY COLUMN section_id INT NULL');

    // 3. Add foreign key for course_id if it doesn't exist
    try {
        await connection.query('ALTER TABLE students ADD FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE');
    } catch (e) {
        console.log('Course FK might already exist or courses table missing.');
    }

    // 4. Create Documents Table
    console.log('Creating documents table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        type VARCHAR(100) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        status ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
        remarks TEXT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
