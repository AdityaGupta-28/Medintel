import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientsList from './pages/PatientsList';
import AddPatient from './pages/AddPatient';
import PatientDetail from './pages/PatientDetail';
import EditPatient from './pages/EditPatient';
import Appointments from './pages/Appointments';
import AIInsights from './pages/AIInsights';
import Settings from './pages/Settings';
import Layout from './components/Layout';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Protected Routes using Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard"           element={<Dashboard />} />
          <Route path="/patients"            element={<PatientsList />} />
          <Route path="/patients/new"        element={<AddPatient />} />
          <Route path="/patients/:id"        element={<PatientDetail />} />
          <Route path="/patients/:id/edit"   element={<EditPatient />} />
          <Route path="/appointments"        element={<Appointments />} />
          <Route path="/ai-insights"         element={<AIInsights />} />
          <Route path="/settings"            element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
