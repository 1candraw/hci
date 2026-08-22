const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const auditLogService = require('./auditlog.service');

const register = async (userData) => {
  // 1. Cek apakah email sudah dipakai
  const existingUser = await userRepository.findUserByEmail(userData.email);
  if (existingUser) {
    throw new Error('Email sudah terdaftar di sistem');
  }

  // 2. Tentukan role_id (Default ke Customer jika pendaftaran dari halaman depan)
  let role_id = userData.role_id;
  if (!role_id) {
    const role = await userRepository.findRoleByName('Customer');
    if (!role) throw new Error('Role Customer belum dibuat di database');
    role_id = role.id;
  }

  // 3. Enkripsi (Hash) Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  // 4. Simpan ke database
  const newUserId = await userRepository.createUser({
    ...userData,
    role_id,
    password: hashedPassword
  });

  return newUserId;
};

const login = async (email, password) => {
  // 1. Cari user berdasarkan email
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new Error('Email atau password salah');
  }

  // 2. Cocokkan password yang diinput dengan yang ada di database
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Email atau password salah');
  }

  // 3. Buat JWT Token
  const payload = {
    id: user.id,
    role: user.role_name,
    email: user.email
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  return {
    token,
    user: {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      role: user.role_name,
      phone: user.phone || null,
      address: user.address || null
    }
  };
};

// Ambil profil user saat ini
const getProfile = async (userId) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new Error('Pengguna tidak ditemukan');
  }
  return {
    id: user.id,
    fullname: user.fullname,
    email: user.email,
    role: user.role_name,
    phone: user.phone || '',
    address: user.address || '',
    created_at: user.created_at,
    updated_at: user.updated_at
  };
};

// Update informasi profil user
const updateProfile = async (userId, data) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new Error('Pengguna tidak ditemukan');
  }

  if (!data.fullname || data.fullname.trim() === '') {
    throw new Error('Nama lengkap tidak boleh kosong');
  }

  const updatedUser = await userRepository.updateUserProfile(userId, {
    fullname: data.fullname.trim(),
    phone: data.phone ? data.phone.trim() : null,
    address: data.address ? data.address.trim() : null
  });

  // Catat ke audit trail
  try {
    await auditLogService.logActivity({
      user_id: userId,
      action: 'UPDATE_PROFILE',
      entity_type: 'users',
      entity_id: userId,
      details: {
        fullname: updatedUser.fullname,
        phone: updatedUser.phone,
        address: updatedUser.address
      }
    });
  } catch (err) {
    console.error('Gagal mencatat audit log update profil:', err);
  }

  return {
    id: updatedUser.id,
    fullname: updatedUser.fullname,
    email: updatedUser.email,
    role: updatedUser.role_name,
    phone: updatedUser.phone || '',
    address: updatedUser.address || '',
    created_at: updatedUser.created_at,
    updated_at: updatedUser.updated_at
  };
};

// Ganti kata sandi akun
const changePassword = async (userId, { current_password, new_password }) => {
  if (!current_password || !new_password) {
    throw new Error('Kata sandi saat ini dan kata sandi baru wajib diisi');
  }

  if (new_password.length < 6) {
    throw new Error('Kata sandi baru minimal 6 karakter');
  }

  const user = await userRepository.findUserWithPasswordById(userId);
  if (!user) {
    throw new Error('Pengguna tidak ditemukan');
  }

  const isMatch = await bcrypt.compare(current_password, user.password);
  if (!isMatch) {
    throw new Error('Kata sandi saat ini salah');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(new_password, salt);

  await userRepository.updateUserPassword(userId, hashedPassword);

  // Catat ke audit trail
  try {
    await auditLogService.logActivity({
      user_id: userId,
      action: 'CHANGE_PASSWORD',
      entity_type: 'users',
      entity_id: userId,
      details: { message: 'Pengguna berhasil memperbarui kata sandi akun' }
    });
  } catch (err) {
    console.error('Gagal mencatat audit log change password:', err);
  }

  return true;
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};