import pool from '../../config/db';

export const getAllFees = async () => {
  const [rows] = await pool.query(`
    SELECT f.*, b.name as batch_name, c.name as course_name
    FROM fees_structure f
    JOIN batches b ON f.batch_id = b.id
    JOIN courses c ON b.course_id = c.id
    ORDER BY c.name, b.start_year DESC
  `);
  return rows;
};

export const addFees = async (data: { batch_id: number, tuition_fee: number, bus_fee: number, hostel_fee: number, other_charges: number }) => {
  const [result]: any = await pool.query(
    'INSERT INTO fees_structure (batch_id, tuition_fee, bus_fee, hostel_fee, other_charges) VALUES (?, ?, ?, ?, ?)',
    [data.batch_id, data.tuition_fee, data.bus_fee, data.hostel_fee, data.other_charges]
  );
  return result;
};

export const updateFees = async (id: number, data: { batch_id: number, tuition_fee: number, bus_fee: number, hostel_fee: number, other_charges: number }) => {
  const [result]: any = await pool.query(
    'UPDATE fees_structure SET batch_id = ?, tuition_fee = ?, bus_fee = ?, hostel_fee = ?, other_charges = ? WHERE id = ?',
    [data.batch_id, data.tuition_fee, data.bus_fee, data.hostel_fee, data.other_charges, id]
  );
  return result;
};

export const deleteFees = async (id: number) => {
  const [result]: any = await pool.query('DELETE FROM fees_structure WHERE id = ?', [id]);
  return result;
};
