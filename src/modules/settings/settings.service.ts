import pool from '../../config/db';

export const getSettings = async () => {
  const [rows]: any = await pool.query('SELECT * FROM settings WHERE id = 1');
  return rows[0];
};

export const updateSettings = async (data: { college_name?: string, college_logo?: string }) => {
  const fields: string[] = [];
  const values: any[] = [];
  
  if (data.college_name) { fields.push('college_name = ?'); values.push(data.college_name); }
  if (data.college_logo) { fields.push('college_logo = ?'); values.push(data.college_logo); }
  
  if (fields.length === 0) return;
  
  values.push(1); // ID = 1
  await pool.query(`UPDATE settings SET \${fields.join(', ')} WHERE id = ?`, values);
};
