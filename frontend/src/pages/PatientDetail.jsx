import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Edit2, Phone, MapPin, Droplets, User,
  Calendar, Activity, AlertCircle, Loader2,
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { patientService } from '../services/api';

const STATUS_STYLES = {
  Stable:   { cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  Review:   { cls: 'bg-amber-100   text-amber-700',   dot: 'bg-amber-500' },
  Critical: { cls: 'bg-red-100     text-red-700',     dot: 'bg-red-500' },
};

const InfoCard = ({ icon: Icon, label, value, iconColor = 'text-primary-500' }) => (
  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
    <div className={`mt-0.5 ${iconColor}`}><Icon size={18} /></div>
    <div>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-slate-800 font-medium mt-0.5">{value || '—'}</p>
    </div>
  </div>
);

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      setLoading(true);
      try {
        const { data } = await patientService.getById(id);
        setPatient(data);
      } catch (err) {
        setError('Failed to load patient data. The patient may not exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center h-screen">
      <div className="text-center">
        <Loader2 className="mx-auto animate-spin text-primary-500 mb-3" size={32} />
        <p className="text-slate-500">Loading patient data...</p>
      </div>
    </div>
  );

  if (error || !patient) return (
    <div className="flex-1 p-8 h-screen overflow-y-auto">
      <Link to="/patients" className="inline-flex items-center text-slate-500 hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> Back to Patients
      </Link>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle size={48} className="text-slate-300 mb-4" />
        <p className="text-slate-500 text-lg font-medium">{error || 'Patient not found'}</p>
        <Link to="/patients" className="mt-4 text-primary-600 hover:underline text-sm">Return to directory</Link>
      </div>
    </div>
  );

  const statusStyle = STATUS_STYLES[patient.status] || STATUS_STYLES.Stable;

  return (
    <div className="flex-1 p-8 h-screen overflow-y-auto bg-slate-50">
      {/* Breadcrumb */}
      <Link to="/patients" className="inline-flex items-center text-slate-500 hover:text-primary-600 mb-6 transition-colors text-sm">
        <ArrowLeft size={16} className="mr-2" /> Back to Patients Directory
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {patient.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{patient.name}</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyle.cls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                  {patient.status || 'Stable'}
                </span>
                <span className="text-sm text-slate-500">{patient.gender} · {patient.age} years old</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/patients/${id}/edit`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors font-medium shadow-sm"
          >
            <Edit2 size={16} /> Edit Patient
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard icon={Phone} label="Contact Number" value={patient.contact} iconColor="text-primary-500" />
          <InfoCard icon={MapPin} label="Address" value={patient.address} iconColor="text-blue-500" />
          <InfoCard icon={Droplets} label="Blood Group" value={patient.bloodGroup} iconColor="text-red-500" />
          <InfoCard icon={User} label="Gender" value={patient.gender} iconColor="text-purple-500" />
          <InfoCard icon={Activity} label="Status" value={patient.status || 'Stable'} iconColor="text-emerald-500" />
          <InfoCard
            icon={Calendar}
            label="Registered"
            value={patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
            iconColor="text-amber-500"
          />
        </div>

        {/* Medical History */}
        {patient.medicalHistory && patient.medicalHistory.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Medical History</h2>
            <ul className="space-y-2">
              {patient.medicalHistory.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Allergies */}
        {patient.allergies && patient.allergies.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Allergies</h2>
            <div className="flex flex-wrap gap-2">
              {patient.allergies.map((a, i) => (
                <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-100">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PatientDetail;
