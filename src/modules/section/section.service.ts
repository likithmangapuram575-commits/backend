import pool from '../../config/db';

export const getAllSections = async () => {
  const [rows] = await pool.query(`
    SELECT s.*, d.name as department_name, b.name as batch_name
    FROM sections s 
    LEFT JOIN departments d ON s.department_id = d.id
    LEFT JOIN batches b ON s.batch_id = b.id
  `);
  return rows;
};

export const addSection = async (name: string, department_id: number, batch_id: number, year: number, semester: number) => {
  const [result]: any = await pool.query(
    'INSERT INTO sections (name, department_id, batch_id, year, semester) VALUES (?, ?, ?, ?, ?)', 
    [name, department_id, batch_id, year, semester]
  );
  return result;
};

export const editSection = async (id: number, name: string, department_id: number, batch_id: number, year: number, semester: number) => {
  const [result]: any = await pool.query(
    'UPDATE sections SET name = ?, department_id = ?, batch_id = ?, year = ?, semester = ? WHERE id = ?', 
    [name, department_id, batch_id, year, semester, id]
  );
  return result;
};

export const removeSection = async (id: number) => {
  const [result]: any = await pool.query('DELETE FROM sections WHERE id = ?', [id]);
  return result;
};
