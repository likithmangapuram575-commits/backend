import pool from '../../config/db';

export const getAssignmentsByDepartment = async (departmentId: number) => {
  const [rows] = await pool.query(`
    SELECT sa.*, u.name as faculty_name, s.name as subject_name, sec.name as section_name
    FROM subject_assignments sa
    JOIN users u ON sa.faculty_id = u.id
    JOIN subjects s ON sa.subject_id = s.id
    JOIN sections sec ON sa.section_id = sec.id
    WHERE s.department_id = ?
  `, [departmentId]);
  return rows;
};

export const addAssignment = async (data: any) => {
  const { faculty_id, subject_ids, section_ids, semester, department_id, batch_id, year } = data;
  
  // Support both single values and arrays for subjects/sections
  const subjects = Array.isArray(subject_ids) ? subject_ids : [data.subject_id || data.subject_ids];
  const sections = Array.isArray(section_ids) ? section_ids : [data.section_id || data.section_ids];

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const subId of subjects) {
      if (!subId) continue;
      for (const secId of sections) {
        if (!secId) continue;
        // Avoid duplicate assignments
        const [existing]: any = await connection.query(
          'SELECT id FROM subject_assignments WHERE faculty_id = ? AND subject_id = ? AND section_id = ? AND semester = ?',
          [faculty_id, subId, secId, semester]
        );

        if (existing.length === 0) {
          await connection.query(
            'INSERT INTO subject_assignments (faculty_id, subject_id, section_id, semester, department_id, batch_id, year) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [faculty_id, subId, secId, semester, department_id, batch_id, year]
          );
        } else {
          // Update existing with new metadata
          await connection.query(
            'UPDATE subject_assignments SET department_id = ?, batch_id = ?, year = ? WHERE id = ?',
            [department_id, batch_id, year, existing[0].id]
          );
        }
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteAssignment = async (id: number) => {
  await pool.query('DELETE FROM subject_assignments WHERE id = ?', [id]);
};
