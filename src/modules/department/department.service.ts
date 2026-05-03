import pool from '../../config/db';

export const getAllDepartments = async () => {
  const [rows] = await pool.query(`
    SELECT d.*, c.name as course_name,
    (SELECT COUNT(*) FROM sections s WHERE s.department_id = d.id) as section_count 
    FROM departments d
    JOIN courses c ON d.course_id = c.id
  `);
  return rows;
};

export const addDepartment = async (name: string, course_id: number) => {
  const [result]: any = await pool.query('INSERT INTO departments (name, course_id) VALUES (?, ?)', [name, course_id]);
  return result;
};

export const editDepartment = async (id: number, name: string, course_id: number) => {
  const [result]: any = await pool.query('UPDATE departments SET name = ?, course_id = ? WHERE id = ?', [name, course_id, id]);
  return result;
};

export const removeDepartment = async (id: number) => {
  const [result]: any = await pool.query('DELETE FROM departments WHERE id = ?', [id]);
  return result;
};
