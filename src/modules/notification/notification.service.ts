import pool from '../../config/db';

export const createNotification = async (userId: number, title: string, message: string, type: string = 'info') => {
  await pool.query(
    'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
    [userId, title, message, type]
  );
};

export const getNotifications = async (userId: number) => {
  const [rows] = await pool.query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [userId]
  );
  return rows;
};

export const markAsRead = async (id: number, userId: number) => {
  await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
    [id, userId]
  );
};

export const markAllAsRead = async (userId: number) => {
  await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
    [userId]
  );
};
