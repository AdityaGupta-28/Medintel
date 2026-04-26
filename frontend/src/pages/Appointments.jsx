import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Calendar as CalendarIcon, Clock,
  CheckCircle2, XCircle, Clock3, ChevronRight, Loader2, Stethoscope,
} from 'lucide-react';
import { appointmentService } from '../services/api';

const DEMO_APPOINTMENTS = [
  { id: 1, patient: 'Rohan Verma',      doctor: 'Dr. Ananya Sharma', date: '2026-04-26', time: '09:00', status: 'Scheduled', type: 'Follow-up',    avatar: 'R' },
  { id: 2, patient: 'Neha Kulkarni',    doctor: 'Dr. Vikram Rao',    date: '2026-04-26', time: '10:30', status: 'Completed', type: 'Consultation', avatar: 'N' },
  { id: 3, patient: 'Suresh Menon',     doctor: 'Dr. Meera Iyer',    date: '2026-04-26', time: '11:15', status: 'Cancelled', type: 'Review',       avatar: 'S' },
  { id: 4, patient: 'Kavya Reddy',      doctor: 'Dr. Ananya Sharma', date: '2026-04-27', time: '14:00', status: 'Scheduled', type: 'Therapy',      avatar: 'K' },
  { id: 5, patient: 'Harpreet Singh',   doctor: 'Dr. Vikram Rao',    date: '2026-04-27', time: '15:30', status: 'Scheduled', type: 'Checkup',      avatar: 'H' },
  { id: 6, patient: 'Aditi Chatterjee', doctor: 'Dr. Meera Iyer',    date: '2026-04-28', time: '09:45', status: 'Scheduled', type: 'Consultation', avatar: 'A' },
  { id: 7, patient: 'Ibrahim Khan',     doctor: 'Dr. Ananya Sharma', date: '2026-04-28', time: '11:00', status: 'Completed', type: 'Review',       avatar: 'I' },
];

const STATUS_CONFIG = {
  Scheduled: { icon: Clock3,       cls: 'bg-blue-100   text-blue-700',   dot: 'bg-blue-500'   },
  Completed: { icon: CheckCircle2, cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  Cancelled: { icon: XCircle,      cls: 'bg-red-100    text-red-700',    dot: 'bg-red-500'    },
};

const TYPE_COLORS = {
  Checkup:      'bg-sky-50     text-sky-700',
  Consultation: 'bg-violet-50  text-violet-700',
  'Follow-up':  'bg-amber-50   text-amber-700',
  Therapy:      'bg-teal-50    text-teal-700',
};

const FILTERS = ['All', 'Scheduled', 'Completed', 'Cancelled'];

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Scheduled;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
};

const QuickStat = ({ label, value, color }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-sm text-slate-500">{label}</span>
    </div>
    <span className="text-sm font-bold text-slate-800">{value}</span>
  </div>
);

const Appointments = () => {
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('All');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const { data } = await appointmentService.getAll();
        const mapped = (Array.isArray(data) ? data : []).map((a) => {
          const patientName = a?.patientId?.name || 'Unknown Patient';
          const doctorName = a?.doctorId?.name || 'Unknown Doctor';
          const dateObj = a?.date ? new Date(a.date) : new Date();
          const reason = a?.reason || 'Consultation';

          return {
            id: a._id,
            patient: patientName,
            doctor: doctorName,
            date: dateObj.toISOString().slice(0, 10),
            time: a.timeSlot || `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`,
            status: a.status || 'Scheduled',
            type: reason,
            avatar: patientName.charAt(0).toUpperCase(),
          };
        });
        setAppointments(mapped);
        setUsingDemo(false);
      } catch {
        setAppointments(DEMO_APPOINTMENTS);
        setUsingDemo(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const filtered = appointments.filter((a) => {
    const matchSearch = a.patient.toLowerCase().includes(search.toLowerCase()) ||
                        a.doctor.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || a.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = useMemo(() => ({
    all:       appointments.length,
    scheduled: appointments.filter((a) => a.status === 'Scheduled').length,
    completed: appointments.filter((a) => a.status === 'Completed').length,
    cancelled: appointments.filter((a) => a.status === 'Cancelled').length,
  }), [appointments]);

  const todayKey = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex-1 p-8 h-screen overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
          <p className="text-slate-500 mt-0.5">
            Manage doctor schedules and patient bookings
            {usingDemo && (
              <span className="ml-2 text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                Demo Mode
              </span>
            )}
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200 font-medium text-sm">
          <Plus size={18} />
          New Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Sidebar Stats ── */}
        <div className="space-y-5">
          {/* Today's overview */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon size={16} className="text-blue-600" />
              <h3 className="font-bold text-slate-800 text-sm">Today's Overview</h3>
            </div>
            <QuickStat label="Total"     value={counts.all}       color="bg-slate-400" />
            <QuickStat label="Scheduled" value={counts.scheduled} color="bg-blue-500"  />
            <QuickStat label="Completed" value={counts.completed} color="bg-emerald-500" />
            <QuickStat label="Cancelled" value={counts.cancelled} color="bg-red-500"   />
          </div>

          {/* Upcoming (mini-list) */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Upcoming Today</h3>
            <div className="space-y-3">
              {(appointments.filter((a) => a.status === 'Scheduled' && a.date === todayKey)).map((a) => (
                <div key={a.id} className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {a.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{a.patient}</p>
                    <p className="text-xs text-slate-400">{a.time}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                </div>
              ))}
              {appointments.filter((a) => a.status === 'Scheduled' && a.date === todayKey).length === 0 && (
                <p className="text-xs text-slate-400">No scheduled appointments for today.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Main Table ── */}
        <div className="col-span-1 lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Toolbar */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              {/* Filter tabs */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      filter === f
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {f}
                    {f === 'All' && (
                      <span className="ml-1.5 text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">
                        {counts.all}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Search patient or doctor..."
                  className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all w-56"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-3 font-medium">Patient</th>
                    <th className="px-6 py-3 font-medium">Date & Time</th>
                    <th className="px-6 py-3 font-medium">Doctor</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-slate-400 text-sm">
                          <Loader2 size={18} className="animate-spin mx-auto mb-2" />
                          Loading appointments...
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-slate-400 text-sm">
                          No appointments match your criteria.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((apt, i) => (
                        <motion.tr
                          key={apt.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                                {apt.avatar}
                              </div>
                              <span className="font-semibold text-slate-800 text-sm">{apt.patient}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                <CalendarIcon size={13} className="text-slate-400" /> {apt.date}
                              </span>
                              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                                <Clock size={12} className="text-slate-300" /> {apt.time}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Stethoscope size={13} className="text-slate-400" />
                              {apt.doctor}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${TYPE_COLORS[apt.type] || 'bg-slate-100 text-slate-600'}`}>
                              {apt.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={apt.status} />
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-400">
                Showing <span className="font-medium text-slate-600">{filtered.length}</span> of{' '}
                <span className="font-medium text-slate-600">{appointments.length}</span> appointments
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
