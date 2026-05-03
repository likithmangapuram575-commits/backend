import pool from './src/config/db';

async function migrate() {
  const connection = await pool.getConnection();
  try {
    console.log('Starting Student Fees migration...');

    const [columns]: any = await connection.query('SHOW COLUMNS FROM students');
    const existingColumns = columns.map((c: any) => c.Field);

    const newColumns = [
      { name: 'admission_type', type: "ENUM('EAMCET', 'JEE MAINS', 'MANAGEMENT') DEFAULT 'EAMCET'" },
      { name: 'admission_fee', type: 'DECIMAL(10, 2) DEFAULT 0' },
      { name: 'bus_required', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'bus_route', type: 'VARCHAR(100)' },
      { name: 'bus_fee', type: 'DECIMAL(10, 2) DEFAULT 0' },
      { name: 'hostel_required', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'hostel_type', type: "ENUM('Boys', 'Girls')" },
      { name: 'room_type', type: "ENUM('Single', 'Shared')" },
      { name: 'hostel_fee', type: 'DECIMAL(10, 2) DEFAULT 0' },
      { name: 'total_fee', type: 'DECIMAL(10, 2) DEFAULT 0' },
      { name: 'fee_paid', type: 'DECIMAL(10, 2) DEFAULT 0' },
      { name: 'fee_due', type: 'DECIMAL(10, 2) DEFAULT 0' }
    ];

    for (const col of newColumns) {
      if (!existingColumns.includes(col.name)) {
        await connection.query(`ALTER TABLE students ADD COLUMN ${col.name} ${col.type}`);
        console.log(`Added column: ${col.name}`);
      }
    }

    console.log('Student Fees migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

migrate();
