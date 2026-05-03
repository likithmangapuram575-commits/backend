const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function seed() {
  const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'likithliki90',
    database: 'college_erp'
  };

  const conn = await mysql.createConnection(dbConfig);
  console.log('Connected to database.');

  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const [departments] = await conn.query('SELECT * FROM departments');
    const [batches] = await conn.query('SELECT * FROM batches');
    
    if (departments.length === 0) {
      console.error('No departments found. Please create departments first.');
      return;
    }

    console.log('Cleaning up previous seed data...');
    // We only delete users/students that look like seed data to avoid deleting admin/manual accounts
    await conn.query('DELETE FROM users WHERE name LIKE "HOD %" OR name LIKE "Faculty %"');
    await conn.query('DELETE FROM students WHERE name LIKE "Student %"');
    await conn.query('DELETE FROM subject_assignments'); // Clear all assignments to start fresh
    await conn.query('DELETE FROM timetable'); // Clear all timetable to start fresh
    await conn.query('DELETE FROM sections WHERE name LIKE "%-SEC-%"');

    const batchId = batches.length > 0 ? batches[0].id : 1;
    const courseId = 2; // B.Tech

    for (const dept of departments) {
      console.log(`\n--- Seeding Department: ${dept.name} (ID: ${dept.id}) ---`);
      
      const deptCode = dept.code || dept.name.split(' ').map(w => w[0]).join('').substring(0, 5);
      const deptId = dept.id;

      // 1. Create 1 HOD
      console.log('Creating HOD...');
      const hodPhone = `9${deptId.toString().padStart(2, '0')}000000`.substring(0, 10);
      const hodEmail = `hod.${deptCode.toLowerCase()}@college.edu`;
      
      const [hodUser] = await conn.query(
        'INSERT INTO users (name, phone, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [`HOD ${dept.name}`, hodPhone, hodEmail, hashedPassword, 'HOD']
      );
      
      await conn.query(
        'INSERT INTO hod_details (user_id, department_id, qualification, experience, position, designation) VALUES (?, ?, ?, ?, ?, ?)',
        [hodUser.insertId, deptId, 'Ph.D in ' + dept.name, 15, 'Professor', 'HOD']
      );

      // 2. Create 15 Teachers
      console.log('Creating 15 Teachers...');
      const facultyUserIds = [];
      
      // Add manual faculty (like bhargavi) to the list if they are in this department
      const [manualFacs] = await conn.query('SELECT user_id FROM faculty WHERE department_id = ?', [deptId]);
      manualFacs.forEach(f => facultyUserIds.push(f.user_id));

      for (let i = 1; i <= 15; i++) {
        const facPhone = `8${deptId.toString().padStart(2, '0')}${i.toString().padStart(3, '0')}00`.substring(0, 10);
        const facEmail = `faculty${i}.${deptCode.toLowerCase()}@college.edu`;
        const facName = `Faculty ${i} - ${deptCode}`;

        const [facUser] = await conn.query(
          'INSERT INTO users (name, phone, email, password, role) VALUES (?, ?, ?, ?, ?)',
          [facName, facPhone, facEmail, hashedPassword, 'Faculty']
        );
        facultyUserIds.push(facUser.insertId);

        await conn.query(
          'INSERT INTO faculty (user_id, name, department_id) VALUES (?, ?, ?)',
          [facUser.insertId, facName, deptId]
        );

        await conn.query(
          'INSERT INTO faculty_details (user_id, department_id, qualification, experience, salary) VALUES (?, ?, ?, ?, ?)',
          [facUser.insertId, deptId, 'M.Tech / Ph.D', 5 + (i % 10), 50000 + (i * 1000)]
        );
      }

      // 3. Create 3 Sections (Requested format: CSE-1, CSE-2, CSE-3)
      console.log('Creating 3 Sections...');
      const [deptSubjects] = await conn.query('SELECT id FROM subjects WHERE department_id = ? AND semester = 1', [deptId]);
      
      for (let i = 1; i <= 3; i++) {
        const sectionName = `${deptCode}-${i}`;
        
        const [secResult] = await conn.query(
          'INSERT INTO sections (name, department_id, year, semester, batch_id) VALUES (?, ?, ?, ?, ?)',
          [sectionName, deptId, 1, 1, batchId]
        );
        const sectionId = secResult.insertId;

        // 4. Assign Subjects to ALL Faculty for this section
        console.log(`  Assigning subjects to faculty for ${sectionName}...`);
        if (deptSubjects.length > 0) {
          for (let sIdx = 0; sIdx < deptSubjects.length; sIdx++) {
              // Distribute subjects among all faculty in dept (including manual ones like bhargavi)
              const facultyUserId = facultyUserIds[sIdx % facultyUserIds.length];
              const subjectId = deptSubjects[sIdx].id;
              
              await conn.query(
                  'INSERT INTO subject_assignments (faculty_id, subject_id, section_id, semester, department_id, batch_id, year) VALUES (?, ?, ?, ?, ?, ?, ?)',
                  [facultyUserId, subjectId, sectionId, 1, deptId, batchId, 1]
              );
          }
        }

        // 5. Create 30 Students per section
        console.log(`  Adding 30 students to ${sectionName}...`);
        for (let j = 1; j <= 30; j++) {
          const studentIdx = (i - 1) * 30 + j;
          const rollNo = `${deptCode}${i}${j.toString().padStart(2, '0')}${deptId}`; // Ensure unique roll_no
          const studentEmail = `student.${rollNo.toLowerCase()}@college.edu`;
          const studentPhone = `7${deptId.toString().padStart(2, '0')}${studentIdx.toString().padStart(4, '0')}`.substring(0, 10);
          const studentName = `Student ${studentIdx} - ${sectionName}`;

          try {
            await conn.query(
              `INSERT INTO students (
                name, roll_no, email, phone, department_id, section_id, 
                year, semester, batch_id, course_id, status, 
                aadhaar, pan, student_id_card
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                studentName, rollNo, studentEmail, studentPhone, deptId, sectionId,
                1, 1, batchId, courseId, 'ACTIVE',
                `1234${deptId.toString().padStart(2, '0')}${studentIdx.toString().padStart(4, '0')}`,
                `PAN${deptId}${studentIdx.toString().padStart(5, '0')}`,
                `ID-${deptCode}-${i}-${j.toString().padStart(2, '0')}`
              ]
            );
          } catch (e) {
             // Roll number conflicts are avoided by adding deptId suffix
          }
        }
      }
    }

    console.log('\n✅ Data generation completed successfully!');
    console.log('Credentials Summary:');
    console.log('- Students login via OTP using their @college.edu emails.');
    console.log('- HODs/Faculty login using their Phone numbers and password: password123');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await conn.end();
  }
}

seed();
