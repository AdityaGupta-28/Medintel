import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Edit2, Trash2, Eye, ChevronLeft, ChevronRight,
  AlertTriangle, X, CheckCircle, Loader2, MoreVertical,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { patientService } from '../services/api';

/* ─────────────────────────────────────────────── helpers ── */
const STATUS_STYLES = {
  Stable:   'bg-emerald-100 text-emerald-800',
  Review:   'bg-amber-100   text-amber-800',
  Critical: 'bg-red-100     text-red-800',
};

const LIMIT_OPTIONS = [5, 10, 15, 20];

/* ─────────────────────────────────── Delete Confirm Modal ── */
const DeleteModal = ({ patient, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle size={20} className="text-red-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">Delete Patient</h2>
      </div>
      <p className="text-slate-500 mb-6 leading-relaxed">
        Are you sure you want to delete <span className="font-semibold text-slate-700">{patient?.name}</span>?
        This action cannot be undone.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Delete
        </button>
      </div>
    </motion.div>
  </div>
);

/* ──────────────────────────────────────── Toast Notification ── */
const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 40 }}
    className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white font-medium ${
      type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
    }`}
  >
    {type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
    {message}
    <button onClick={onClose} className="ml-2 hover:opacity-75"><X size={16} /></button>
  </motion.div>
);

/* ─────────────────────────────── Actions Dropdown ── */
const ActionsMenu = ({ patient, onView, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
      >
        <MoreVertical size={18} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 z-30 overflow-hidden"
          >
            <button
              onClick={() => { onView(patient); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Eye size={15} className="text-primary-500" /> View Details
            </button>
            <button
              onClick={() => { onEdit(patient); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Edit2 size={15} className="text-blue-500" /> Edit Patient
            </button>
            <button
              onClick={() => { onDelete(patient); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={15} /> Delete Patient
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────────────────────────── Main Page ── */
const PatientsList = () => {
  const navigate = useNavigate();

  // State
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(searchTerm); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const { data } = await patientService.getAll({ page, limit, search: debouncedSearch });
        setPatients(data.patients);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (err) {
        showToast('Failed to load patients. Using demo data.', 'error');
        // Fallback demo data
        const demo = [
          { _id: '1', name: 'John Doe',       age: 45, gender: 'Male',   contact: '+1 234-567-8901', status: 'Stable',   createdAt: '2026-04-20' },
          { _id: '2', name: 'Jane Smith',      age: 32, gender: 'Female', contact: '+1 234-567-8902', status: 'Review',   createdAt: '2026-04-22' },
          { _id: '3', name: 'Robert Johnson',  age: 58, gender: 'Male',   contact: '+1 234-567-8903', status: 'Critical', createdAt: '2026-04-15' },
          { _id: '4', name: 'Emily Davis',     age: 28, gender: 'Female', contact: '+1 234-567-8904', status: 'Stable',   createdAt: '2026-04-24' },
          { _id: '5', name: 'Michael Wilson',  age: 62, gender: 'Male',   contact: '+1 234-567-8905', status: 'Review',   createdAt: '2026-04-10' },
          { _id: '6', name: 'Sarah Connor',    age: 39, gender: 'Female', contact: '+1 234-567-8906', status: 'Stable',   createdAt: '2026-04-18' },
          { _id: '7', name: 'David Martinez',  age: 51, gender: 'Male',   contact: '+1 234-567-8907', status: 'Critical', createdAt: '2026-04-12' },
          { _id: '8', name: 'Linda Brown',     age: 44, gender: 'Female', contact: '+1 234-567-8908', status: 'Stable',   createdAt: '2026-04-09' },
          { _id: '9', name: 'James Taylor',    age: 67, gender: 'Male',   contact: '+1 234-567-8909', status: 'Review',   createdAt: '2026-04-05' },
          { _id: '10', name: 'Olivia Lee',     age: 29, gender: 'Female', contact: '+1 234-567-8910', status: 'Stable',   createdAt: '2026-04-01' },
          { _id: '11', name: 'William Clark',  age: 73, gender: 'Male',   contact: '+1 234-567-8911', status: 'Critical', createdAt: '2026-03-28' },
          { _id: '12', name: 'Ava Thompson',   age: 35, gender: 'Female', contact: '+1 234-567-8912', status: 'Stable',   createdAt: '2026-03-25' },
        ];
        const filtered = demo.filter(p =>
          p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
        const start = (page - 1) * limit;
        const sliced = filtered.slice(start, start + limit);
        setPatients(sliced);
        setTotal(filtered.length);
        setTotalPages(Math.max(1, Math.ceil(filtered.length / limit)));
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [page, limit, debouncedSearch]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleView = (patient) => navigate(`/patients/${patient._id}`);
  const handleEdit = (patient) => navigate(`/patients/${patient._id}/edit`);
  const handleDeleteClick = (patient) => setDeleteTarget(patient);

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await patientService.delete(deleteTarget._id);
      showToast(`${deleteTarget.name} has been deleted.`, 'success');
      setDeleteTarget(null);
      // Refresh: go back a page if last item on page
      if (patients.length === 1 && page > 1) setPage(p => p - 1);
      else {
        // Re-trigger fetch
        setPage(p => { const same = p; return same === 1 ? 1 : p; });
        setDebouncedSearch(s => s);
      }
    } catch {
      showToast('Failed to delete patient. Please try again.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex-1 p-8 h-screen overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patients Directory</h1>
          <p className="text-slate-500 mt-0.5">
            Manage your patient records and histories
            {total > 0 && <span className="ml-2 text-primary-600 font-medium">({total} total)</span>}
          </p>
        </div>
        <Link
          to="/patients/new"
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-white hover:bg-primary-700 transition-colors shadow-sm font-medium"
        >
          <Plus size={20} />
          <span>Add New Patient</span>
        </Link>
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        {/* Search + Limit Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search patients by name..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="whitespace-nowrap">Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              {LIMIT_OPTIONS.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-medium">#</th>
                <th className="px-6 py-3 font-medium">Patient Name</th>
                <th className="px-6 py-3 font-medium">Age / Gender</th>
                <th className="px-6 py-3 font-medium">Contact</th>
                <th className="px-6 py-3 font-medium">Registered</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Loader2 className="mx-auto animate-spin text-primary-500 mb-2" size={28} />
                    <p className="text-slate-500 text-sm">Loading patients...</p>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <p className="text-slate-400 font-medium">No patients found.</p>
                    {debouncedSearch && (
                      <p className="text-slate-400 text-sm mt-1">
                        Try adjusting your search term.
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                patients.map((patient, index) => (
                  <motion.tr
                    key={patient._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4 text-slate-400 text-sm">{startItem + index}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                          {patient.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800">{patient.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{patient.age} yrs / {patient.gender}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{patient.contact}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {patient.createdAt
                        ? new Date(patient.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[patient.status] || STATUS_STYLES.Stable}`}>
                        {patient.status || 'Stable'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        {/* Inline action buttons */}
                        <button
                          title="View Details"
                          onClick={() => handleView(patient)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          title="Edit Patient"
                          onClick={() => handleEdit(patient)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          title="Delete Patient"
                          onClick={() => handleDeleteClick(patient)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                        {/* Dropdown menu */}
                        <ActionsMenu
                          patient={patient}
                          onView={handleView}
                          onEdit={handleEdit}
                          onDelete={handleDeleteClick}
                        />
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && total > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-700">{startItem}–{endItem}</span> of{' '}
              <span className="font-medium text-slate-700">{total}</span> patients
            </p>
            <div className="flex items-center gap-2">
              {/* Previous */}
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`dots-${i}`} className="px-2 text-slate-400 text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                          page === p
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
              </div>

              {/* Next */}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            patient={deleteTarget}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
            loading={deleteLoading}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientsList;
