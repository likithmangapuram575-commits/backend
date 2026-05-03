import pool from './src/config/db';

async function migrateSmartAttendance() {
  try {
    console.log('Migrating attendance table for smart features...');
    
    const tables: any = await pool.query("DESCRIBE attendance");
    const columns = tables[0].map((c: any) => c.Field);

    if (!columns.includes('section_id')) {
      await pool.query("ALTER TABLE attendance ADD COLUMN section_id INT AFTER subject_id");
      await pool.query("ALTER TABLE attendance ADD CONSTRAINT fk_attendance_section FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE");
    }
    
    if (!columns.includes('period')) {
      await pool.query("ALTER TABLE attendance ADD COLUMN period INT AFTER date");
    }

    console.log('✅ Database migration complete.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateSmartAttendance();
