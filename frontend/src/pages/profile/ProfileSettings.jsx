import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';
import {
  User,
  ShieldCheck,
  Lock,
  Bell,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Save,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Building,
  Check
} from 'lucide-react';

const ProfileSettings = () => {
  const { user, updateUser } = useAuth();

  // Active Tab State
  const [activeTab, setActiveTab] = useState('profil');

  // Form State: Profil
  const [profileForm, setProfileForm] = useState({
    fullname: '',
    email: '',
    phone: '',
    address: '',
    jobTitle: '',
    hubLocation: 'Hub Jakarta Pusat (Headquarters)',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Form State: Password
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // State: Business Preferences
  const [preferences, setPreferences] = useState({
    emailNewRFQ: true,
    emailPDISuratJalan: true,
    weeklyReport: false,
    onCallAvailability: true,
  });
  const [prefSavedMsg, setPrefSavedMsg] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    // Load local business preferences if any
    const savedPref = localStorage.getItem('hc_user_preferences');
    if (savedPref) {
      try {
        setPreferences(JSON.parse(savedPref));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await authService.getProfile();
      if (res.data) {
        setProfileForm({
          fullname: res.data.fullname || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
          jobTitle: getJobTitleByRole(res.data.role),
          hubLocation: 'Hub Jakarta Pusat (Headquarters & Pool Logistik)',
        });
      }
    } catch {
      // Fallback ke user context jika API error
      if (user) {
        setProfileForm({
          fullname: user.fullname || user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          jobTitle: getJobTitleByRole(user.role),
          hubLocation: 'Hub Jakarta Pusat (Headquarters & Pool Logistik)',
        });
      }
    }
  };

  const getJobTitleByRole = (role) => {
    switch (role) {
      case 'Manager': return 'General Manager & Heavy Equipment Fleet Lead';
      case 'Sales': return 'Senior Heavy Equipment Sales Specialist';
      case 'Operasional': return 'Lead Fleet Technical Inspector & PDI Officer';
      default: return 'Authorized Procurement Customer';
    }
  };

  // Handler Simpan Profil
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!profileForm.fullname.trim()) {
      setProfileError('Nama lengkap wajib diisi.');
      return;
    }

    try {
      setSavingProfile(true);
      const res = await authService.updateProfile({
        fullname: profileForm.fullname,
        phone: profileForm.phone,
        address: profileForm.address,
      });

      // Update Context & LocalStorage
      updateUser({
        fullname: res.data.fullname,
        phone: res.data.phone,
        address: res.data.address,
      });

      setProfileSuccess('Informasi profil berhasil diperbarui!');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError(typeof err === 'string' ? err : 'Gagal memperbarui profil.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handler Ganti Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('Konfirmasi kata sandi baru tidak cocok!');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      setPasswordError('Kata sandi baru minimal 6 karakter.');
      return;
    }

    try {
      setSavingPassword(true);
      await authService.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });

      setPasswordSuccess('Kata sandi akun berhasil diubah secara aman!');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(typeof err === 'string' ? err : 'Gagal mengubah kata sandi.');
    } finally {
      setSavingPassword(false);
    }
  };

  // Handler Preferensi
  const handleTogglePref = (key) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    localStorage.setItem('hc_user_preferences', JSON.stringify(updated));
    setPrefSavedMsg(true);
    setTimeout(() => setPrefSavedMsg(false), 2500);
  };

  const roleStyles = {
    Manager:     { bg: '#0d141e', text: '#74c02c', border: '#74c02c' },
    Sales:       { bg: '#ecfccb', text: '#15803d', border: '#84cc16' },
    Operasional: { bg: '#cffafe', text: '#0891b2', border: '#67e8f9' },
    Customer:    { bg: '#e0e7ff', text: '#3730a3', border: '#818cf8' },
  };
  const currentRoleStyle = roleStyles[user?.role] || { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };

  const nipFormatted = `HC-STF-${String(user?.id || 1).padStart(4, '0')}`;

  return (
    <div style={s.container}>
      {/* ── 1. PROFILE HERO HEADER CARD ── */}
      <div style={s.heroCard}>
        <div style={s.heroTopAccent} />
        
        <div style={s.heroContent}>
          {/* Avatar */}
          <div style={{ ...s.avatarBox, borderColor: currentRoleStyle.border }}>
            <span style={s.avatarLetter}>
              {(profileForm.fullname || user?.fullname || user?.name || 'U')[0].toUpperCase()}
            </span>
          </div>

          {/* Identity Meta */}
          <div style={s.heroMeta}>
            <div style={s.heroTagRow}>
              <span style={{ ...s.roleBadge, backgroundColor: currentRoleStyle.bg, color: currentRoleStyle.text, border: `1px solid ${currentRoleStyle.border}` }}>
                <ShieldCheck size={12} strokeWidth={2.5} style={{ marginRight: '4px' }} />
                {user?.role || 'Staff Member'}
              </span>
              <span style={s.nipBadge}>
                ID Pegawai: {nipFormatted}
              </span>
              <span style={s.onlineBadge}>
                <span style={s.onlineDot} />
                Aktif · Terautentikasi
              </span>
            </div>

            <h1 style={s.heroName}>
              {profileForm.fullname || user?.fullname || user?.name || 'Nama Pengguna'}
            </h1>
            <p style={s.heroJobTitle}>
              {profileForm.jobTitle}
            </p>

            <div style={s.heroQuickDetails}>
              <div style={s.heroDetailItem}>
                <Mail size={14} style={{ color: '#74c02c' }} />
                <span>{profileForm.email || user?.email || '-'}</span>
              </div>
              <div style={s.heroDetailItem}>
                <Building size={14} style={{ color: '#74c02c' }} />
                <span>PT Heavy Care Indonesia</span>
              </div>
              <div style={s.heroDetailItem}>
                <MapPin size={14} style={{ color: '#74c02c' }} />
                <span>{profileForm.hubLocation}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. TABBED NAVIGATION ── */}
      <div style={s.tabBar}>
        {[
          { id: 'profil', label: 'Informasi Profil & Kontak', icon: User },
          { id: 'keamanan', label: 'Keamanan & Kata Sandi', icon: Lock },
          { id: 'preferensi', label: 'Preferensi & Notifikasi', icon: Bell },
          { id: 'akses', label: 'Lingkup Hak Akses Role', icon: Briefcase },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...s.tabBtn,
                backgroundColor: isActive ? '#0d141e' : '#ffffff',
                color: isActive ? '#74c02c' : '#475569',
                borderColor: isActive ? '#0d141e' : '#e2e8f0',
                boxShadow: isActive ? '0 4px 12px rgba(13, 20, 30, 0.25)' : 'none',
              }}
            >
              <Icon size={15} strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 3. TAB CONTENT PANELS ── */}

      {/* TAB 1: INFORMASI PROFIL & KONTAK BISNIS */}
      {activeTab === 'profil' && (
        <div style={s.panelCard}>
          <div style={s.panelHeader}>
            <div>
              <h3 style={s.panelTitle}>Informasi Profil & Kontak Bisnis</h3>
              <p style={s.panelSub}>Data ini digunakan pada korespondensi quotation resmi, penugasan teknisi PDI, dan tanda tangan BAST.</p>
            </div>
          </div>

          {profileSuccess && (
            <div style={s.successBox}>
              <CheckCircle2 size={16} />
              <span>{profileSuccess}</span>
            </div>
          )}
          {profileError && (
            <div style={s.errorBox}>
              <AlertCircle size={16} />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} style={s.form}>
            <div style={s.formGrid2}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Nama Lengkap / PIC Resmi <span style={s.req}>*</span></label>
                <div style={s.inputWrap}>
                  <User size={16} style={s.inputIcon} />
                  <input
                    type="text"
                    value={profileForm.fullname}
                    onChange={(e) => setProfileForm({ ...profileForm, fullname: e.target.value })}
                    required
                    style={s.input}
                    placeholder="Contoh: Ir. Budi Santoso"
                  />
                </div>
                <span style={s.inputHelp}>Nama yang akan tercantum pada dokumen penawaran harga & surat jalan.</span>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Alamat Email Akun (Read-only)</label>
                <div style={s.inputWrap}>
                  <Mail size={16} style={s.inputIcon} />
                  <input
                    type="email"
                    value={profileForm.email}
                    disabled
                    style={{ ...s.input, backgroundColor: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                  />
                </div>
                <span style={s.inputHelp}>Email utama terikat dengan hak akses role sistem.</span>
              </div>
            </div>

            <div style={s.formGrid2}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Nomor WhatsApp / Kontak Kerja</label>
                <div style={s.inputWrap}>
                  <Phone size={16} style={s.inputIcon} />
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    style={s.input}
                    placeholder="Contoh: 081268920766"
                  />
                </div>
                <span style={s.inputHelp}>Digunakan untuk koordinasi darurat servis & konfirmasi status order.</span>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Jabatan Fungsional Resmi</label>
                <div style={s.inputWrap}>
                  <Briefcase size={16} style={s.inputIcon} />
                  <input
                    type="text"
                    value={profileForm.jobTitle}
                    onChange={(e) => setProfileForm({ ...profileForm, jobTitle: e.target.value })}
                    style={s.input}
                    placeholder="Contoh: Senior Equipment Sales"
                  />
                </div>
                <span style={s.inputHelp}>Spesialisasi tugas pada portal manajemen internal.</span>
              </div>
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label}>Alamat Domisili / Lokasi Kantor Penugasan</label>
              <div style={s.inputWrap}>
                <MapPin size={16} style={{ ...s.inputIcon, top: '14px' }} />
                <textarea
                  rows="3"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  style={{ ...s.input, height: '80px', paddingTop: '0.65rem', resize: 'vertical' }}
                  placeholder="Contoh: Pergudangan Logistik Alat Berat Kav. 12, Jl. Pelabuhan Baru, Jakarta Utara"
                ></textarea>
              </div>
            </div>

            <div style={s.formActions}>
              <button type="submit" disabled={savingProfile} style={s.btnSavePrimary}>
                <Save size={16} />
                <span>{savingProfile ? 'Menyimpan Perubahan...' : 'Simpan Pembaruan Profil'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: KEAMANAN & KATA SANDI */}
      {activeTab === 'keamanan' && (
        <div style={s.panelCard}>
          <div style={s.panelHeader}>
            <div>
              <h3 style={s.panelTitle}>Keamanan Akun & Pembaruan Kata Sandi</h3>
              <p style={s.panelSub}>Pastikan kata sandi Anda menggunakan kombinasi kuat untuk menjaga keamanan data enterprise.</p>
            </div>
          </div>

          {passwordSuccess && (
            <div style={s.successBox}>
              <CheckCircle2 size={16} />
              <span>{passwordSuccess}</span>
            </div>
          )}
          {passwordError && (
            <div style={s.errorBox}>
              <AlertCircle size={16} />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} style={s.form}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Kata Sandi Saat Ini <span style={s.req}>*</span></label>
              <div style={s.inputWrap}>
                <Lock size={16} style={s.inputIcon} />
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  required
                  style={s.input}
                  placeholder="Masukkan kata sandi lama Anda"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  style={s.eyeBtn}
                >
                  {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div style={s.formGrid2}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Kata Sandi Baru <span style={s.req}>*</span></label>
                <div style={s.inputWrap}>
                  <KeyRound size={16} style={s.inputIcon} />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    required
                    style={s.input}
                    placeholder="Minimal 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    style={s.eyeBtn}
                  >
                    {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Konfirmasi Kata Sandi Baru <span style={s.req}>*</span></label>
                <div style={s.inputWrap}>
                  <KeyRound size={16} style={s.inputIcon} />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    required
                    style={s.input}
                    placeholder="Ketik ulang kata sandi baru"
                  />
                </div>
              </div>
            </div>

            {/* Password Criteria Checklist */}
            <div style={s.criteriaBox}>
              <span style={s.criteriaTitle}>STANDAR KEAMANAN KATA SANDI:</span>
              <div style={s.criteriaGrid}>
                <div style={s.criteriaItem}>
                  <Check size={14} style={{ color: passwordForm.new_password.length >= 6 ? '#15803d' : '#94a3b8' }} />
                  <span style={{ color: passwordForm.new_password.length >= 6 ? '#15803d' : '#64748b' }}>Minimal 6 karakter</span>
                </div>
                <div style={s.criteriaItem}>
                  <Check size={14} style={{ color: (passwordForm.new_password && passwordForm.new_password === passwordForm.confirm_password) ? '#15803d' : '#94a3b8' }} />
                  <span style={{ color: (passwordForm.new_password && passwordForm.new_password === passwordForm.confirm_password) ? '#15803d' : '#64748b' }}>Konfirmasi kata sandi cocok</span>
                </div>
              </div>
            </div>

            <div style={s.formActions}>
              <button type="submit" disabled={savingPassword} style={s.btnSavePrimary}>
                <Lock size={16} />
                <span>{savingPassword ? 'Mengenkripsi & Menyimpan...' : 'Perbarui Kata Sandi Akun'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: PREFERENSI BISNIS & NOTIFIKASI */}
      {activeTab === 'preferensi' && (
        <div style={s.panelCard}>
          <div style={s.panelHeader}>
            <div>
              <h3 style={s.panelTitle}>Preferensi Operasional & Notifikasi Sistem</h3>
              <p style={s.panelSub}>Sesuaikan jalur komunikasi dan kesiapan operasional tim Anda.</p>
            </div>
          </div>

          {prefSavedMsg && (
            <div style={s.successBox}>
              <CheckCircle2 size={16} />
              <span>Preferensi berhasil disimpan secara otomatis!</span>
            </div>
          )}

          <div style={s.prefList}>
            <div style={s.prefItem}>
              <div style={s.prefInfo}>
                <strong>Notifikasi Dokumen RFQ / Pesanan Baru</strong>
                <p>Terima pemberitahuan instan saat pembeli publik atau customer mengajukan penawaran harga baru.</p>
              </div>
              <label style={s.switch}>
                <input
                  type="checkbox"
                  checked={preferences.emailNewRFQ}
                  onChange={() => handleTogglePref('emailNewRFQ')}
                />
                <span style={s.sliderToggle} />
              </label>
            </div>

            <div style={s.prefItem}>
              <div style={s.prefInfo}>
                <strong>Notifikasi Status PDI & Surat Jalan Pengiriman</strong>
                <p>Kirimkan notifikasi saat unit selesai diuji fisik 6 titik vital dan armada ekspedisi diberangkatkan.</p>
              </div>
              <label style={s.switch}>
                <input
                  type="checkbox"
                  checked={preferences.emailPDISuratJalan}
                  onChange={() => handleTogglePref('emailPDISuratJalan')}
                />
                <span style={s.sliderToggle} />
              </label>
            </div>

            <div style={s.prefItem}>
              <div style={s.prefInfo}>
                <strong>Ringkasan Analitik Mingguan & Audit Log</strong>
                <p>Dapatkan ringkasan statistik performa penjualan, ketersediaan unit ready stock, dan aktivitas audit.</p>
              </div>
              <label style={s.switch}>
                <input
                  type="checkbox"
                  checked={preferences.weeklyReport}
                  onChange={() => handleTogglePref('weeklyReport')}
                />
                <span style={s.sliderToggle} />
              </label>
            </div>

            <div style={s.prefItem}>
              <div style={s.prefInfo}>
                <strong>Status Kesiapan Tim Servis & On-Call 24/7</strong>
                <p>Tandai status Anda sebagai PIC aktif yang dapat dihubungi pelanggan untuk perbaikan alat berat darurat.</p>
              </div>
              <label style={s.switch}>
                <input
                  type="checkbox"
                  checked={preferences.onCallAvailability}
                  onChange={() => handleTogglePref('onCallAvailability')}
                />
                <span style={s.sliderToggle} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LINGKUP HAK AKSES ROLE */}
      {activeTab === 'akses' && (
        <div style={s.panelCard}>
          <div style={s.panelHeader}>
            <div>
              <h3 style={s.panelTitle}>Matriks Otorisasi & Hak Akses Akun</h3>
              <p style={s.panelSub}>Hak akses Anda ditentukan berdasarkan prinsip pemisahan tugas (*Separation of Duties*) standar industri.</p>
            </div>
          </div>

          <div style={s.roleDetailGrid}>
            <div style={s.roleInfoBox}>
              <span style={s.roleInfoLabel}>PERAN SAAT INI</span>
              <h2 style={{ ...s.roleInfoTitle, color: currentRoleStyle.text }}>
                {user?.role || 'Staff Member'}
              </h2>
              <p style={s.roleInfoDesc}>
                {user?.role === 'Manager' && 'Memiliki otorisasi penuh untuk menyetujui penawaran harga, validasi mutasi DP, approval master unit, dan inspeksi audit trail realtime.'}
                {user?.role === 'Sales' && 'Bertanggung jawab atas kalkulasi penawaran harga OTR, diskon volume, pengajuan dokumen RFQ, dan verifikasi awal bukti transfer DP.'}
                {user?.role === 'Operasional' && 'Bertanggung jawab atas inspeksi fisik PDI 6 titik vital, penerbitan surat jalan armada logistik, dan serah terima unit di site proyek.'}
                {user?.role === 'Customer' && 'Dapat mengajukan penawaran harga mandiri, memantau simulasi rekomendasi SPK SAW, dan melacak pesanan unit.'}
              </p>
            </div>

            <div style={s.privilegeCard}>
              <span style={s.privilegeTitle}>DAFTAR HAK AKSES AKTIF:</span>
              <ul style={s.privilegeList}>
                <li style={s.privilegeItem}>
                  <CheckCircle2 size={16} style={{ color: '#15803d' }} />
                  <span>Akses Dashboard Analytics & KPI Realtime</span>
                </li>
                <li style={s.privilegeItem}>
                  <CheckCircle2 size={16} style={{ color: '#15803d' }} />
                  <span>Eksplorasi Katalog Unit & Simulasi Rekomendasi SAW</span>
                </li>
                <li style={s.privilegeItem}>
                  <CheckCircle2 size={16} style={{ color: '#15803d' }} />
                  <span>Manajemen Dokumen RFQ & Pelacakan Siklus Pesanan</span>
                </li>
                {(user?.role === 'Manager' || user?.role === 'Sales') && (
                  <li style={s.privilegeItem}>
                    <CheckCircle2 size={16} style={{ color: '#15803d' }} />
                    <span>Pengelolaan Master Data Unit Excavator (Tambah & Edit)</span>
                  </li>
                )}
                {user?.role === 'Manager' && (
                  <li style={s.privilegeItem}>
                    <CheckCircle2 size={16} style={{ color: '#15803d' }} />
                    <span>Otorisasi / Approval Penawaran Harga & Mutasi DP</span>
                  </li>
                )}
                {(user?.role === 'Manager' || user?.role === 'Operasional') && (
                  <li style={s.privilegeItem}>
                    <CheckCircle2 size={16} style={{ color: '#15803d' }} />
                    <span>Live Audit Log Aktivitas & Pemantauan Keamanan Sistem</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const s = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    paddingBottom: '3rem',
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1.5px solid #e2e8f0',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 14px -2px rgba(13, 20, 30, 0.04)',
  },
  heroTopAccent: {
    height: '5px',
    backgroundColor: '#74c02c',
  },
  heroContent: {
    padding: '1.75rem 2rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1.75rem',
    flexWrap: 'wrap',
  },
  avatarBox: {
    width: '74px',
    height: '74px',
    borderRadius: '16px',
    backgroundColor: '#0d141e',
    border: '2.5px solid #74c02c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 16px rgba(116, 192, 44, 0.25)',
    flexShrink: 0,
  },
  avatarLetter: {
    fontSize: '2.2rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#74c02c',
    lineHeight: 1,
  },
  heroMeta: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  heroTagRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    flexWrap: 'wrap',
    marginBottom: '0.2rem',
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    letterSpacing: '0.5px',
  },
  nipBadge: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '0.2rem 0.55rem',
    borderRadius: '5px',
    fontSize: '0.7rem',
    fontFamily: 'monospace',
    fontWeight: '700',
    border: '1px solid #e2e8f0',
  },
  onlineBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.72rem',
    color: '#15803d',
    fontWeight: '700',
  },
  onlineDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#74c02c',
  },
  heroName: {
    margin: 0,
    fontSize: '1.45rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#0d141e',
    letterSpacing: '-0.03em',
  },
  heroJobTitle: {
    margin: 0,
    fontSize: '0.88rem',
    color: '#64748b',
    fontWeight: '600',
  },
  heroQuickDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginTop: '0.6rem',
    flexWrap: 'wrap',
    fontSize: '0.8rem',
    color: '#334155',
    fontWeight: '600',
  },
  heroDetailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  tabBar: {
    display: 'flex',
    gap: '0.65rem',
    flexWrap: 'wrap',
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.65rem 1.25rem',
    borderRadius: '10px',
    border: '1.5px solid',
    cursor: 'pointer',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.86rem',
    transition: 'all 0.15s ease',
  },
  panelCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1.5px solid #e2e8f0',
    padding: '1.75rem 2rem',
    boxShadow: '0 2px 8px rgba(13, 20, 30, 0.03)',
  },
  panelHeader: {
    borderBottom: '1.5px solid #f1f5f9',
    paddingBottom: '1rem',
    marginBottom: '1.5rem',
  },
  panelTitle: {
    margin: '0 0 0.25rem 0',
    fontSize: '1.2rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#0d141e',
    letterSpacing: '-0.02em',
  },
  panelSub: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#64748b',
  },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#ecfccb',
    color: '#15803d',
    border: '1px solid #d9f99d',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.86rem',
    fontWeight: '700',
    marginBottom: '1.25rem',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.86rem',
    fontWeight: '700',
    marginBottom: '1.25rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  formGrid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '0.4rem',
  },
  req: { color: '#dc2626' },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: '#94a3b8',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '0.7rem 0.85rem 0.7rem 2.4rem',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '0.88rem',
    outline: 'none',
    color: '#0d141e',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  inputHelp: {
    fontSize: '0.72rem',
    color: '#94a3b8',
    marginTop: '0.25rem',
  },
  eyeBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  criteriaBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.85rem 1rem',
  },
  criteriaTitle: {
    display: 'block',
    fontSize: '0.68rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: '1px',
    marginBottom: '0.45rem',
  },
  criteriaGrid: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  criteriaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.8rem',
    fontWeight: '700',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: '0.5rem',
  },
  btnSavePrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.8rem 1.6rem',
    backgroundColor: '#0d141e',
    color: '#74c02c',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.9rem',
    boxShadow: '0 4px 14px rgba(13, 20, 30, 0.25)',
  },
  prefList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  prefItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.15rem 1.25rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    gap: '1rem',
  },
  prefInfo: {
    flex: 1,
  },
  switch: {
    position: 'relative',
    display: 'inline-block',
    width: '46px',
    height: '24px',
    flexShrink: 0,
  },
  sliderToggle: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#cbd5e1',
    borderRadius: '24px',
    transition: '0.2s',
  },
  roleDetailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  roleInfoBox: {
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1.5px solid #e2e8f0',
  },
  roleInfoLabel: {
    fontSize: '0.68rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: '1.2px',
  },
  roleInfoTitle: {
    margin: '0.35rem 0 0.6rem',
    fontSize: '1.4rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
  },
  roleInfoDesc: {
    margin: 0,
    fontSize: '0.86rem',
    color: '#475569',
    lineHeight: '1.6',
  },
  privilegeCard: {
    padding: '1.5rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1.5px solid #e2e8f0',
  },
  privilegeTitle: {
    display: 'block',
    fontSize: '0.68rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: '1.2px',
    marginBottom: '0.85rem',
  },
  privilegeList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  privilegeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.86rem',
    fontWeight: '700',
    color: '#1e293b',
  },
};

export default ProfileSettings;
