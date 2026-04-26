import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Calendar, Activity, TrendingUp,
  AlertTriangle, CheckCircle, Clock, Loader2,
  ArrowRight, UserCheck,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Link } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';
import { analyticsService } from '../services/api';

/* ─── Demo fallback data (shown when backend is unreachable) ─── */
const DEMO = {
  totalPatients: 12,
  totalAppointments: 34,
  todayAppointments: 5,
  statusBreakdown: { stable: 7, review: 3, critical: 2 },
  weeklyData: [
    { name: 'Mon', appointments: 4 },
    { name: 'Tue', appointments: 7 },
    { name: 'Wed', appointments: 5 },
    { name: 'Thu', appointments: 9 },
    { name: 'Fri', appointments: 6 },
    { name: 'Sat', appointments: 2 },
    { name: 'Sun', appointments: 1 },
  ],
  recentPatients: [
    { _id: '1', name: 'John Doe',      age: 45, gender: 'Male',   status: 'Stable',   createdAt: new Date().toISOString() },
    { _id: '2', name: 'Jane Smith',    age: 32, gender: 'Female', status: 'Review',   createdAt: new Date().toISOString() },
    { _id: '3', name: 'Robert Johnson',age: 58, gender: 'Male',   status: 'Critical', createdAt: new Date().toISOString() },
    { _id: '4', name: 'Emily Davis',   age: 28, gender: 'Female', status: 'Stable',   createdAt: new Date().toISOString() },
    { _id: '5', name: 'Michael Wilson',age: 62, gender: 'Male',   status: 'Review',   createdAt: new Date().toISOString() },
  ],
  recentAppointments: [],
};

/* ─── Stat Card ─── */
const StatCard = ({ title, value, icon: Icon, colorClass, sub, loading }) => (
  <motion.div
    whileHover={{ y: -4, boxShadow: '0 12px 24px -4px rgba(0,0,0,0.08)' }}
    transition={{ type: 'spring', stiffness: 300 }}
    className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-100"
  >
    <div className={`flex h-13 w-13 items-center justify-center rounded-2xl p-3 flex-shrink-0 ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
      {loading
        ? <div className="mt-1 h-7 w-16 rounded-lg bg-slate-100 animate-pulse" />
        : <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      }
      {sub && !loading && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </motion.div>
);

/* ─── Status badge ─── */
const STATUS = {
  Stable:   'bg-emerald-100 text-emerald-700',
  Review:   'bg-amber-100   text-amber-700',
  Critical: 'bg-red-100     text-red-700',
};

/* ─── Custom Tooltip for Line Chart ─── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl bg-white shadow-lg border border-slate-100 px-4 py-2.5 text-sm">
        <p className="font-semibold text-slate-700">{label}</p>
        <p className="text-primary-600 font-medium">{payload[0].value} appointments</p>
      </div>
    );
  }
  return null;
};

/* ════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo]   = useState(false);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();
  const displayName = user.name || 'Doctor';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: res } = await analyticsService.getOverview();
        setData(res);
        setIsDemo(false);
      } catch {
        setData(DEMO);
        setIsDemo(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pieData = data ? [
    { name: 'Stable',   value: data.statusBreakdown?.stable   || 0, color: '#10b981' },
    { name: 'Review',   value: data.statusBreakdown?.review   || 0, color: '#f59e0b' },
    { name: 'Critical', value: data.statusBreakdown?.critical || 0, color: '#ef4444' },
  ] : [];

  return (
    <div className="flex-1 p-8 h-screen overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
          <p className="text-slate-500 mt-0.5">
            Welcome back, <span className="font-semibold text-slate-700">{displayName}</span>
            {isDemo && (
              <span className="ml-2 text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                Demo Mode
              </span>
            )}
          </p>
        </div>
        <NotificationBell />
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients" loading={loading}
          value={data?.totalPatients?.toLocaleString() ?? '—'}
          icon={Users} colorClass="bg-blue-100 text-blue-600"
          sub="Registered in system"
        />
        <StatCard
          title="Today's Appointments" loading={loading}
          value={data?.todayAppointments ?? '—'}
          icon={Calendar} colorClass="bg-emerald-100 text-emerald-600"
          sub={new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
        />
        <StatCard
          title="Critical Patients" loading={loading}
          value={data?.statusBreakdown?.critical ?? '—'}
          icon={AlertTriangle} colorClass="bg-red-100 text-red-600"
          sub="Require immediate attention"
        />
        <StatCard
          title="Total Appointments" loading={loading}
          value={data?.totalAppointments?.toLocaleString() ?? '—'}
          icon={TrendingUp} colorClass="bg-purple-100 text-purple-600"
          sub="All time"
        />
      </div>

      {/* Charts Row */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Weekly Line Chart */}
        <div className="col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-800">Appointments — Last 7 Days</h3>
            <span className="text-xs text-slate-400 font-medium">Daily count</span>
          </div>
          {loading ? (
            <div className="h-56 flex items-center justify-center">
              <Loader2 className="animate-spin text-primary-400" size={28} />
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.weeklyData || []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone" dataKey="appointments"
                    stroke="#0ea5e9" strokeWidth={3}
                    dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#0ea5e9' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pie Chart — Patient Status */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-800 mb-5">Patient Status</h3>
          {loading ? (
            <div className="h-56 flex items-center justify-center">
              <Loader2 className="animate-spin text-primary-400" size={28} />
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData} cx="50%" cy="45%"
                    innerRadius={55} outerRadius={80}
                    paddingAngle={3} dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
                  />
                  <Tooltip formatter={(val) => [`${val} patients`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Breakdown numbers */}
          {!loading && data && (
            <div className="mt-2 space-y-1.5">
              {[
                { label: 'Stable',   val: data.statusBreakdown?.stable,   cls: 'bg-emerald-500' },
                { label: 'Review',   val: data.statusBreakdown?.review,   cls: 'bg-amber-400' },
                { label: 'Critical', val: data.statusBreakdown?.critical, cls: 'bg-red-500' },
              ].map(({ label, val, cls }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cls}`} />
                    <span className="text-slate-600">{label}</span>
                  </div>
                  <span className="font-semibold text-slate-700">{val ?? 0}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Patients Table */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">Recently Added Patients</h3>
          <Link to="/patients" className="flex items-center gap-1 text-sm text-primary-600 hover:underline font-medium">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary-400" size={28} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Patient</th>
                  <th className="px-6 py-3 font-medium">Age / Gender</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Registered</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(data?.recentPatients || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">
                      No patients yet. <Link to="/patients/new" className="text-primary-600 hover:underline">Add the first one →</Link>
                    </td>
                  </tr>
                ) : (
                  (data?.recentPatients || []).map((p, i) => (
                    <motion.tr
                      key={p._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {p.name.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-800 text-sm">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-500 text-sm">{p.age} / {p.gender}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS[p.status] || STATUS.Stable}`}>
                          {p.status || 'Stable'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-400 text-sm">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-6 py-3.5">
                        <Link
                          to={`/patients/${p._id}`}
                          className="text-xs font-medium text-primary-600 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
