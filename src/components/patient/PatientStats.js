import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { patientAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// Helper for formatting numbers with commas
const formatNumber = n =>
  typeof n === 'number'
    ? n.toLocaleString()
    : (parseInt(n, 10) || 0).toLocaleString();

const CardStat = React.memo(
  ({
    icon: Icon,
    color,
    title,
    value,
    percent,
    trend,
    total,
    isRTL
  }) => (
    <div
      className="bg-white rounded-2xl p-4 xs:p-5 shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 group flex flex-col"
      title={title}
    >
      <div className="flex items-center justify-between mb-3 xs:mb-4">
        <div className={`p-2 xs:p-3 rounded-xl bg-gradient-to-br ${color} shadow-sm`}>
          <Icon className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full 
            ${
              typeof trend === 'string' && trend[0] === '+'
                ? 'bg-green-100 text-green-600'
                : typeof trend === 'string' && trend[0] === '-'
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 text-gray-600'
            }
            `}
          >
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-2xl xs:text-3xl font-bold text-gray-900 mb-1 tabular-nums break-words">
        {formatNumber(value)}
        {typeof percent === 'number' && (
          <span className="text-base text-gray-400 ml-1 xs:ml-2">
            ({percent}%)
          </span>
        )}
      </h3>
      <p className="text-gray-500 text-xs xs:text-sm font-medium truncate">{title}</p>
      <div className="mt-3 xs:mt-4 pt-3 xs:pt-4 border-t border-gray-50">
        <div className="h-1 xs:h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${color} transition-all duration-700`}
            style={{
              width:
                total > 0
                  ? `${Math.min(100, (value / total) * 100)}%`
                  : '0%'
            }}
            aria-label={`${percent}%`}
          />
        </div>
      </div>
    </div>
  )
);

