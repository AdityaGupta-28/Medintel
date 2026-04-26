import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Bell, Shield, Save, CheckCircle,
  Camera, Mail, Phone, Building2, Lock,
  Eye, EyeOff, Moon, Globe, Loader2,
} from 'lucide-react';

/* ─── Toggle Switch ─── */
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
      checked ? 'bg-blue-600' : 'bg-slate-200'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

/* ─── Setting Row ─── */
const SettingRow = ({ icon: Icon, iconColor, title, desc, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
        <Icon size={17} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

/* ─── Input Field ─── */
const FormInput = ({ label, icon: Icon, ...props }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
    <div className="relative flex items-center">
      {Icon && <Icon size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />}
      <input
        className={`w-full rounded-xl border border-slate-200 ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white`}
        {...props}
      />
    </div>
  </div>
);

const TABS = [
  { id: 'profile',       label: 'Profile',       icon: User   },
  { id: 'notifications', label: 'Notifications',  icon: Bell   },
  { id: 'security',     label: 'Security',        icon: Shield },
];

/* ════════════════════════════════════════════════════ */
const Settings = () => {
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  /* Profile */
  const nameParts = (storedUser.name || 'Dr Smith').split(' ');
  const [firstName, setFirstName] = useState(nameParts[0] || '');
  const [lastName,  setLastName]  = useState(nameParts.slice(1).join(' ') || '');
  const [email,     setEmail]     = useState(storedUser.email || '');
  const [phone,     setPhone]     = useState('');
  const [hospital,  setHospital]  = useState('City General Hospital');

  /* Notifications */
  const [notifs, setNotifs] = useState({
    emailAlerts:    true,
    smsAlerts:      false,
    appointReminders: true,
    criticalAlerts: true,
    weeklyReport:   false,
    systemUpdates:  true,
  });
  const toggleNotif = (key) => setNotifs(n => ({ ...n, [key]: !n[key] }));

  /* Security */
  const [currentPwd,  setCurrentPwd]  = useState('');
  const [newPwd,      setNewPwd]      = useState('');
  const [confirmPwd,  setConfirmPwd]  = useState('');
  const [showPwd,     setShowPwd]     = useState(false);
  const [pwdError,    setPwdError]    = useState('');

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || storedUser.name?.charAt(0) || 'U';

  const handleSave = async () => {
    if (activeTab === 'security') {
      if (newPwd && newPwd !== confirmPwd) { setPwdError("Passwords don't match."); return; }
      if (newPwd && newPwd.length < 8) { setPwdError('Password must be at least 8 characters.'); return; }
      setPwdError('');
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 p-8 h-screen overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-0.5">Manage your account preferences and security</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* ── Tab Sidebar ── */}
        <div className="w-full md:w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={17} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
            >
              {/* ── PROFILE ── */}
              {activeTab === 'profile' && (
                <div>
                  {/* Cover banner */}
                  <div className="h-28 bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 relative">
                    <div className="absolute inset-0 opacity-20"
                      style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                    />
                  </div>

                  <div className="px-8 pb-8">
                    {/* Avatar row */}
                    <div className="flex items-end gap-5 -mt-10 mb-8">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-white flex items-center justify-center text-2xl font-bold shadow-lg border-4 border-white">
                          {initials}
                        </div>
                        <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors">
                          <Camera size={13} />
                        </button>
                      </div>
                      <div className="pb-1">
                        <p className="font-bold text-lg text-slate-900">{storedUser.name || 'Your Name'}</p>
                        <p className="text-sm text-slate-400">{storedUser.role || 'Doctor'}</p>
                      </div>
                    </div>

                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput label="First Name" icon={User}     type="text"  value={firstName}  onChange={e => setFirstName(e.target.value)}  placeholder="John" />
                      <FormInput label="Last Name"  icon={User}     type="text"  value={lastName}   onChange={e => setLastName(e.target.value)}   placeholder="Smith" />
                      <FormInput label="Email"      icon={Mail}     type="email" value={email}      onChange={e => setEmail(e.target.value)}      placeholder="doctor@hospital.com" />
                      <FormInput label="Phone"      icon={Phone}    type="tel"   value={phone}      onChange={e => setPhone(e.target.value)}      placeholder="+1 234-567-8900" />
                      <div className="md:col-span-2">
                        <FormInput label="Hospital / Clinic" icon={Building2} type="text" value={hospital} onChange={e => setHospital(e.target.value)} placeholder="City General Hospital" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Role</label>
                        <input disabled value={storedUser.role || 'Doctor'}
                          className="w-full rounded-xl border border-slate-100 bg-slate-50 pl-4 pr-4 py-2.5 text-sm text-slate-400 outline-none cursor-not-allowed" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeTab === 'notifications' && (
                <div className="p-8 space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Alert Channels</h3>
                    <div className="space-y-3">
                      <SettingRow icon={Mail}  iconColor="bg-blue-50 text-blue-600"    title="Email Notifications"   desc="Daily summaries and appointment reminders"        checked={notifs.emailAlerts}      onChange={() => toggleNotif('emailAlerts')} />
                      <SettingRow icon={Phone} iconColor="bg-emerald-50 text-emerald-600" title="SMS Alerts"         desc="Text messages for critical patient alerts"        checked={notifs.smsAlerts}        onChange={() => toggleNotif('smsAlerts')} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Activity Alerts</h3>
                    <div className="space-y-3">
                      <SettingRow icon={Bell}  iconColor="bg-amber-50 text-amber-600"   title="Appointment Reminders" desc="Notify before upcoming appointments"               checked={notifs.appointReminders} onChange={() => toggleNotif('appointReminders')} />
                      <SettingRow icon={Shield} iconColor="bg-red-50 text-red-600"      title="Critical Patient Alerts" desc="Immediate notification for critical status changes" checked={notifs.criticalAlerts}   onChange={() => toggleNotif('criticalAlerts')} />
                      <SettingRow icon={Globe} iconColor="bg-violet-50 text-violet-600" title="Weekly Reports"        desc="Summary report every Monday morning"              checked={notifs.weeklyReport}     onChange={() => toggleNotif('weeklyReport')} />
                      <SettingRow icon={Bell}  iconColor="bg-slate-100 text-slate-600"  title="System Updates"       desc="Platform maintenance and feature announcements"    checked={notifs.systemUpdates}    onChange={() => toggleNotif('systemUpdates')} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── SECURITY ── */}
              {activeTab === 'security' && (
                <div className="p-8 space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Change Password</h3>
                    {pwdError && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                        <Shield size={15} /> {pwdError}
                      </div>
                    )}
                    <div className="space-y-4 max-w-md">
                      {/* Current Password */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Current Password</label>
                        <div className="relative flex items-center">
                          <Lock size={15} className="absolute left-3.5 text-slate-400" />
                          <input type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                            className="w-full rounded-xl border border-slate-200 pl-10 pr-11 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} />
                          <button type="button" onClick={() => setShowPwd(v => !v)}
                            className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors">
                            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      {/* New Password */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">New Password</label>
                        <div className="relative flex items-center">
                          <Lock size={15} className="absolute left-3.5 text-slate-400" />
                          <input type={showPwd ? 'text' : 'password'} placeholder="Min. 8 characters"
                            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            value={newPwd} onChange={e => { setNewPwd(e.target.value); setPwdError(''); }} />
                        </div>
                      </div>
                      {/* Confirm */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Confirm New Password</label>
                        <div className="relative flex items-center">
                          <Lock size={15} className="absolute left-3.5 text-slate-400" />
                          <input type={showPwd ? 'text' : 'password'} placeholder="Re-enter password"
                            className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 transition-all ${
                              confirmPwd && confirmPwd !== newPwd
                                ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                                : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                            }`}
                            value={confirmPwd} onChange={e => { setConfirmPwd(e.target.value); setPwdError(''); }} />
                        </div>
                        {confirmPwd && confirmPwd !== newPwd && (
                          <p className="mt-1 text-xs text-red-500">Passwords do not match.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Session info */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Active Session</h3>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Current Browser Session</p>
                        <p className="text-xs text-slate-400 mt-0.5">Logged in as {storedUser.email || 'demo user'}</p>
                      </div>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Save Footer ── */}
              <div className="px-8 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                {saved ? (
                  <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                    <CheckCircle size={16} /> Changes saved successfully!
                  </motion.span>
                ) : <span />}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200 disabled:opacity-60"
                >
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Save size={16} /> Save Changes</>}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
