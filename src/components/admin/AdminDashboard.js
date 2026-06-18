import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import UserManagement from './UserManagement';
import SpecializationManagement from './SpecializationManagement';
import AdminStats from './AdminStats';
import { ChartBarIcon, UserGroupIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const isRTL = i18n.language === 'ar';

  const tabs = [
    { id: 'stats', name: t('stats'), icon: ChartBarIcon },
    { id: 'users', name: t('user_management'), icon: UserGroupIcon },
    { id: 'specializations', name: t('specialization_management'), icon: BuildingOfficeIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* الهيدر */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center py-6 gap-4 md:gap-0">
            <div className={isRTL ? "text-right" : "text-left"}>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary-900">
                {t('admin_dashboard')}
              </h1>
              <p className="text-gray-600 mt-1 text-base sm:text-lg">
                {t('welcome')}، {user?.name}
              </p>
            </div>
            <div className={isRTL ? "text-left" : "text-right"}>
              <p className="text-xs sm:text-sm text-gray-600">{t('role')}: {t('admin')}</p>
            </div>
          </div>

          {/* التبويبات */}
          <div className={`flex flex-wrap justify-center md:justify-start gap-2 sm:gap-1 ${isRTL ? 'space-x-reverse' : ''}`}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 sm:px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none
                  ${activeTab === tab.id
                    ? 'bg-white text-primary-600 border-t-2 border-primary-600 shadow'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
                `}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                {React.createElement(tab.icon, { className: `w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}` })}
                <span className="truncate">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* المحتوى */}
      <div className="max-w-7xl mx-auto py-4 px-2 sm:py-6 sm:px-6 lg:px-8">
        <div className="px-0 sm:px-4 py-4 sm:py-6">
          <div className="rounded-xl bg-white shadow-sm p-3 sm:p-6 min-h-[350px]">
            {activeTab === 'stats' && <AdminStats />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'specializations' && <SpecializationManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;