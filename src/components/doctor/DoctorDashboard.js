import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import DoctorProfile from './DoctorProfile';
import DoctorAppointments from './DoctorAppointments';
import DoctorSchedule from './DoctorSchedule';
import DoctorStats from './DoctorStats';
import { CalendarIcon, ClockIcon, UserIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  
  const isRTL = i18n.language === 'ar';

  const tabs = [
    { id: 'appointments', name: t('appointments'), icon: CalendarIcon },
    { id: 'availability', name: t('availability'), icon: ClockIcon },
    { id: 'profile', name: t('profile'), icon: UserIcon },
    { id: 'stats', name: t('stats'), icon: ChartBarIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* الهيدر */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex flex-col md:flex-row md:justify-between md:items-center py-6 gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary-900">
                {t('doctor_dashboard')}
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                {t('doctor_welcome')} {user?.name}
                {user?.specialization && (
                  <span className="text-primary-600"> - {user.specialization.name}</span>
                )}
              </p>
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <p className="text-xs sm:text-sm text-gray-600">{t('role')}: {t('doctor_role')}</p>
            </div>
          </div>

          {/* التبويبات */}
          <div className={`flex flex-wrap gap-2 md:gap-1 md:space-x-1 md:space-x-reverse mt-4 md:mt-0 overflow-auto ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-600 border-t-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {React.createElement(tab.icon, { className: `w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? 'ml-1 sm:ml-2' : 'mr-1 sm:mr-2'}` })}
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* المحتوى */}
      <div className="max-w-7xl mx-auto py-3 sm:py-6 px-2 sm:px-6 lg:px-8">
        <div className="px-0 md:px-4 py-4 sm:py-6">
          {activeTab === 'appointments' && <DoctorAppointments />}
          {activeTab === 'availability' && <DoctorSchedule />}
          {activeTab === 'profile' && <DoctorProfile />}
          {activeTab === 'stats' && <DoctorStats />}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;