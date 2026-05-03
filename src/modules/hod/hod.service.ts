import pool from '../../config/db';

export const getAllHods = async () => {
  const [rows] = await pool.query(`
    SELECT u.id, u.name, u.phone, h.id as hod_id, h.experience, h.qualification, h.position, h.image_url, h.certificates, h.documents, d.name as department_name, d.id as department_id
    FROM users u
    JOIN hod_details h ON u.id = h.user_id
    LEFT JOIN departments d ON h.department_id = d.id
    WHERE u.role = 'HOD'
  `);
  return rows;
};

export const addHod = async (data: any) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [userResult]: any = await connection.query(
      'INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, ?)',
      [data.name, data.phone, data.hashedPassword, 'HOD']
    );
    const userId = userResult.insertId;

    const [hodResult]: any = await connection.query(
      'INSERT INTO hod_details (user_id, experience, qualification, position, image_url, certificates, documents, department_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, data.experience, data.qualification, data.position, data.image_url, data.certificates, data.documents, data.department_id]
    );

    await connection.commit();
    return hodResult;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const editHod = async (id: number, data: any) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [hodRows]: any = await connection.query('SELECT user_id FROM hod_details WHERE id = ?', [id]);
    if (hodRows.length === 0) throw new Error('HOD not found');
    const userId = hodRows[0].user_id;

    if (data.name || data.phone) {
      await connection.query(
        'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?',
        [data.name, data.phone, userId]
      );
    }

    let updateHodQuery = `
      UPDATE hod_details 
      SET experience = COALESCE(?, experience), 
          qualification = COALESCE(?, qualification),
          position = COALESCE(?, position),
          department_id = COALESCE(?, department_id)`;
    let params: any[] = [data.experience, data.qualification, data.position, data.department_id];

    if (data.image_url) {
      updateHodQuery += ', image_url = ?';
      params.push(data.image_url);
    }
    if (data.certificates) {
      updateHodQuery += ', certificates = ?';
      params.push(data.certificates);
    }
    if (data.documents) {
      updateHodQuery += ', documents = ?';
      params.push(data.documents);
    }
    updateHodQuery += ' WHERE id = ?';
    params.push(id);

    const [result]: any = await connection.query(updateHodQuery, params);
    
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const removeHod = async (id: number) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [hodRows]: any = await connection.query('SELECT user_id FROM hod_details WHERE id = ?', [id]);
    if (hodRows.length > 0) {
      const userId = hodRows[0].user_id;
      // Because of ON DELETE CASCADE, deleting from users will delete from hod_details
      await connection.query('DELETE FROM users WHERE id = ?', [userId]);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
export const getHodByUserId = async (userId: number) => {
  const [rows]: any = await pool.query(`
    SELECT h.*, d.name as department_name 
    FROM hod_details h
    LEFT JOIN departments d ON h.department_id = d.id
    WHERE h.user_id = ?
  `, [userId]);
  return rows[0];
};

export const getDashboardStats = async (departmentId: number) => {
  const [studentCount]: any = await pool.query('SELECT COUNT(*) as count FROM students WHERE department_id = ?', [departmentId]);
  const [facultyCount]: any = await pool.query('SELECT COUNT(*) as count FROM faculty_details WHERE department_id = ?', [departmentId]);
  const [sectionCount]: any = await pool.query('SELECT COUNT(*) as count FROM sections WHERE department_id = ?', [departmentId]);
  const [subjectCount]: any = await pool.query('SELECT COUNT(*) as count FROM subjects WHERE department_id = ?', [departmentId]);

  return {
    students: studentCount[0].count,
    faculty: facultyCount[0].count,
    sections: sectionCount[0].count,
    subjects: subjectCount[0].count,
    attendanceOverview: 85,
    performanceSummary: 'Good'
  };
};
