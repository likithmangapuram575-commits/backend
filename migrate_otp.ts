import pool from './src/config/db';

async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otp_verification (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at DATETIME NOT NULL,
        attempts INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ OTP Verification table created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
