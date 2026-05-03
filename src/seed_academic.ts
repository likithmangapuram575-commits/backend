import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function seedAcademicData() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'college_erp'
    });

    console.log('Connected to database.');

    // 1. Seed Courses
    const [courses]: any = await connection.query('SELECT * FROM courses');
    if (courses.length === 0) {
      console.log('Seeding courses...');
      await connection.query(`INSERT INTO courses (name, duration_years, total_semesters) VALUES 
        ('B.Tech', 4, 8),
        ('M.Tech', 2, 4),
        ('MBA', 2, 4)`);
    }

    const [courseRows]: any = await connection.query('SELECT id FROM courses LIMIT 1');
    const courseId = courseRows[0].id;

    // 2. Seed Departments
    const [depts]: any = await connection.query('SELECT * FROM departments');
    if (depts.length === 0) {
      console.log('Seeding departments...');
      await connection.query(`INSERT INTO departments (name, course_id) VALUES 
        ('Computer Science & Engineering', ?),
        ('Electronics & Communication Engineering', ?),
        ('Mechanical Engineering', ?)`, [courseId, courseId, courseId]);
    }

    // 3. Seed Batches
    const [batches]: any = await connection.query('SELECT * FROM batches');
    if (batches.length === 0) {
      console.log('Seeding batches...');
      await connection.query(`INSERT INTO batches (name, start_year, end_year, course_id) VALUES 
        ('2022-2026', 2022, 2026, ?),
        ('2023-2027', 2023, 2027, ?),
        ('2024-2028', 2024, 2028, ?)`, [courseId, courseId, courseId]);
    }

    console.log('Academic data seeded successfully!');
    await connection.end();
  } catch (error) {
    console.error('Error seeding academic data:', error);
  }
}

seedAcademicData();
