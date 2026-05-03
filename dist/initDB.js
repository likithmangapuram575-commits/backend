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
const promise_1 = __importDefault(require("mysql2/promise"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function initDB() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield promise_1.default.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
            });
            console.log('Connected to MySQL. Creating database and tables if they do not exist...');
            yield connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'college_erp'}\``);
            yield connection.query(`USE \`${process.env.DB_NAME || 'college_erp'}\``);
            // Users Table
            yield connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(15) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('SuperAdmin', 'HOD', 'Student', 'Faculty', 'SupportStaff', 'Accountant', 'Administrator') NOT NULL
      )
    `);
            // Courses Table
            yield connection.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        duration_years INT NOT NULL,
        total_semesters INT NOT NULL
      )
    `);
            // Batches Table
            yield connection.query(`
      CREATE TABLE IF NOT EXISTS batches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(20) NOT NULL,
        start_year INT NOT NULL,
        end_year INT NOT NULL,
        course_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);
            // Departments Table
            yield connection.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        course_id INT NOT NULL,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);
            // Subjects Table
            yield connection.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(20) UNIQUE NOT NULL,
        credits INT NOT NULL,
        type ENUM('Theory', 'Lab') NOT NULL,
        department_id INT NOT NULL,
        semester INT NOT NULL,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
      )
    `);
            // Sections Table
            yield connection.query(`
      CREATE TABLE IF NOT EXISTS sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        department_id INT NOT NULL,
        batch_id INT NOT NULL,
        year INT NOT NULL,
        semester INT NOT NULL,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
        FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
      )
    `);
            // Fees Structure Table
            yield connection.query(`
      CREATE TABLE IF NOT EXISTS fees_structure (
        id INT AUTO_INCREMENT PRIMARY KEY,
        batch_id INT NOT NULL,
        tuition_fee DECIMAL(10, 2) NOT NULL,
        bus_fee DECIMAL(10, 2) DEFAULT 0,
        hostel_fee DECIMAL(10, 2) DEFAULT 0,
        other_charges DECIMAL(10, 2) DEFAULT 0,
        FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
      )
    `);
            // Announcements Table
            yield connection.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        target_role ENUM('All', 'Faculty', 'Student') DEFAULT 'All',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
            // Audit Logs Table
            yield connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(50) NOT NULL,
        table_name VARCHAR(50) NOT NULL,
        record_id INT,
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
            // Academic Calendar Table
            yield connection.query(`
      CREATE TABLE IF NOT EXISTS academic_calendar (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_name VARCHAR(100) NOT NULL,
        type ENUM('Exam', 'Holiday', 'Event') NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        batch_id INT,
        FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
      )
    `);
            // HOD Details Table
            yield connection.query(`
      CREATE TABLE IF NOT EXISTS hod_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        experience INT,
        qualification VARCHAR(100),
        position VARCHAR(100),
        image_url VARCHAR(255),
        certificates TEXT,
        documents TEXT,
        department_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
      )
    `);
            // Students Table
            yield connection.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        name VARCHAR(100) NOT NULL,
        gender ENUM('Male', 'Female', 'Other'),
        dob DATE,
        phone VARCHAR(15) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        course_id INT NOT NULL,
        department_id INT NOT NULL,
        batch_id INT NOT NULL,
        year INT DEFAULT 1,
        semester INT DEFAULT 1,
        section_id INT,
        aadhaar VARCHAR(12) UNIQUE NOT NULL,
        pan VARCHAR(10) UNIQUE,
        father_name VARCHAR(100),
        mother_name VARCHAR(100),
        parent_phone VARCHAR(15),
        occupation VARCHAR(100),
        permanent_address TEXT,
        current_address TEXT,
        roll_no VARCHAR(50) UNIQUE,
        student_id_card VARCHAR(50) UNIQUE,
        status ENUM('APPLIED', 'VERIFIED', 'APPROVED', 'ACTIVE', 'DROPPED', 'GRADUATED', 'REJECTED') DEFAULT 'APPLIED',
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
            // Documents Table
            yield connection.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        type VARCHAR(100) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        status ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
        remarks TEXT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);
            // Faculty Table
            yield connection.query(`
      CREATE TABLE IF NOT EXISTS faculty (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        department_id INT NOT NULL,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
      )
    `);
            // Attendance Table
            yield connection.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        date DATE NOT NULL,
        status ENUM('Present', 'Absent', 'Leave') NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);
            // Marks Table
            yield connection.query(`
      CREATE TABLE IF NOT EXISTS marks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        subject_id INT,
        marks INT NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
      )
    `);
            // Seed Super Admin
            const [rows] = yield connection.query(`SELECT * FROM users WHERE phone = '9014472021'`);
            if (rows.length === 0) {
                const hashedPassword = yield bcrypt_1.default.hash('Admin@123', 10);
                yield connection.query(`INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, ?)`, ['Principal Admin', '9014472021', hashedPassword, 'SuperAdmin']);
                console.log('Super Admin seeded successfully.');
            }
            else {
                console.log('Super Admin already exists.');
            }
            console.log('Database initialization completed.');
            yield connection.end();
        }
        catch (error) {
            console.error('Error initializing database:', error);
        }
    });
}
initDB();
