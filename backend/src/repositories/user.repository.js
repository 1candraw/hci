const db = require('../config/database');

// Fungsi mencari user beserta nama role-nya
const findUserByEmail = async (email) => {
  const [rows] = await db.query(
    `SELECT u.*, r.name as role_name 
     FROM users u 
     JOIN roles r ON u.role_id = r.id 
     WHERE u.email = ?`,
    [email]
  );
  return rows[0]; // Mengembalikan satu baris data user jika ada
};

// Fungsi membuat user baru (biasanya untuk register Customer)
const createUser = async (userData) => {
  const { role_id, fullname, email, password, phone, address } = userData;
  const [result] = await db.query(
    `INSERT INTO users (role_id, fullname, email, password, phone, address) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [role_id, fullname, email, password, phone, address]
  );
  return result.insertId;
};

// Fungsi bantuan untuk mencari ID dari sebuah Role
const findRoleByName = async (roleName) => {
  const [rows] = await db.query('SELECT id FROM roles WHERE name = ?', [roleName]);
  return rows[0];
};

module.exports = {
  findUserByEmail,
  createUser,
  findRoleByName
};