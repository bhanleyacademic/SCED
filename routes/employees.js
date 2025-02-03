const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const authMiddleware = require('../middleware/authMiddleware');

// Helpers to read/write JSON
function getEmployeesData() {
  const data = fs.readFileSync(path.join(__dirname, '../data/employees.json'), 'utf8');
  return JSON.parse(data);
}

function saveEmployeesData(employees) {
  fs.writeFileSync(
    path.join(__dirname, '../data/employees.json'),
    JSON.stringify(employees, null, 2),
    'utf8'
  );
}

// Configure Multer for file storage
// This will store the file in ./public/uploads and keep the original filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    // Optionally, you could do something unique like:
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));

    // But for simplicity, let's just keep original name:
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// POST: Create a new employee (with photo)
router.post('/', authMiddleware, upload.single('photo'), (req, res) => {
  try {
    const employees = getEmployeesData();

    // We get text fields from req.body
    const { firstName, lastName, department, role } = req.body;

    // If a file was uploaded, Multer makes it available at req.file
    let photoPath = null;
    if (req.file) {
      // We'll store just the relative path, e.g. "uploads/filename.jpg"
      photoPath = `uploads/${req.file.filename}`;
    }

    // Basic ID auto-increment
    const maxId = employees.reduce((max, emp) => Math.max(max, emp.id), 0);
    const newId = maxId + 1;

    const newEmployee = {
      id: newId,
      firstName,
      lastName,
      department,
      role,
      photo: photoPath // store the photo path in the JSON
    };

    employees.push(newEmployee);
    saveEmployeesData(employees);

    return res.status(201).json({ success: true, employee: newEmployee });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error creating employee' });
  }
});
