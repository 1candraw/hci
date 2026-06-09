const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');

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

  // 3. Buat JWT Token (Bawa data ID dan Role agar bisa dibaca di frontend)
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
      role: user.role_name
    }
  };
};

module.exports = {
  register,
  login
};