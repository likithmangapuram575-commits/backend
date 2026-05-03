import pool from './src/config/db';

async function fixUsersTable() {
  const connection = await pool.getConnection();
  try {
    console.log('Updating users table...');
    await connection.query("ALTER TABLE users ADD COLUMN status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE'");
    console.log('Users table updated successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

fixUsersTable();
