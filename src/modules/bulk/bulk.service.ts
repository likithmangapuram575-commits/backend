import pool from '../../config/db';

export const importStudents = async (students: any[]) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const student of students) {
      await connection.query(
        'INSERT INTO students (name, roll_no, email, phone, department_id, batch_id, year, semester, section_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [student.name, student.roll_no, student.email, student.phone, student.department_id, student.batch_id, student.year, student.semester, student.section_id]
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const importFaculty = async (faculty: any[]) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const member of faculty) {
      await connection.query(
        'INSERT INTO faculty (name, email, phone, department_id, designation) VALUES (?, ?, ?, ?, ?)',
        [member.name, member.email, member.phone, member.department_id, member.designation]
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
