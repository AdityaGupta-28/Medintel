const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');
const { indianUsers, indianPatients } = require('./data/seedData');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medintel';

const setDateAtHour = (baseDate, dayOffset, hour, minute) => {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
};

const importData = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    await Appointment.deleteMany();
    await Patient.deleteMany();
    await User.deleteMany();

    const createdUsers = await User.insertMany(indianUsers);
    const doctors = createdUsers.filter((u) => u.role === 'Doctor');
    const createdPatients = await Patient.insertMany(indianPatients);

    const now = new Date();
    const appointmentTemplates = [
      { patientIdx: 0, doctorIdx: 0, dayOffset: -6, hour: 10, minute: 0, status: 'Completed', reason: 'Diabetes follow-up' },
      { patientIdx: 1, doctorIdx: 1, dayOffset: -5, hour: 11, minute: 30, status: 'Completed', reason: 'Migraine management review' },
      { patientIdx: 2, doctorIdx: 2, dayOffset: -4, hour: 9, minute: 45, status: 'Completed', reason: 'Cardiac function check' },
      { patientIdx: 3, doctorIdx: 0, dayOffset: -3, hour: 14, minute: 0, status: 'Completed', reason: 'Asthma inhaler plan update' },
      { patientIdx: 4, doctorIdx: 1, dayOffset: -2, hour: 16, minute: 15, status: 'Cancelled', reason: 'Thyroid report discussion' },
      { patientIdx: 5, doctorIdx: 2, dayOffset: -1, hour: 12, minute: 0, status: 'Completed', reason: 'Routine gynecology review' },
      { patientIdx: 6, doctorIdx: 0, dayOffset: 0, hour: 9, minute: 15, status: 'Scheduled', reason: 'COPD symptom progression' },
      { patientIdx: 7, doctorIdx: 1, dayOffset: 0, hour: 10, minute: 45, status: 'Scheduled', reason: 'Anemia treatment follow-up' },
      { patientIdx: 8, doctorIdx: 2, dayOffset: 0, hour: 13, minute: 0, status: 'Scheduled', reason: 'Sleep quality assessment' },
      { patientIdx: 9, doctorIdx: 0, dayOffset: 1, hour: 11, minute: 0, status: 'Scheduled', reason: 'Nutrition and vitamin plan' },
      { patientIdx: 10, doctorIdx: 1, dayOffset: 1, hour: 15, minute: 30, status: 'Scheduled', reason: 'Heart failure medication review' },
      { patientIdx: 11, doctorIdx: 2, dayOffset: 2, hour: 10, minute: 30, status: 'Scheduled', reason: 'Rheumatoid pain management' },
    ];

    const appointments = appointmentTemplates.map((apt) => {
      const date = setDateAtHour(now, apt.dayOffset, apt.hour, apt.minute);
      const hh = String(apt.hour).padStart(2, '0');
      const mm = String(apt.minute).padStart(2, '0');
      return {
        patientId: createdPatients[apt.patientIdx]._id,
        doctorId: doctors[apt.doctorIdx % doctors.length]._id,
        date,
        timeSlot: `${hh}:${mm}`,
        status: apt.status,
        reason: apt.reason,
      };
    });

    await Appointment.insertMany(appointments);

    console.log('Sample India-focused data imported successfully.');
    console.log(`Users: ${createdUsers.length}, Patients: ${createdPatients.length}, Appointments: ${appointments.length}`);
    process.exit(0);
  } catch (error) {
    console.error(`Seeder error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    await Appointment.deleteMany();
    await Patient.deleteMany();
    await User.deleteMany();
    console.log('All seedable collections cleared.');
    process.exit(0);
  } catch (error) {
    console.error(`Clear error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv.includes('--clear')) {
  destroyData();
} else {
  importData();
}
