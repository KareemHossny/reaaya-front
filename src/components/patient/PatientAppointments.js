import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { patientAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  XMarkIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const statusConfigs = {
  scheduled: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: ClockIcon,
    iconColor: 'text-yellow-600'
  },
  completed: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircleIcon,
    iconColor: 'text-green-600'
  },
  cancelled: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircleIcon,
    iconColor: 'text-red-600'
  },
  default: {
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: CalendarIcon,
    iconColor: 'text-gray-600'
  }
};

function formatDate(dateString, lang) {
  try {
    return new Date(dateString).toLocaleDateString(
      lang === 'ar' ? 'ar-EG' : 'en-US',
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
    );
  } catch {
    return dateString;
  }
}

function timeAgo(dateString, t, i18n) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('today');
    if (diffDays === 1) return t('yesterday');
    if (diffDays < 7) return `${diffDays} ${t('days_ago')}`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${t('weeks_ago')}`;
    return formatDate(dateString, i18n.language);
  } catch {
    return dateString;
  }
}

const FILTER_OPTIONS = [
  { value: 'all', labelKey: 'all_appointments_filter' },
  { value: 'scheduled', labelKey: 'scheduled_appointments_filter' },
  { value: 'completed', labelKey: 'completed_appointments_filter' },
  { value: 'cancelled', labelKey: 'cancelled_appointments_filter' }
];

const PatientAppointments = () => {
  const { t, i18n } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelling, setCancelling] = useState(null);
  const [showPrescription, setShowPrescription] = useState(null);

  const isRTL = i18n.language === 'ar';

  // Memoized safe appointments extraction
  const safeAppointments = useMemo(
    () => (Array.isArray(appointments) ? appointments : []),
    [appointments]
  );

  // Appointments by status, memoized for stats/filtering
  const appointmentsByStatus = useMemo(() => {
    const byStatus = { all: safeAppointments };
    FILTER_OPTIONS.forEach(o => {
      if (o.value !== 'all')
        byStatus[o.value] = safeAppointments.filter(
          a => a.status === o.value
        );
    });
    return byStatus;
  }, [safeAppointments]);

  // Optimized fetchAppointments to avoid creating new refs on each render
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await patientAPI.getAppointments(params);
      let data = response.data;
      if (Array.isArray(data)) {
        setAppointments(data);
      } else if (data && Array.isArray(data.appointments)) {
        setAppointments(data.appointments);
      } else if (data == null) {
        setAppointments([]);
      } else if (typeof data === 'object') {
        const arr = Object.values(data).find(v => Array.isArray(v));
        setAppointments(arr || []);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      // Extra error logging for debugging
      console.error('Error fetching appointments:', error);
      toast.error(t('error_loading_appointments'));
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [filter, t]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancelAppointment = async (appointmentId) => {
    const reason = window.prompt(t('cancellation_reason_prompt'));
    if (!reason) return;
    setCancelling(appointmentId);
    try {
      await patientAPI.cancelAppointment(appointmentId, reason);
      toast.success(t('cancellation_success'));
      fetchAppointments();
    } catch (error) {
      toast.error(error?.response?.data?.message || t('cancellation_failed'));
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[250px]">
        <div className="relative">
          <LoadingSpinner size="lg" />
          <CalendarDaysIcon className="w-8 h-8 text-primary-500 absolute inset-0 m-auto animate-pulse" />
        </div>
        <span className="text-gray-600 mt-4 font-medium animate-pulse">{t('loading_appointments')}</span>
      </div>
    );
  }

  return (
    <section className={`space-y-8 ${isRTL ? 'rtl' : ''}`}>
      {/* Header with Stats */}
      <header className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{t('my_appointments')}</h2>
            <p className="text-primary-100 mt-1 text-sm sm:text-base">
              {appointmentsByStatus.all.length} {t('total_appointments_lower')}
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-8 flex-wrap">
            <StatDisplay
              label={t('upcoming')}
              value={appointmentsByStatus.scheduled.length}
              color="text-yellow-200"
            />
            <StatDisplay
              label={t('completed')}
              value={appointmentsByStatus.completed.length}
              color="text-green-100"
            />
          </div>
        </div>
      </header>

      {/* Filters */}
      <nav className="bg-white rounded-2xl shadow-lg px-2 py-2 sm:p-4">
        <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : 'justify-start'}`}>
          {FILTER_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              type="button"
              aria-pressed={filter === option.value}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2
                ${filter === option.value
                  ? 'bg-primary-500 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                focus:outline-none focus:ring-2 focus:ring-primary-300`}
            >
              <span>{t(option.labelKey)}</span>
              <span className={`text-xs px-2 py-1 rounded-full
                ${filter === option.value ? 'bg-white/20' : 'bg-gray-300'}
                `}>
                {appointmentsByStatus[option.value]?.length ?? 0}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointmentsByStatus[filter].map(appointment => {
          const statusConf = statusConfigs[appointment.status] ?? statusConfigs.default;
          const StatusIcon = statusConf.icon;
          const doctorName =
            appointment.doctor &&
            `${i18n.language === 'ar' ? 'د.' : 'Dr.'} ${appointment.doctor?.name || ''}`;

          return (
            <article
              key={appointment._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100"
              aria-label={doctorName || t('appointment')}
            >
              <div className="p-3 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Doctor Info Block */}
                  <section className="flex-1 min-w-0">
                    <div className="flex flex-col xs:flex-row xs:items-start gap-2 xs:gap-4">
                      {/* Doctor avatar/status */}
                      <div className="relative flex-shrink-0 mx-auto xs:mx-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center overflow-hidden ring-4 ring-white shadow">
                          {appointment.doctor?.profileImage ? (
                            <img
                              src={appointment.doctor.profileImage}
                              alt={appointment.doctor.name || t('doctor')}
                              className="w-12 h-12 sm:w-14 sm:h-14 object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <UserIcon className="w-7 h-7 sm:w-8 sm:h-8 text-primary-500" />
                          )}
                        </div>
                        <span className="absolute -bottom-2 -right-2 bg-white shadow rounded-full p-1">
                          <StatusIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${statusConf.iconColor}`} />
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 max-w-full">
                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                              {doctorName}
                            </h3>
                            <p className="text-primary-600 font-medium text-xs sm:text-sm truncate">
                              {appointment.specialization?.name}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 sm:px-3 rounded-full text-xs font-semibold border mt-1 sm:mt-0 ${statusConf.color} whitespace-nowrap`}
                            title={t(`${appointment.status}_status`)}
                          >
                            {t(`${appointment.status}_status`)}
                          </span>
                        </div>
                        <dl className="grid grid-cols-1 gap-1 sm:gap-3 sm:grid-cols-2 mt-3 sm:mt-4">
                          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                            <CalendarIcon className="w-4 h-4 text-gray-400" aria-hidden />
                            <span className="text-xs sm:text-sm">{formatDate(appointment.date, i18n.language)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                            <ClockIcon className="w-4 h-4 text-gray-400" aria-hidden />
                            <span className="text-xs sm:text-sm font-medium">{appointment.time}</span>
                          </div>
                          {appointment.notes && (
                            <div className="sm:col-span-2 flex items-start gap-2 text-gray-600">
                              <DocumentTextIcon className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" aria-hidden />
                              <span className="text-xs sm:text-sm flex-1 whitespace-pre-wrap">{appointment.notes}</span>
                            </div>
                          )}
                        </dl>

                        {/* Prescription Button */}
                        {appointment.status === 'completed' && appointment.prescription && (
                          <button
                            onClick={() => setShowPrescription(appointment)}
                            className="mt-3 sm:mt-4 inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 sm:px-4 py-2 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow text-xs sm:text-sm"
                            type="button"
                          >
                            <DocumentTextIcon className="w-4 h-4" />
                            {t('view_prescription')}
                            <ChevronRightIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Actions */}
                  {appointment.status === 'scheduled' && (
                    <section className="w-full xs:w-auto lg:w-48 flex flex-col mt-2 lg:mt-0">
                      <button
                        onClick={() => handleCancelAppointment(appointment._id)}
                        disabled={cancelling === appointment._id}
                        className={`w-full px-3 py-2 sm:px-4 sm:py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2
                          ${cancelling === appointment._id
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow'}
                          focus:outline-none text-xs sm:text-sm`}
                        type="button"
                      >
                        {cancelling === appointment._id ? (
                          <>
                            <LoadingSpinner size="sm" white />
                            {t('cancelling')}
                          </>
                        ) : (
                          <>
                            <XMarkIcon className="w-5 h-5" />
                            {t('cancel_appointment_btn')}
                          </>
                        )}
                      </button>
                      <span className="text-gray-500 text-[10px] sm:text-xs text-center mt-1 sm:mt-2 block">
                        {t('cancel_hint')}
                      </span>
                    </section>
                  )}
                </div>

                {/* Appointment Metadata */}
                <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 gap-1">
                  <span className="text-[10px] sm:text-xs text-gray-500">
                    {t('scheduled')}: {timeAgo(appointment.createdAt, t, i18n)}
                  </span>
                  {appointment.cancellationReason && (
                    <span className="text-[10px] sm:text-xs text-red-600 bg-red-50 px-2 sm:px-3 py-1 rounded-full whitespace-pre-line ml-0 sm:ml-2">
                      {t('cancelled_with_reason')}: {appointment.cancellationReason}
                    </span>
                  )}
                </footer>
              </div>
            </article>
          );
        })}
      </div>

      {/* Empty State */}
      {appointmentsByStatus[filter].length === 0 && (
        <EmptyState
          icon={CalendarDaysIcon}
          message={t('no_appointments_message')}
          description={
            filter === 'all'
              ? t('no_appointments_description')
              : t('no_filtered_appointments', { status: t(`${filter}_status`) })
          }
        />
      )}

      {/* Prescription Modal */}
      {showPrescription && (
        <PrescriptionModal
          appointment={showPrescription}
          onClose={() => setShowPrescription(null)}
          isRTL={isRTL}
          t={t}
          i18n={i18n}
        />
      )}
    </section>
  );
};

// Subcomponents

const StatDisplay = ({ value, label, color = '' }) => (
  <div className="text-center min-w-[70px] sm:min-w-[85px]">
    <span className={`text-xl sm:text-2xl font-bold block ${color}`}>{value}</span>
    <span className="text-xs sm:text-sm text-primary-200">{label}</span>
  </div>
);

const EmptyState = ({ icon: Icon, message, description }) => (
  <div className="text-center py-10 sm:py-16 px-2 sm:px-4" data-testid="appointments-empty">
    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
      <Icon className="w-14 h-14 sm:w-20 sm:h-20 text-gray-400" />
    </div>
    <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">{message}</h3>
    <p className="text-gray-600 max-w-xs sm:max-w-md mx-auto text-xs sm:text-base">{description}</p>
  </div>
);

// --- Prescription Modal and Prescription Parsing ---

const parsePrescription = (prescriptionText, lang = 'en') => {
  if (!prescriptionText) return {
    diagnosis: '',
    medications: [],
    notes: '',
    followUpDate: ''
  };

  // Prefixes for multi-language support
  const AR = lang === 'ar';
  const diagnosisPrefix = AR ? 'التشخيص:' : 'Diagnosis:';
  const medicationsPrefix = AR ? 'الأدوية الموصوفة:' : 'Prescribed Medications:';
  const notesPrefix = AR ? 'ملاحظات إضافية:' : 'Additional Notes:';
  const followUpPrefix = AR ? 'موعد المتابعة:' : 'Follow-up Date:';

  const lines = prescriptionText.split('\n');
  const parsed = {
    diagnosis: '',
    medications: [],
    notes: '',
    followUpDate: ''
  };

  let currentSection = null;

  for (let raw of lines) {
    const line = raw.trim();
    if (line.startsWith(diagnosisPrefix)) {
      currentSection = 'diagnosis';
      parsed.diagnosis = line.replace(diagnosisPrefix, '').trim();
    } else if (line.startsWith(medicationsPrefix)) {
      currentSection = 'medications';
    } else if (line.startsWith(notesPrefix)) {
      currentSection = 'notes';
      parsed.notes = line.replace(notesPrefix, '').trim();
    } else if (line.startsWith(followUpPrefix)) {
      currentSection = 'followUpDate';
      parsed.followUpDate = line.replace(followUpPrefix, '').trim();
    } else if (/^\d+\./.test(line)) {
      const med = line.replace(/^\d+\.\s*/, '').trim();
      if (med) parsed.medications.push(med);
    } else if (currentSection === 'diagnosis' && line && !parsed.diagnosis) {
      parsed.diagnosis = line;
    } else if (currentSection === 'notes' && line) {
      parsed.notes += (parsed.notes ? '\n' : '') + line;
    } else if (currentSection === 'medications' && line && !line.startsWith(AR ? 'ملاحظات' : 'Notes')) {
      parsed.medications.push(line);
    }
  }
  return parsed;
};

const PrescriptionModal = ({ appointment, onClose, isRTL, t, i18n }) => {
  // Parse prescription with memoize for performance
  const parsedPrescription = useMemo(
    () => parsePrescription(appointment.prescription, i18n.language),
    [appointment.prescription, i18n.language]
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn">
      <div
        className={`bg-white rounded-3xl w-full max-w-lg sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 animate-slideUp ${isRTL ? 'rtl' : 'ltr'
        } relative flex flex-col`}
        role="dialog"
        aria-modal="true"
        aria-label={t('medical_prescription')}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="p-2 bg-white/20 rounded-xl">
                <DocumentTextIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </span>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-white">{t('medical_prescription')}</h2>
                <p className="text-green-100 text-xs sm:text-sm mt-1">
                  {t('issued_on')} {formatDate(appointment.date, i18n.language)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors ml-auto mt-3 sm:mt-0"
              type="button"
              aria-label={t('close')}
            >
              <XMarkIcon className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)] sm:max-h-[calc(90vh-200px)]">
          {/* Doctor Info */}
          <section className="mb-4 sm:mb-8 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  {i18n.language === 'ar' ? 'د.' : 'Dr.'} {appointment.doctor?.name}
                </h3>
                <p className="text-blue-600 font-medium text-xs sm:text-base">{appointment.specialization?.name}</p>
              </div>
              <div className="text-left sm:text-right mt-2 sm:mt-0">
                <p className="text-gray-600 text-xs sm:text-sm">
                  <span className="font-medium">{t('visit_date')}:</span>{' '}
                  {formatDate(appointment.date, i18n.language)}
                </p>
                <p className="text-gray-600 text-xs sm:text-sm">
                  <span className="font-medium">{t('visit_time')}:</span> {appointment.time}
                </p>
              </div>
            </div>
          </section>

          {/* Prescription Sections */}
          <div className="space-y-4 sm:space-y-6">
            {/* Diagnosis */}
            {parsedPrescription.diagnosis && (
              <section className="bg-white rounded-2xl border border-yellow-100 p-3 sm:p-5 shadow-sm">
                <h4 className="flex items-center gap-2 text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 bg-yellow-100 rounded-lg flex items-center justify-center" aria-hidden>
                    <span className="text-yellow-600 text-lg sm:text-xl">🩺</span>
                  </span>
                  {t('diagnosis')}
                </h4>
                <p className="text-gray-700 bg-yellow-50 p-3 sm:p-4 rounded-xl border border-yellow-200 text-xs sm:text-base">
                  {parsedPrescription.diagnosis}
                </p>
              </section>
            )}

            {/* Medications */}
            {parsedPrescription.medications.length > 0 && (
              <section className="bg-white rounded-2xl border border-green-100 p-3 sm:p-5 shadow-sm">
                <h4 className="flex items-center gap-2 text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-4">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center" aria-hidden>
                    <span className="text-green-600 text-lg sm:text-xl">💊</span>
                  </span>
                  {t('prescribed_medications_list')}
                </h4>
                <ol className="grid gap-2 sm:gap-3 list-decimal list-inside">
                  {parsedPrescription.medications.map((medication, index) => (
                    <li key={index} className="flex items-start gap-2 sm:gap-4 p-2 sm:p-4 bg-green-50 rounded-xl border border-green-200 text-xs sm:text-base">
                      <span className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 text-white rounded-lg flex items-center justify-center flex-shrink-0 font-bold">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 flex-1">{medication}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Notes */}
            {parsedPrescription.notes && (
              <section className="bg-white rounded-2xl border border-blue-100 p-3 sm:p-5 shadow-sm">
                <h4 className="flex items-center gap-2 text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center" aria-hidden>
                    <span className="text-blue-600 text-lg sm:text-xl">📝</span>
                  </span>
                  {t('instructions_guidelines')}
                </h4>
                <pre
                  className="text-gray-700 bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-200 whitespace-pre-wrap text-xs sm:text-base"
                  style={{ fontFamily: 'inherit' }}
                >
                  {parsedPrescription.notes}
                </pre>
              </section>
            )}

            {/* Follow-up */}
            {parsedPrescription.followUpDate && (
              <section className="bg-white rounded-2xl border border-purple-100 p-3 sm:p-5 shadow-sm">
                <h4 className="flex items-center gap-2 text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center" aria-hidden>
                    <span className="text-purple-600 text-lg sm:text-xl">📅</span>
                  </span>
                  {t('followup_consultation')}
                </h4>
                <div className="bg-purple-50 p-3 sm:p-4 rounded-xl border border-purple-200">
                  <p className="text-base sm:text-lg font-bold text-purple-700">{parsedPrescription.followUpDate}</p>
                  <p className="text-purple-600 text-xs sm:text-sm mt-1">{t('confirm_followup_booking')}</p>
                </div>
              </section>
            )}
          </div>

          {/* Doctor Signature */}
          <footer className="mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            <div className="flex flex-col items-end">
              <div className="text-center w-full">
                <span className="text-gray-700 font-bold text-base sm:text-lg block">
                  {i18n.language === 'ar' ? 'د.' : 'Dr.'} {appointment.doctor?.name}
                </span>
                <span className="text-gray-600 text-xs sm:text-sm block">{appointment.specialization?.name}</span>
                <div className="mt-3 sm:mt-4 pt-1 sm:pt-2 border-t border-gray-400 inline-block px-6 sm:px-8">
                  <span className="text-gray-700 font-semibold">{t('doctor_signature_prescription')}</span>
                </div>
              </div>
            </div>
          </footer>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm sm:text-base"
              type="button"
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientAppointments;