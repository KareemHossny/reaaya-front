import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/admin/AdminDashboard';
import DoctorDashboard from '../components/doctor/DoctorDashboard';
import PatientDashboard from '../components/patient/PatientDashboard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { user, loading, requiresProfileCompletion } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // إذا كان المستخدم محتاج يكمل البروفايل، ا redirect لصفحة إكمال البروفايل
    if (!loading && requiresProfileCompletion) {
      navigate('/complete-profile', { replace: true });
    }
  }, [loading, requiresProfileCompletion, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="mr-2">{t('loading')}</span>
      </div>
    );
  }

  // إذا كان محتاج يكمل البروفايل، اعرض loading حتى يتم الـ redirect
  if (requiresProfileCompletion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="mr-2">{t('loading')}</span>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'doctor':
        return <DoctorDashboard />;
      case 'patient':
        return <PatientDashboard />;
      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">{t('no_permission')}</h1>
              <p className="text-gray-600 mt-2">{t('no_access_permission')}</p>
            </div>
          </div>
        );
    }
  };

  return renderDashboard();
};

export default Dashboard;