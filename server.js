const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

// For JSON parsing
app.use(bodyParser.json());

// Serve static files (for front-end) from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');

app.use('/auth', authRoutes);
app.use('/employees', employeeRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

function getEmployeesData() {
  const data = fs.readFileSync(path.join(__dirname, '../data/employees.json'), 'utf8');
  return JSON.parse(data);
}

function saveEmployeesData(employees) {
  fs.writeFileSync(path.join(__dirname, '../data/employees.json'), JSON.stringify(employees, null, 2), 'utf8');
}

