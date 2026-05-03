import pool from '../../config/db';

export const getAllCourses = async () => {
  const [rows] = await pool.query('SELECT * FROM courses ORDER BY name');
  return rows;
};

export const getCourseById = async (id: number) => {
  const [rows]: any = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
  return rows[0];
};

export const addCourse = async (name: string, duration_years: number, total_semesters: number) => {
  const [result]: any = await pool.query(
    'INSERT INTO courses (name, duration_years, total_semesters) VALUES (?, ?, ?)',
    [name, duration_years, total_semesters]
  );
  return result;
};

export const updateCourse = async (id: number, name: string, duration_years: number, total_semesters: number) => {
  const [result]: any = await pool.query(
    'UPDATE courses SET name = ?, duration_years = ?, total_semesters = ? WHERE id = ?',
    [name, duration_years, total_semesters, id]
  );
  return result;
};

export const deleteCourse = async (id: number) => {
  const [result]: any = await pool.query('DELETE FROM courses WHERE id = ?', [id]);
  return result;
};
