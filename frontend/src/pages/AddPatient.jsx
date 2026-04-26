import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, AlertCircle, Plus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { patientService } from '../services/api';

const InputField = ({ label, id, error, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <input
      id={id}
      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
        error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
      }`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const AddPatient = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', age: '', gender: 'Male', contact: '',
    address: '', bloodGroup: '', status: 'Stable',
    medicalHistory: [], allergies: [],
  });
  const [newHistory, setNewHistory] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    if (!form.age || isNaN(form.age) || form.age < 0 || form.age > 130) e.age = 'Enter a valid age (0–130).';
    if (!form.contact.trim()) e.contact = 'Contact number is required.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(ev => ({ ...ev, [name]: undefined }));
  };

  const addHistory = () => {
    if (!newHistory.trim()) return;
    setForm(f => ({ ...f, medicalHistory: [...f.medicalHistory, newHistory.trim()] }));
    setNewHistory('');
  };
  const removeHistory = (i) => setForm(f => ({ ...f, medicalHistory: f.medicalHistory.filter((_, idx) => idx !== i) }));

  const addAllergy = () => {
    if (!newAllergy.trim()) return;
    setForm(f => ({ ...f, allergies: [...f.allergies, newAllergy.trim()] }));
    setNewAllergy('');
  };
  const removeAllergy = (i) => setForm(f => ({ ...f, allergies: f.allergies.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await patientService.create({ ...form, age: Number(form.age) });
      navigate('/patients');
    } catch {
      setErrors({ submit: 'Failed to save patient. Please check connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 h-screen overflow-y-auto bg-slate-50">
      <div className="mb-6">
        <Link to="/patients" className="inline-flex items-center text-slate-500 hover:text-primary-600 mb-4 transition-colors text-sm">
          <ArrowLeft size={16} className="mr-2" /> Back to Patients
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Add New Patient</h1>
        <p className="text-slate-500 mt-0.5 text-sm">Enter patient details to create a new medical record</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl bg-white rounded-2xl shadow-sm border border-slate-100 p-8"
      >
        {errors.submit && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2">
            <AlertCircle size={16} /> {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Full Name *" id="name" name="name" type="text" placeholder="John Doe" value={form.name} onChange={handleChange} error={errors.name} />
              <InputField label="Contact Number *" id="contact" name="contact" type="tel" placeholder="+1 234-567-8900" value={form.contact} onChange={handleChange} error={errors.contact} />
              <InputField label="Age *" id="age" name="age" type="number" min="0" max="130" placeholder="45" value={form.age} onChange={handleChange} error={errors.age} />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <InputField label="Address" id="address" name="address" type="text" placeholder="123 Medical Way, City" value={form.address} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Medical Info */}
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Medical Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Blood Group</label>
                <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option value="">Select...</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                <select name="status" value={form.status} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option>Stable</option><option>Review</option><option>Critical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Medical History <span className="text-slate-400 font-normal normal-case">(optional)</span></h2>
            <div className="flex gap-2 mb-3">
              <input type="text" placeholder="Add a condition..."
                value={newHistory} onChange={e => setNewHistory(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addHistory(); }}}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              <button type="button" onClick={addHistory}
                className="px-3 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-2">
              {form.medicalHistory.map((h, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg text-sm text-slate-700">
                  <span className="flex-1">{h}</span>
                  <button type="button" onClick={() => removeHistory(i)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Allergies <span className="text-slate-400 font-normal normal-case">(optional)</span></h2>
            <div className="flex gap-2 mb-3">
              <input type="text" placeholder="Add an allergy..."
                value={newAllergy} onChange={e => setNewAllergy(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAllergy(); }}}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              <button type="button" onClick={addAllergy}
                className="px-3 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.allergies.map((a, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm border border-red-100">
                  {a}
                  <button type="button" onClick={() => removeAllergy(i)} className="hover:text-red-900 transition-colors"><X size={12} /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => navigate('/patients')}
              className="px-5 py-2 rounded-xl text-slate-600 font-medium hover:bg-slate-50 border border-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? 'Saving...' : 'Save Patient'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddPatient;
