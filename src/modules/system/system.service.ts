import pool from '../../config/db';

export const getAllCalendarEvents = async () => {
  const [rows] = await pool.query(`
    SELECT ac.*, b.name as batch_name 
    FROM academic_calendar ac
    LEFT JOIN batches b ON ac.batch_id = b.id
    ORDER BY ac.start_date DESC
  `);
  return rows;
};

export const addCalendarEvent = async (data: { event_name: string, type: string, start_date: string, end_date: string, batch_id?: number }) => {
  const [result]: any = await pool.query(
    'INSERT INTO academic_calendar (event_name, type, start_date, end_date, batch_id) VALUES (?, ?, ?, ?, ?)',
    [data.event_name, data.type, data.start_date, data.end_date, data.batch_id || null]
  );
  return result;
};

export const deleteCalendarEvent = async (id: number) => {
  const [result]: any = await pool.query('DELETE FROM academic_calendar WHERE id = ?', [id]);
  return result;
};

// Audit Logs
export const getAuditLogs = async () => {
  const [rows] = await pool.query(`
    SELECT a.*, u.name as user_name, u.role as user_role
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.timestamp DESC
    LIMIT 100
  `);
  return rows;
};

export const addAuditLog = async (data: { user_id: number | null, action: string, table_name: string, record_id: number | null, details: string }) => {
  await pool.query(
    'INSERT INTO audit_logs (user_id, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?)',
    [data.user_id, data.action, data.table_name, data.record_id, data.details]
  );
};

export const globalSearch = async (query: string) => {
  const searchTerm = `%${query}%`;
  
  // 1. Search Students
  const [students]: any = await pool.query(
    'SELECT id, name, roll_no, "student" as type FROM students WHERE name LIKE ? OR roll_no LIKE ? LIMIT 5',
    [searchTerm, searchTerm]
  );

  // 2. Search Faculty
  const [faculty]: any = await pool.query(
    'SELECT u.id, u.name, "faculty" as type FROM users u WHERE u.role = "Faculty" AND u.name LIKE ? LIMIT 5',
    [searchTerm]
  );

  // 3. Search Subjects
  const [subjects]: any = await pool.query(
    'SELECT id, name, code, "subject" as type FROM subjects WHERE name LIKE ? OR code LIKE ? LIMIT 5',
    [searchTerm, searchTerm]
  );

  return [...students, ...faculty, ...subjects];
};
