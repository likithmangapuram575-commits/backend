import pool from '../../config/db';

export const getAllAnnouncements = async () => {
  const [rows] = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
  return rows;
};

export const addAnnouncement = async (data: { title: string, description: string, target_role: 'All' | 'Faculty' | 'Student' }) => {
  const [result]: any = await pool.query(
    'INSERT INTO announcements (title, description, target_role) VALUES (?, ?, ?)',
    [data.title, data.description, data.target_role]
  );
  return result;
};

export const deleteAnnouncement = async (id: number) => {
  const [result]: any = await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
  return result;
};
