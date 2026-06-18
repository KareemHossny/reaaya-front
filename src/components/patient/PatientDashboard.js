import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DoctorList from './DoctorList';
import PatientAppointments from './PatientAppointments';
import PatientStats from './PatientStats';
import { UserIcon, CalendarIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('doctors');
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const tabs = [
    { id: 'doctors', name: t('doctors'), icon: UserIcon },
    { id: 'appointments', name: t('my_appointments'), icon: CalendarIcon },
    { id: 'stats', name: t('my_statistics'), icon: ChartBarIcon },
  ];

  const isRTL = i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-gray-50 rtl-support">
      {/* الهيدر */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Responsive flex direction for header */}
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary-900">
                {t('patient_dashboard')}
              </h1>
              <p className="text-gray-600 mt-1 text-base sm:text-lg">
                {t('patient_welcome')} {user?.name}
              </p>
            </div>
            <div className={`w-full sm:w-auto ${isRTL ? 'text-left' : 'text-right'}`}>
              <p className="text-xs sm:text-sm text-gray-600">{t('patient_role')}</p>
            </div>
          </div>
          
          {/* Responsive tabs */}
          <div className={`flex flex-wrap sm:flex-nowrap ${isRTL ? 'space-x-reverse' : 'space-x'} space-x-1 mb-2`}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center w-full sm:w-auto justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors mb-1 sm:mb-0 focus:outline-none ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-600 border-t-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                } ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                {React.createElement(tab.icon, { 
                  className: `w-5 h-5 ${isRTL ? 'mr-1 sm:mr-2' : 'ml-1 sm:ml-2'}` 
                })}
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* المحتوى */}
      <div className="max-w-7xl mx-auto py-3 sm:py-6 px-2 sm:px-6 lg:px-8">
        <div className="px-0 sm:px-4 py-4 sm:py-6">
          {activeTab === 'doctors' && <DoctorList />}
          {activeTab === 'appointments' && <PatientAppointments />}
          {activeTab === 'stats' && <PatientStats />}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;