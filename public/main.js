let employees = [];
let authToken = null; // Will store your JWT here in memory (or localStorage)

document.addEventListener('DOMContentLoaded', () => {
  fetchEmployees();

  document.getElementById('searchBtn').addEventListener('click', filterAndSort);

  // Login form events
  document.getElementById('loginBtn').addEventListener('click', login);

  // Admin events
  document.getElementById('addEmployeeBtn').addEventListener('click', addEmployee);
  document.getElementById('logoutBtn').addEventListener('click', logout);

  // Check if token is stored (optional)
  const storedToken = localStorage.getItem('token');
  if (storedToken) {
    authToken = storedToken;
    showAdminSection(true);
  }
});

async function fetchEmployees() {
  try {
    const res = await fetch('/employees');
    employees = await res.json();
    displayEmployees(employees);
  } catch (err) {
    console.error('Error fetching employees:', err);
  }
}

function displayEmployees(employeeArray) {
  const list = document.getElementById('employeeList');
  list.innerHTML = '';

  employeeArray.forEach((emp) => {
    const li = document.createElement('li');

    // Create text or other details
    const text = document.createElement('span');
    text.textContent = `${emp.firstName} ${emp.lastName} – ${emp.department} (${emp.role})`;

    // If a photo is set, show an img
    if (emp.photo) {
      const img = document.createElement('img');
      img.src = emp.photo;  // "uploads/filename.jpg"
      img.alt = `${emp.firstName} ${emp.lastName}`;
      img.width = 50;  // or whatever size you like
      li.appendChild(img);
      li.appendChild(document.createTextNode(' ')); // spacing
    }

    li.appendChild(text);
    list.appendChild(li);
  });
}


function filterAndSort() {
  const searchValue = document.getElementById('searchInput').value.toLowerCase();
  const sortField = document.getElementById('sortSelect').value;

  let filtered = employees.filter((emp) => {
    const fullName = (emp.firstName + ' ' + emp.lastName).toLowerCase();
    return fullName.includes(searchValue);
  });

  if (sortField) {
    filtered.sort((a, b) => {
      if (a[sortField] < b[sortField]) return -1;
      if (a[sortField] > b[sortField]) return 1;
      return 0;
    });
  }
  displayEmployees(filtered);
}

// ----------------------------
// LOGIN / LOGOUT
// ----------------------------
async function login() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      authToken = data.token;
      localStorage.setItem('token', authToken); // store token
      showAdminSection(true);
      alert('Login successful!');
    } else {
      alert('Login failed: ' + (data.message || 'Check credentials'));
    }
  } catch (err) {
    console.error('Error logging in:', err);
    alert('Login error');
  }
}

function logout() {
  authToken = null;
  localStorage.removeItem('token');
  showAdminSection(false);
  alert('Logged out');
}

// Toggle showing/hiding admin UI
function showAdminSection(isLoggedIn) {
  document.getElementById('adminSection').style.display = isLoggedIn ? 'block' : 'none';
  document.getElementById('loginSection').style.display = isLoggedIn ? 'none' : 'block';
}

// ----------------------------
// ADMIN ACTIONS (Protected)
// ----------------------------
async function addEmployee() {
  if (!authToken) {
    alert('You must be logged in as admin to do that.');
    return;
  }

  const firstName = document.getElementById('firstNameInput').value;
  const lastName = document.getElementById('lastNameInput').value;
  const department = document.getElementById('deptInput').value;
  const role = document.getElementById('roleInput').value;
  const photo = document.getElementById('photoInput').files[0]; // The actual file

  // Create FormData and append fields
  const formData = new FormData();
  formData.append('firstName', firstName);
  formData.append('lastName', lastName);
  formData.append('department', department);
  formData.append('role', role);
  formData.append('photo', photo);  // important: the key 'photo' should match what Multer expects

  try {
    const res = await fetch('/employees', {
      method: 'POST',
      headers: {
        // Do NOT set 'Content-Type' manually to 'application/json' here,
        // because fetch will automatically set the correct multipart/form-data boundary.
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData
    });

    const data = await res.json();
    if (res.ok && data.success) {
      alert('Employee added!');
      fetchEmployees();
      // clear fields
      document.getElementById('firstNameInput').value = '';
      document.getElementById('lastNameInput').value = '';
      document.getElementById('deptInput').value = '';
      document.getElementById('roleInput').value = '';
      document.getElementById('photoInput').value = '';
    } else {
      alert('Error adding employee: ' + (data.message || 'Unknown error'));
    }
  } catch (err) {
    console.error('Error adding employee:', err);
    alert('Error adding employee');
  }
}

