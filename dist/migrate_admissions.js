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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function migrate() {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield promise_1.default.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'college_erp',
        });
        console.log('Starting migration for Admissions System...');
        try {
            // 1. Add new columns to students table
            // We check if columns exist first or just use ALTER TABLE and ignore errors if they exist
            // But for a cleaner migration, let's do it step by step
            const [columns] = yield connection.query('SHOW COLUMNS FROM students');
            const columnNames = columns.map((c) => c.Field);
            const newColumns = [
                { name: 'gender', definition: "ENUM('Male', 'Female', 'Other')" },
                { name: 'dob', definition: 'DATE' },
                { name: 'phone', definition: 'VARCHAR(15) UNIQUE' },
                { name: 'aadhaar', definition: 'VARCHAR(12) UNIQUE' },
                { name: 'pan', definition: 'VARCHAR(10) UNIQUE' },
                { name: 'father_name', definition: 'VARCHAR(100)' },
                { name: 'mother_name', definition: 'VARCHAR(100)' },
                { name: 'parent_phone', definition: 'VARCHAR(15)' },
                { name: 'occupation', definition: 'VARCHAR(100)' },
                { name: 'permanent_address', definition: 'TEXT' },
                { name: 'current_address', definition: 'TEXT' },
                { name: 'student_id_card', definition: 'VARCHAR(50) UNIQUE' },
                { name: 'status', definition: "ENUM('APPLIED', 'VERIFIED', 'APPROVED', 'ACTIVE', 'DROPPED', 'GRADUATED', 'REJECTED') DEFAULT 'APPLIED'" },
                { name: 'remarks', definition: 'TEXT' },
                { name: 'course_id', definition: 'INT' },
                { name: 'created_at', definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
                { name: 'updated_at', definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
            ];
            for (const col of newColumns) {
                if (!columnNames.includes(col.name)) {
                    console.log(`Adding column ${col.name}...`);
                    yield connection.query(`ALTER TABLE students ADD COLUMN ${col.name} ${col.definition}`);
                }
            }
            // 2. Make roll_no and section_id nullable
            console.log('Making roll_no and section_id nullable...');
            yield connection.query('ALTER TABLE students MODIFY COLUMN roll_no VARCHAR(50) UNIQUE NULL');
            yield connection.query('ALTER TABLE students MODIFY COLUMN section_id INT NULL');
            // 3. Add foreign key for course_id if it doesn't exist
            try {
                yield connection.query('ALTER TABLE students ADD FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE');
            }
            catch (e) {
                console.log('Course FK might already exist or courses table missing.');
            }
            // 4. Create Documents Table
            console.log('Creating documents table...');
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
            console.log('Migration completed successfully.');
        }
        catch (error) {
            console.error('Migration failed:', error);
        }
        finally {
            yield connection.end();
        }
    });
}
migrate();
