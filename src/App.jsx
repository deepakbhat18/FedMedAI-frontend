import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { MLServiceProvider } from './context/MLServiceContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/common/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import CardSkeleton from './components/common/SkeletonLoader';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const HospitalsPage = lazy(() => import('./pages/HospitalsPage'));
const PatientsPage = lazy(() => import('./pages/PatientsPage'));
const PredictPage = lazy(() => import('./pages/PredictPage'));
const PredictionsPage = lazy(() => import('./pages/PredictionsPage'));
const ModelsPage = lazy(() => import('./pages/ModelsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const SchedulerPage = lazy(() => import('./pages/SchedulerPage'));
const ExportPage = lazy(() => import('./pages/ExportPage'));
const RiskTimelinePage = lazy(() => import('./pages/RiskTimelinePage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <MLServiceProvider>
                <Suspense fallback={
                  <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
                  <div className="w-full max-w-md">
                    <CardSkeleton />
                  </div>
                </div>
              }>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="hospitals" element={<HospitalsPage />} />
                    <Route path="patients" element={<PatientsPage />} />
                    <Route path="predict" element={<PredictPage />} />
                    <Route path="predictions" element={<PredictionsPage />} />
                    <Route path="models" element={<ModelsPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="scheduler" element={<SchedulerPage />} />
                    <Route path="export" element={<ExportPage />} />
                    <Route path="timeline/:patientId" element={<RiskTimelinePage />} />
                    <Route path="timeline" element={<RiskTimelinePage />} />
                  </Route>
                  <Route path="*" element={<div className="p-8 text-white text-center">404 - Page Not Found</div>} />
                </Routes>
              </Suspense>

              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                theme="dark"
                toastStyle={{
                  background: '#0d1422',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#eef2ff',
                  fontSize: '13px',
                  borderRadius: '12px',
                }}
              />
            </MLServiceProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);
}

export default App;