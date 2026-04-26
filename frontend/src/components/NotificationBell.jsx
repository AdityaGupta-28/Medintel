import React, { useState, useRef, useEffect } from 'react';
import { Bell, Activity, Calendar, AlertCircle, CheckCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'alert',       title: 'High Risk Alert',   message: 'Patient John Doe shows abnormal heart rate trends. Immediate follow-up recommended.', time: '10m ago', unread: true  },
  { id: 2, type: 'appointment', title: 'New Appointment',    message: 'Jane Smith scheduled a checkup for tomorrow at 10:30 AM.', time: '1h ago',  unread: true  },
  { id: 3, type: 'system',      title: 'System Update',      message: 'MedIntel platform updated to v2.4. New AI insights features available.', time: '3h ago',  unread: true  },
  { id: 4, type: 'appointment', title: 'Appointment Reminder', message: 'Robert Johnson has a follow-up scheduled in 30 minutes.', time: '5h ago',  unread: false },
];

const TYPE_CONFIG = {
  alert:       { icon: AlertCircle, bg: 'bg-red-100',    text: 'text-red-600',     ring: 'ring-red-200'    },
  appointment: { icon: Calendar,    bg: 'bg-blue-100',   text: 'text-blue-600',    ring: 'ring-blue-200'   },
  system:      { icon: Activity,    bg: 'bg-violet-100', text: 'text-violet-600',  ring: 'ring-violet-200' },
};

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, unread: false })));
  const dismiss = (id) => setNotifications(n => n.filter(x => x.id !== id));
  const markRead = (id) => setNotifications(n => n.map(x => x.id === id ? { ...x, unread: false } : x));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm flex items-center justify-center"
      >
        <Bell size={18} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white"
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 w-96 rounded-2xl bg-white shadow-2xl border border-slate-100 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
            </div>

            {/* Notification list */}
            <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="mx-auto text-slate-200 mb-3" size={32} />
                  <p className="text-sm text-slate-400 font-medium">No notifications</p>
                </div>
              ) : (
                notifications.map(n => {
                  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8, height: 0 }}
                      onClick={() => markRead(n.id)}
                      className={`relative flex gap-3 p-4 hover:bg-slate-50 transition-colors cursor-pointer ${n.unread ? 'bg-blue-50/40' : ''}`}
                    >
                      {/* Unread dot */}
                      {n.unread && (
                        <span className="absolute top-4 right-10 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      )}
                      {/* Icon */}
                      <div className={`mt-0.5 flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center ring-4 ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
                        <Icon size={15} />
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className={`text-sm font-semibold leading-tight ${n.unread ? 'text-slate-900' : 'text-slate-600'}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{n.message}</p>
                      </div>
                      {/* Dismiss */}
                      <button
                        onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                        className="absolute top-3 right-3 p-1 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X size={13} />
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-center">
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                View all activity →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
