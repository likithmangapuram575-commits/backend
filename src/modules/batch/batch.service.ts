import pool from '../../config/db';

export const getAllBatches = async () => {
  const [rows] = await pool.query(`
    SELECT b.*, c.name as course_name, c.duration_years, c.total_semesters
    FROM batches b
    JOIN courses c ON b.course_id = c.id
    ORDER BY b.start_year DESC
  `);
  return rows;
};

export const addBatch = async (start_year: number, end_year: number, course_id: number) => {
  const name = `${start_year}-${end_year}`;
  const [result]: any = await pool.query(
    'INSERT INTO batches (name, start_year, end_year, course_id) VALUES (?, ?, ?, ?)',
    [name, start_year, end_year, course_id]
  );
  return result;
};

export const removeBatch = async (id: number) => {
  const [result]: any = await pool.query('DELETE FROM batches WHERE id = ?', [id]);
  return result;
};
