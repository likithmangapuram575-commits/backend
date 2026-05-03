import pool from '../../config/db';

export const getAllSubjects = async () => {
  const [rows] = await pool.query(`
    SELECT s.*, d.name as department_name, c.name as course_name
    FROM subjects s
    JOIN departments d ON s.department_id = d.id
    JOIN courses c ON d.course_id = c.id
    ORDER BY c.name, d.name, s.semester, s.name
  `);
  return rows;
};

export const addSubject = async (data: { name: string, code: string, credits: number, type: 'Theory' | 'Lab', department_id: number, semester: number }) => {
  const [result]: any = await pool.query(
    'INSERT INTO subjects (name, code, credits, type, department_id, semester) VALUES (?, ?, ?, ?, ?, ?)',
    [data.name, data.code, data.credits, data.type, data.department_id, data.semester]
  );
  return result;
};

export const updateSubject = async (id: number, data: { name: string, code: string, credits: number, type: 'Theory' | 'Lab', department_id: number, semester: number }) => {
  const [result]: any = await pool.query(
    'UPDATE subjects SET name = ?, code = ?, credits = ?, type = ?, department_id = ?, semester = ? WHERE id = ?',
    [data.name, data.code, data.credits, data.type, data.department_id, data.semester, id]
  );
  return result;
};

export const deleteSubject = async (id: number) => {
  const [result]: any = await pool.query('DELETE FROM subjects WHERE id = ?', [id]);
  return result;
};
