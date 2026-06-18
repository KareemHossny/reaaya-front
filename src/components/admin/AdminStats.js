import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  UserGroupIcon,
  UserIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

// A11y: focus outline helpers
const focusOutline =
  'focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 focus:outline-none';

const StatCard = ({
  icon: Icon,
  title,
  value,
  description,
  color,
  isRTL,
}) => (
  <div
    className="transition group bg-gradient-to-tr from-primary-50 to-white shadow-lg hover:shadow-2xl rounded-2xl p-4 sm:p-5 md:p-6 flex flex-col gap-2 h-full justify-between"
    tabIndex={0}
    aria-label={`${title}: ${value}`}
  >
    <div className={`flex items-center gap-2 sm:gap-1 justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`
            flex-shrink-0 w-14 h-14 xs:w-16 xs:h-16 bg-gradient-to-br ${color}
            shadow-md rounded-2xl flex items-center justify-center
            group-hover:scale-105 transition duration-200
          `}
      >
        <Icon className="w-7 h-7 xs:w-8 xs:h-8 text-white drop-shadow" />
      </div>
      <div className={`flex-1 ${isRTL ? 'text-right pr-2' : 'text-left pl-2'}`}>
        <p className="text-xs xs:text-sm md:text-base text-gray-500 xs:text-gray-600 font-medium mb-0.5">{title}</p>
        <h3 className="text-xl xs:text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-0.5 tabular-nums leading-tight">
          {value}
        </h3>
        <p className="text-xs sm:text-xs md:text-sm text-gray-400 md:text-gray-500 font-light">{description}</p>
      </div>
    </div>
  </div>
);

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      // Can be extended: use toast for user feedback
      // import toast from 'react-hot-toast';
      // toast.error(t('error_loading_stats'));
      setStats(null);
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const mainStats = stats
    ? [
        {
          title: t('total_patients'),
          value: stats.totalPatients ?? 0,
          color: 'from-cyan-500 to-blue-500',
          icon: UserGroupIcon,
          description: t('total_patients_description'),
        },
        {
          title: t('total_doctors'),
          value: stats.totalDoctors ?? 0,
          color: 'from-green-400 to-green-600',
          icon: UserIcon,
          description: t('total_doctors_description'),
        },
        {
          title: t('total_appointments'),
          value: stats.totalAppointments ?? 0,
          color: 'from-purple-400 to-purple-600',
          icon: CalendarIcon,
          description: t('total_appointments_description'),
        },
        {
          title: t('total_specializations'),
          value: stats.totalSpecializations ?? 0,
          color: 'from-orange-400 to-orange-600',
          icon: BuildingOfficeIcon,
          description: t('total_specializations_description'),
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[220px] py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{t('error_loading_stats')}</p>
        <button
          className={`mt-5 px-4 py-2 bg-primary-500 text-white rounded ${focusOutline}`}
          onClick={fetchStats}
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="px-2 xs:px-3 sm:px-0">
      <h2
        className={`text-xl xs:text-2xl md:text-3xl font-extrabold  mb-4 sm:mb-7 tracking-tight ${isRTL ? 'text-right' : 'text-left'}`}
      >
        {t('system_overview')}
      </h2>
      {/* Main statistics */}
      <div
        className="
        grid 
        grid-cols-1
        xs:grid-cols-2
        md:grid-cols-4
        gap-3
        xs:gap-4
        md:gap-5
        lg:gap-7
        mb-5
        sm:mb-8
        "
      >
        {mainStats.map((stat, i) => (
          <StatCard
            key={stat.title}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            color={stat.color}
            isRTL={isRTL}
          />
        ))}
      </div>

      <div
        className="
        grid
        grid-cols-1
        gap-5
        xl:gap-8
        xl:grid-cols-3
        items-stretch
        "
      >
        {/* Recent Appointments */}
        <section
          className="
          xl:col-span-2 
          order-2 
          xl:order-1
          flex flex-col
          "
        >
          <div className="bg-white rounded-2xl shadow-lg p-4 xs:p-5 sm:p-6 xl:p-7 h-full flex flex-col min-h-[290px]">
            <h3
              className={`text-base xs:text-lg md:text-xl font-semibold text-primary-900 mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <CalendarIcon className={`w-5 h-5 text-primary-500 ${isRTL ? 'ml-1' : 'mr-1'}`} />
              {t('recent_appointments')}
            </h3>
            <div className="flex-1 min-h-[80px]">
              <ul className="space-y-3 sm:space-y-4">
                {Array.isArray(stats.recentAppointments) && stats.recentAppointments.length > 0 ? (
                  stats.recentAppointments.map((appointment) => (
                    <li
                      key={appointment._id}
                      className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0 px-2 sm:px-3 py-2.5 border border-gray-100 hover:border-primary-200 rounded-xl transition-all duration-150 ${isRTL ? 'text-right' : 'text-left'}`}
                    >
                      <div className="flex items-center gap-2 xs:gap-3 min-w-0 w-full md:w-auto">
                        <div className="w-9 h-9 xs:w-10 xs:h-10 bg-gradient-to-tr from-primary-100 to-primary-50 rounded-full flex items-center justify-center shadow">
                          <UserIcon className="w-5 h-5 xs:w-6 xs:h-6 text-primary-600" />
                        </div>
                        <div className="min-w-0">
                          {!!appointment?.patient?.name && (
                            <p className="font-semibold text-gray-900 truncate text-sm xs:text-base">
                              {appointment.patient?.name}
                            </p>
                          )}
                          {!!appointment?.doctor?.name && (
                            <p className="text-xs xs:text-sm text-gray-500 xs:text-gray-600 truncate">
                              {t('with_dr')} {appointment.doctor?.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className={isRTL ? "text-left" : "text-right"}>
                        <p className="text-xs xs:text-sm font-bold text-primary-700 tabular-nums">
                          {appointment.date
                            ? new Date(appointment.date).toLocaleDateString(
                                i18n.language === 'ar'
                                  ? 'ar-EG'
                                  : 'en-US'
                              )
                            : '--'}
                        </p>
                        <p className="text-xs text-gray-400">{appointment.time || ''}</p>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-center py-7 sm:py-12">
                    <div className="flex justify-center mb-2">
                      <CalendarIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-200" />
                    </div>
                    <p className="text-gray-400 text-sm">{t('no_recent_appointments')}</p>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </section>
        {/* Sidebar: Quick Actions and System Info */}
        <aside className="order-1 xl:order-2 flex flex-col gap-4">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-4 xs:p-5 sm:p-6">
            <h3 className={`text-base xs:text-lg md:text-xl font-semibold text-primary-800 mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('quick_actions')}
            </h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => (window.location.hash = '#users')}
                className={`w-full flex items-center justify-between px-3 xs:px-4 py-2.5 xs:py-3 border border-gray-200 rounded-lg bg-gradient-to-r from-white to-primary-50 hover:from-primary-50 hover:to-primary-100 transition group ${isRTL ? 'flex-row-reverse' : 'flex-row'} ${focusOutline}`}
              >
                <span className="text-gray-900 font-medium group-hover:text-primary-600 transition text-xs xs:text-sm">
                  {t('user_management')}
                </span>
                <UserGroupIcon className="w-5 h-5 xs:w-6 xs:h-6 text-gray-500 group-hover:text-primary-600 transition" />
              </button>
              <button
                onClick={() => (window.location.hash = '#specializations')}
                className={`w-full flex items-center justify-between px-3 xs:px-4 py-2.5 xs:py-3 border border-gray-200 rounded-lg bg-gradient-to-r from-white to-green-50 hover:from-green-50 hover:to-green-100 transition group ${isRTL ? 'flex-row-reverse' : 'flex-row'} ${focusOutline}`}
              >
                <span className="text-gray-900 font-medium group-hover:text-green-700 transition text-xs xs:text-sm">
                  {t('specialization_management')}
                </span>
                <BuildingOfficeIcon className="w-5 h-5 xs:w-6 xs:h-6 text-gray-500 group-hover:text-green-700 transition" />
              </button>
              <button
                className={`w-full flex items-center justify-between px-3 xs:px-4 py-2.5 xs:py-3 border border-gray-200 rounded-lg bg-gradient-to-r from-white to-orange-50 hover:from-orange-50 hover:to-orange-100 transition group ${isRTL ? 'flex-row-reverse' : 'flex-row'} ${focusOutline}`}
                disabled
                aria-disabled="true"
                tabIndex={-1}
                title={t('coming_soon')}
              >
                <span className="text-gray-900 font-medium group-hover:text-orange-600 transition text-xs xs:text-sm opacity-70">
                  {t('system_reports')}
                  <span className="ml-1 text-amber-400 font-bold animate-pulse align-middle text-[0.8em]">{t('soon')}</span>
                </span>
                <ChartBarIcon className="w-5 h-5 xs:w-6 xs:h-6 text-gray-500 group-hover:text-orange-600 transition opacity-60" />
              </button>
            </div>
          </div>
          {/* System Info */}
          <div className="bg-gradient-to-tr from-primary-50 to-white border border-primary-100 rounded-2xl shadow p-4 xs:p-5 sm:p-6 mt-2">
            <h3 className={`text-base xs:text-lg font-semibold text-primary-900 mb-2 sm:mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <ChartBarIcon className={`w-5 h-5 xs:w-6 xs:h-6 text-primary-500 ${isRTL ? 'ml-1' : 'mr-1'}`} />
              {t('system_info')}
            </h3>
            <div className={`space-y-1.5 text-xs sm:text-sm text-primary-900 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className="flex justify-between items-baseline">
                <span>{t('version')}:</span>
                <span className="font-bold">1.0.0</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span>{t('status')}:</span>
                <span className="font-bold text-green-600">{t('active')}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span>{t('last_update')}:</span>
                <span className="font-bold">
                  {new Date().toLocaleDateString(
                    i18n.language === 'ar' ? 'ar-EG' : 'en-US'
                  )}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminStats;