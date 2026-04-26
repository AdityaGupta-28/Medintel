const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    /* ── Counts ── */
    const totalPatients     = await Patient.countDocuments({});
    const totalAppointments = await Appointment.countDocuments({});

    /* ── Today's appointments ── */
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayAppointments = await Appointment.countDocuments({
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    /* ── Patient status breakdown ── */
    const stableCount   = await Patient.countDocuments({ status: 'Stable' });
    const reviewCount   = await Patient.countDocuments({ status: 'Review' });
    const criticalCount = await Patient.countDocuments({ status: 'Critical' });

    /* ── Weekly appointment counts (last 7 days) ── */
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d); start.setHours(0, 0, 0, 0);
      const end   = new Date(d); end.setHours(23, 59, 59, 999);

      const count = await Appointment.countDocuments({ date: { $gte: start, $lte: end } });
      weeklyData.push({ name: days[d.getDay()], appointments: count });
    }

    /* ── Recent patients (last 5 added) ── */
    const recentPatients = await Patient.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name age gender status contact createdAt');

    /* ── Recent appointments (upcoming/today) ── */
    const recentAppointments = await Appointment.find({
      date: { $gte: startOfDay },
    })
      .sort({ date: 1 })
      .limit(5)
      .populate('patientId', 'name')
      .select('patientId date timeSlot status reason');

    res.json({
      totalPatients,
      totalAppointments,
      todayAppointments,
      statusBreakdown: { stable: stableCount, review: reviewCount, critical: criticalCount },
      weeklyData,
      recentPatients,
      recentAppointments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