const PatientStats = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await patientAPI.getStats();
      setStats(response.data ?? {});
    } catch (error) {
      setErrorMsg(t('error_loading_stats'));
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line
  }, [fetchStats]);

  // Defensive fallback for stats structure
  const statsSafe = stats || {
    totalAppointments: 0,
    upcomingAppointments: 0,
    scheduledAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0
  };

  const total = statsSafe.totalAppointments || 1;

  // Calculated stats for cards
  const statCards = useMemo(
    () => [
      {
        title: t('total_appointments_stat'),
        value: statsSafe.totalAppointments,
        color: 'from-blue-500 to-blue-700',
        icon: CalendarIcon,
        trend:
          statsSafe.trendTotal !== undefined
            ? statsSafe.trendTotal
            : '+12%',
        percent: 100
      },
      {
        title: t('upcoming_appointments'),
        value: statsSafe.upcomingAppointments,
        color: 'from-green-500 to-green-700',
        icon: ClockIcon,
        trend: t('active'),
        percent: total
          ? Math.round((statsSafe.upcomingAppointments / total) * 100)
          : 0
      },
      {
        title: t('scheduled_appointments'),
        value: statsSafe.scheduledAppointments,
        color: 'from-purple-500 to-purple-700',
        icon: CheckCircleIcon,
        trend: t('confirmed'),
        percent: total
          ? Math.round((statsSafe.scheduledAppointments / total) * 100)
          : 0
      },
      {
        title: t('completed_appointments'),
        value: statsSafe.completedAppointments,
        color: 'from-teal-500 to-teal-700',
        icon: ChartBarIcon,
        trend: t('history'),
        percent: total
          ? Math.round((statsSafe.completedAppointments / total) * 100)
          : 0
      },
      {
        title: t('cancelled_appointments'),
        value: statsSafe.cancelledAppointments,
        color: 'from-red-500 to-red-700',
        icon: XCircleIcon,
        trend: t('cancelled'),
        percent: total
          ? Math.round((statsSafe.cancelledAppointments / total) * 100)
          : 0
      }
    ],
    [
      t,
      statsSafe.totalAppointments,
      statsSafe.upcomingAppointments,
      statsSafe.scheduledAppointments,
      statsSafe.completedAppointments,
      statsSafe.cancelledAppointments,
      total,
      statsSafe.trendTotal
    ]
  );

  // Tips and insights
  const tips = useMemo(
    () => [
      t('arrive_15_minutes_early'),
      t('cancel_24_hours_before'),
      t('keep_appointment_records'),
      t('use_search_feature')
    ],
    [t]
  );

  const avgMonthly = useMemo(
    () =>
      Math.round((statsSafe.totalAppointments || 0) / 12) || 0,
    [statsSafe.totalAppointments]
  );

  const completedRate = useMemo(
    () =>
      total
        ? Math.round(
            ((statsSafe.completedAppointments || 0) / total) * 100
          )
        : 0,
    [statsSafe.completedAppointments, total]
  );

  const cancelledRate = useMemo(
    () =>
      total
        ? Math.round(
            ((statsSafe.cancelledAppointments || 0) / total) * 100
          )
        : 0,
    [statsSafe.cancelledAppointments, total]
  );

  // Loader UI
  if (loading) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-16 xs:py-20 min-h-[220px] xs:min-h-[340px] ${
          isRTL ? 'rtl' : ''
        }`}
        aria-busy="true"
      >
        <div className="relative">
          <LoadingSpinner size="lg" />
          <ChartBarIcon className="w-8 h-8 xs:w-10 xs:h-10 text-primary-500 opacity-80 absolute inset-0 m-auto animate-pulse pointer-events-none" />
        </div>
        <span className="text-gray-600 mt-6 xs:mt-7 font-medium text-base xs:text-lg">
          {t('loading_statistics')}
        </span>
      </div>
    );
  }

  // Error UI
  if (!stats || errorMsg) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-16 xs:py-20 min-h-[220px] xs:min-h-[340px] ${
          isRTL ? 'text-right' : 'text-left'
        }`}
        role="alert"
      >
        <ExclamationTriangleIcon className="w-12 h-12 xs:w-16 xs:h-16 text-yellow-500 mx-auto mb-5 xs:mb-6" />
        <h3 className="text-lg xs:text-xl font-bold text-gray-800 mb-2">
          {errorMsg || t('error_loading_stats')}
        </h3>
        <p className="text-gray-600 mb-3">{t('try_again_later')}</p>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-1 px-3 py-2 xs:px-4 xs:py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition focus:outline-none text-sm xs:text-base"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" className="w-4 h-4">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4V1m0 0l7 7m-7-7a9 9 0 1 1-7 7"
            />
          </svg>
          {t('retry')}
        </button>
      </div>
    );
  }

  // Main UI
  return (
    <div className={`space-y-7 xs:space-y-10 ${isRTL ? 'rtl' : ''}`}>
      {/* Header */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-5 xs:p-7 text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl xs:text-3xl font-bold mb-1">
              {t('appointment_statistics')}
            </h2>
            <p className="text-primary-50 mt-1 font-medium tracking-wide text-sm xs:text-base">
              {t('your_medical_journey')}
            </p>
          </div>
          <div className="p-3 xs:p-4 bg-white/10 rounded-xl self-end sm:self-auto">
            <ChartBarIcon className="w-7 h-7 xs:w-9 xs:h-9 text-white drop-shadow-md" />
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section>
        <div className="
          grid gap-4 xs:gap-5
          grid-cols-1
          ss:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          2xl:grid-cols-5
        ">
          {statCards.map((stat, idx) => (
            <CardStat
              key={stat.title}
              icon={stat.icon}
              color={stat.color}
              title={stat.title}
              value={stat.value}
              percent={stat.percent}
              trend={stat.trend}
              total={statsSafe.totalAppointments}
              isRTL={isRTL}
            />
          ))}
        </div>
      </section>

      {/* Insights & Tips */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-7">
        {/* Patient Tips Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full min-w-0">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 xs:p-5 text-white flex items-center gap-2 xs:gap-3">
            <InformationCircleIcon className="w-5 h-5 xs:w-6 xs:h-6" />
            <h3 className="text-base xs:text-lg md:text-xl font-bold">{t('patient_tips')}</h3>
          </div>
          <ul className="p-4 xs:p-6 space-y-3 xs:space-y-4 flex-1">
            {tips.map((tip, idx) => (
              <li
                key={tip}
                className={`flex items-start gap-2 xs:gap-3 p-2 xs:p-3 bg-green-50 rounded-xl ${
                  isRTL ? 'flex-row-reverse text-right' : 'text-left'
                }`}
              >
                <span className="w-6 h-6 xs:w-7 xs:h-7 bg-green-500 font-bold text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-md text-xs xs:text-base">
                  {idx + 1}
                </span>
                <span className="text-gray-700 text-xs xs:text-sm flex-1">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Health Insights Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full min-w-0">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 xs:p-5 text-white flex items-center gap-2 xs:gap-3">
            <ChartBarIcon className="w-5 h-5 xs:w-6 xs:h-6" />
            <h3 className="text-base xs:text-lg md:text-xl font-bold">{t('health_insights')}</h3>
          </div>
          <div className="p-4 xs:p-6 flex-1">
            <div className="space-y-3 xs:space-y-4">
              <div className="flex flex-row items-center justify-between p-2 xs:p-3 bg-purple-50 rounded-xl">
                <span className="text-gray-700 font-medium text-xs xs:text-base">{t('avg_appointments_per_month')}</span>
                <span className="text-xl xs:text-2xl font-bold text-purple-600 tabular-nums">{formatNumber(avgMonthly)}</span>
              </div>
              <div className="flex flex-row items-center justify-between p-2 xs:p-3 bg-blue-50 rounded-xl">
                <span className="text-gray-700 font-medium text-xs xs:text-base">{t('success_rate')}</span>
                <span className="text-xl xs:text-2xl font-bold text-blue-600 tabular-nums">
                  {completedRate}%
                </span>
              </div>
              <div className="flex flex-row items-center justify-between p-2 xs:p-3 bg-red-50 rounded-xl">
                <span className="text-gray-700 font-medium text-xs xs:text-base">{t('cancellation_rate')}</span>
                <span className="text-xl xs:text-2xl font-bold text-red-600 tabular-nums">
                  {cancelledRate}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default React.memo(PatientStats);