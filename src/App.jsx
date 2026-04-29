import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { MLServiceProvider } from './context/MLServiceContext';

import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HospitalsPage from './pages/HospitalsPage';
import PatientsPage from './pages/PatientsPage';
import PredictPage from './pages/PredictPage';
import PredictionsPage from './pages/PredictionsPage';
import ModelsPage from './pages/ModelsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SchedulerPage from './pages/SchedulerPage';
import ExportPage from './pages/ExportPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MLServiceProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="hospitals" element={<HospitalsPage />} />
              <Route path="patients" element={<PatientsPage />} />
              <Route path="predict" element={<PredictPage />} />
              <Route path="predictions" element={<PredictionsPage />} />
              <Route path="models" element={<ModelsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="scheduler" element={<SchedulerPage />} />
              <Route path="export" element={<ExportPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3500}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            style={{ zIndex: 9999 }}
            toastStyle={{
              background: '#0F172A',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#F1F5F9',
              fontSize: '13px',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            }}
          />
        </MLServiceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
