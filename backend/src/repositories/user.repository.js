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
  return rows[0];
};

// Fungsi mencari user berdasarkan ID (tanpa password hash)
const findUserById = async (id) => {
  const [rows] = await db.query(
    `SELECT u.id, u.role_id, u.fullname, u.email, u.phone, u.address, u.created_at, u.updated_at, r.name as role_name 
     FROM users u 
     JOIN roles r ON u.role_id = r.id 
     WHERE u.id = ?`,
    [id]
  );
  return rows[0];
};

// Fungsi mencari user dengan password hash berdasarkan ID (untuk verifikasi ubah password)
const findUserWithPasswordById = async (id) => {
  const [rows] = await db.query(
    `SELECT u.*, r.name as role_name 
     FROM users u 
     JOIN roles r ON u.role_id = r.id 
     WHERE u.id = ?`,
    [id]
  );
  return rows[0];
};

// Fungsi update profil user
const updateUserProfile = async (id, { fullname, phone, address }) => {
  await db.query(
    `UPDATE users 
     SET fullname = ?, phone = ?, address = ?, updated_at = NOW() 
     WHERE id = ?`,
    [fullname, phone || null, address || null, id]
  );
  return findUserById(id);
};

// Fungsi update password user
const updateUserPassword = async (id, hashedPassword) => {
  await db.query(
    `UPDATE users 
     SET password = ?, updated_at = NOW() 
     WHERE id = ?`,
    [hashedPassword, id]
  );
  return true;
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
  findUserById,
  findUserWithPasswordById,
  updateUserProfile,
  updateUserPassword,
  createUser,
  findRoleByName
};