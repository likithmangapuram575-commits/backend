import pool from './src/config/db';

async function checkTimetable() {
  try {
    const [rows]: any = await pool.query('SELECT t.*, s.name as subject_name FROM timetable t JOIN subjects s ON t.subject_id = s.id');
    console.log('--- TIMETABLE ENTRIES ---');
    console.log(JSON.stringify(rows, null, 2));
    
    const [sections]: any = await pool.query('SELECT * FROM sections');
    console.log('--- SECTIONS ---');
    console.log(JSON.stringify(sections, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

checkTimetable();
