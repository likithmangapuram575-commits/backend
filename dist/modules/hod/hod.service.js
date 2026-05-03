"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.getHodByUserId = exports.removeHod = exports.editHod = exports.addHod = exports.getAllHods = void 0;
const db_1 = __importDefault(require("../../config/db"));
const getAllHods = () => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.query(`
    SELECT u.id, u.name, u.phone, h.id as hod_id, h.experience, h.qualification, h.position, h.image_url, h.certificates, h.documents, d.name as department_name, d.id as department_id
    FROM users u
    JOIN hod_details h ON u.id = h.user_id
    LEFT JOIN departments d ON h.department_id = d.id
    WHERE u.role = 'HOD'
  `);
    return rows;
});
exports.getAllHods = getAllHods;
const addHod = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield db_1.default.getConnection();
    try {
        yield connection.beginTransaction();
        const [userResult] = yield connection.query('INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, ?)', [data.name, data.phone, data.hashedPassword, 'HOD']);
        const userId = userResult.insertId;
        const [hodResult] = yield connection.query('INSERT INTO hod_details (user_id, experience, qualification, position, image_url, certificates, documents, department_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [userId, data.experience, data.qualification, data.position, data.image_url, data.certificates, data.documents, data.department_id]);
        yield connection.commit();
        return hodResult;
    }
    catch (error) {
        yield connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
});
exports.addHod = addHod;
const editHod = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield db_1.default.getConnection();
    try {
        yield connection.beginTransaction();
        const [hodRows] = yield connection.query('SELECT user_id FROM hod_details WHERE id = ?', [id]);
        if (hodRows.length === 0)
            throw new Error('HOD not found');
        const userId = hodRows[0].user_id;
        if (data.name || data.phone) {
            yield connection.query('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?', [data.name, data.phone, userId]);
        }
        let updateHodQuery = `
      UPDATE hod_details 
      SET experience = COALESCE(?, experience), 
          qualification = COALESCE(?, qualification),
          position = COALESCE(?, position),
          department_id = COALESCE(?, department_id)`;
        let params = [data.experience, data.qualification, data.position, data.department_id];
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
        const [result] = yield connection.query(updateHodQuery, params);
        yield connection.commit();
        return result;
    }
    catch (error) {
        yield connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
});
exports.editHod = editHod;
const removeHod = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield db_1.default.getConnection();
    try {
        yield connection.beginTransaction();
        const [hodRows] = yield connection.query('SELECT user_id FROM hod_details WHERE id = ?', [id]);
        if (hodRows.length > 0) {
            const userId = hodRows[0].user_id;
            // Because of ON DELETE CASCADE, deleting from users will delete from hod_details
            yield connection.query('DELETE FROM users WHERE id = ?', [userId]);
        }
        yield connection.commit();
    }
    catch (error) {
        yield connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
});
exports.removeHod = removeHod;
const getHodByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.query(`
    SELECT h.*, d.name as department_name 
    FROM hod_details h
    LEFT JOIN departments d ON h.department_id = d.id
    WHERE h.user_id = ?
  `, [userId]);
    return rows[0];
});
exports.getHodByUserId = getHodByUserId;
const getDashboardStats = (departmentId) => __awaiter(void 0, void 0, void 0, function* () {
    const [studentCount] = yield db_1.default.query('SELECT COUNT(*) as count FROM students WHERE department_id = ?', [departmentId]);
    const [facultyCount] = yield db_1.default.query('SELECT COUNT(*) as count FROM faculty_details WHERE department_id = ?', [departmentId]);
    const [sectionCount] = yield db_1.default.query('SELECT COUNT(*) as count FROM sections WHERE department_id = ?', [departmentId]);
    const [subjectCount] = yield db_1.default.query('SELECT COUNT(*) as count FROM subjects WHERE department_id = ?', [departmentId]);
    return {
        students: studentCount[0].count,
        faculty: facultyCount[0].count,
        sections: sectionCount[0].count,
        subjects: subjectCount[0].count,
        attendanceOverview: 85,
        performanceSummary: 'Good'
    };
});
exports.getDashboardStats = getDashboardStats;
