import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { doctorAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../common/LoadingSpinner';
import CompleteAppointment from './CompleteAppointment';
import toast from 'react-hot-toast';

const FILTERS = [
  { value: 'today', labelKey: 'today_appointments' },
  { value: 'upcoming', labelKey: 'upcoming_appointments' },
  { value: 'all', labelKey: 'all_appointments' },
];

const statusMap = {
  scheduled: { color: 'bg-yellow-100 text-yellow-800', labelKey: 'scheduled_appointments' },
  completed: { color: 'bg-green-100 text-green-800', labelKey: 'completed_appointments' },
  cancelled: { color: 'bg-red-100 text-red-800', labelKey: 'cancelled_appointments' },
};

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today');
  const [cancelling, setCancelling] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCompleteForm, setShowCompleteForm] = useState(false);

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Memoize fetchAppointments to avoid unnecessary recreation
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'today') {
        params.date = new Date().toISOString().split('T')[0];
      } else if (selectedDate) {
        params.date = selectedDate;
      }
      if (filter === 'upcoming') {
        params.status = 'scheduled';
      }
      const response = await doctorAPI.getAppointments(params);
      const appointmentsData = response.data?.data || response.data || [];
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || t('error_loading_appointments') || 'Error loading appointments'
      );
    } finally {
      setLoading(false);
    }
  }, [filter, selectedDate, t]);

  useEffect(() => {
    fetchAppointments();
    // Only runs when filter or selectedDate changes
  }, [filter, selectedDate, fetchAppointments]);

  // Accessible modal close handler
  const closeCompleteForm = useCallback(() => {
    setShowCompleteForm(false);
    setSelectedAppointment(null);
  }, []);

  const handleCancelAppointment = async (appointmentId) => {
    // Use modal for reason in production; fallback to prompt now for minimal disruption
    let reason = '';
    while (reason.trim() === '') {
      reason = window.prompt(t('enter_cancellation_reason'), '');
      if (reason === null) return; // Cancel pressed
      if (reason.trim()) break;
      toast.error(t('cancellation_reason_required') || 'Cancellation reason required');
    }
    setCancelling(appointmentId);
    try {
      const { data } = await doctorAPI.cancelAppointment(appointmentId, reason.trim());
      toast.success(data?.message || t('success_deleted'));
      await fetchAppointments();
    } catch (error) {
      toast.error(error?.response?.data?.message || t('error_updating_profile') || 'Error updating appointment');
    } finally {
      setCancelling(null);
    }
  };

  const handleCompleteAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCompleteForm(true);
  };

  const handleCompletionSuccess = useCallback(() => {
    closeCompleteForm();
    fetchAppointments();
  }, [closeCompleteForm, fetchAppointments]);

  // Memoize for better perf
  const getStatusColor = useCallback(status => statusMap[status]?.color || 'bg-gray-100 text-gray-800', []);
  const getStatusText = useCallback(status => t(statusMap[status]?.labelKey) || status, [t]);

  // Memoize to avoid recalculation on render
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Always use calendar days, with full formatting, localized
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [i18n.language]);

  const formatTime = (timeStr) => {
    // Expect time as "HH:mm" or null/undefined
    if (!timeStr) return '--';
    // Browser-safe time formatting
    try {
      const [hour, min] = timeStr.split(':');
      const date = new Date();
      date.setHours(+hour, +min, 0);
      return date.toLocaleTimeString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timeStr;
    }
  };

  const isPastAppointment = useCallback((appointmentDate, appointmentTime) => {
    if (!appointmentDate || !appointmentTime) return false;
    // Assumes appointmentTime is "HH:mm"
    const iso = `${appointmentDate}T${appointmentTime}`;
    // Handles potential timezone issues (may need adjustments based on backend)
    const dt = new Date(iso);
    return dt.getTime() < Date.now();
  }, []);

  const noAppointmentsMessage = useMemo(() => {
    if (filter === 'today') return t('no_appointments_today');
    if (selectedDate) return t('no_appointments_date');
    return t('no_appointments_display');
  }, [t, filter, selectedDate]);

  // Helper for appointment patient fields (robust fallback)
  const safePatient = patient => ({
    name: patient?.name || <span className="text-gray-400">—</span>,
    age: patient?.age ?? '--',
    email: patient?.email || '--',
    phone: patient?.phone || null
  });

  // Render
  if (loading) {
    return (
      <section className="flex justify-center items-center min-h-[40vh] py-12" aria-live="polite">
        <LoadingSpinner size="lg" />
        <span className="sr-only">{t('loading')}</span>
      </section>
    );
  }

  return (
    <div
      className="p-2 sm:p-4 md:p-8 max-w-5xl mx-auto"
      dir={isRTL ? 'rtl' : 'ltr'}
      aria-label={t('patient_appointments')}
    >
      {/* Header */}
      <header
        className={`flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 ${isRTL ? 'text-right' : 'text-left'}`}
      >
        <h2 className={`text-2xl md:text-3xl font-bold text-gray-900 text-center sm:text-${isRTL ? 'right' : 'left'} w-full`}>
          {t('patient_appointments')}
        </h2>
      </header>

      {/* Filters and date picker */}
      <section className="card mb-6 px-4 py-3" aria-label={t('filter_appointments')}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Filter buttons */}
          <nav
            aria-label={t('appointment_status_filters')}
            className="flex flex-col gap-2 xs:flex-row w-full xs:w-auto"
          >
            {FILTERS.map(({ value, labelKey }) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value && !selectedDate}
                onClick={() => {
                  setFilter(value);
                  setSelectedDate('');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium w-full xs:w-auto whitespace-nowrap transition-all duration-150 shadow focus:outline-none focus:ring-2
                ${filter === value && !selectedDate
                    ? 'bg-primary-600 text-white ring-2 ring-primary-400'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                tabIndex={0}
              >
                {t(labelKey)}
              </button>
            ))}
          </nav>
          {/* Date picker */}
          <div className="w-full xs:w-auto pt-1 sm:pt-0 sm:w-48">
            <label htmlFor="appointment-date-filter" className="sr-only">
              {t('filter_by_date')}
            </label>
            <input
              id="appointment-date-filter"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setFilter('all');
              }}
              className="form-input w-full focus:ring-primary-400 max-w-xs"
              aria-label={t('select_specific_date')}
              min="1900-01-01"
              max="2100-12-31"
            />
          </div>
        </div>
      </section>

      {/* Appointments list */}
      <section className="flex flex-col gap-5" aria-label={t('appointments_list')}>
        {appointments.map((appointment) => {
          const patient = safePatient(appointment.patient);
          // useMemo for each item is overkill, keep inline for clarity
          const showPastFlag = isPastAppointment(appointment.date, appointment.time) && appointment.status === 'scheduled';

          return (
            <article
              key={appointment._id}
              className="card p-3 sm:p-4 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl border border-gray-100"
              aria-labelledby={`appt-title-${appointment._id}`}
              tabIndex={0}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <h3
                          id={`appt-title-${appointment._id}`}
                          className="text-lg font-semibold text-gray-900 truncate max-w-[14ch] md:max-w-[24ch]"
                        >
                          {patient.name}
                        </h3>
                        <div className={`flex flex-wrap items-center gap-2 mt-1 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                          <span className="flex items-center gap-1 text-primary-600 font-medium">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            <span>
                              {patient.age} {t('years')}
                            </span>
                          </span>
                          {patient.phone && (
                            <>
                              <span className="text-gray-300 hidden xs:inline" aria-hidden="true">•</span>
                              <span className="text-gray-600 text-xs md:text-sm break-all" dir="ltr">
                                <a href={`tel:${patient.phone}`} className="hover:underline">
                                  {patient.phone}
                                </a>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-2 space-x-reverse mt-3 sm:mt-0 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                      {showPastFlag && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded font-medium">
                          {t('past_appointment') || 'منتهي'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm text-gray-600 w-full ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div>
                      <strong>{t('appointment_date')}</strong>{' '}
                      {formatDate(appointment.date)}
                    </div>
                    <div>
                      <strong>{t('appointment_time')}</strong>{' '}
                      {formatTime(appointment.time)}
                    </div>
                    <div>
                      <strong>{t('patient_email')}</strong>{' '}
                      <span className="break-all" dir="ltr">
                        {patient.email}
                      </span>
                    </div>
                    <div>
                      <strong>{t('specialization')}</strong>{' '}
                      {appointment.specialization?.name || '--'}
                    </div>
                    {!!appointment.notes && (
                      <div className="sm:col-span-2 break-words">
                        <strong>{t('patient_notes')}</strong>{' '}
                        {appointment.notes}
                      </div>
                    )}
                    {!!appointment.cancellationReason && (
                      <div className="sm:col-span-2 break-words">
                        <strong>{t('cancellation_reason')}</strong>{' '}
                        {appointment.cancellationReason}
                      </div>
                    )}
                  </div>
                  {/* Prescription (if any) */}
                  {appointment.status === 'completed' && appointment.prescription && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg overflow-x-auto" aria-label={t('prescription_medical')}>
                      <h4 className="font-semibold text-green-900 mb-2">{t('prescription_medical')}</h4>
                      <p className="text-green-800 whitespace-pre-wrap break-all">{appointment.prescription}</p>
                      {appointment.notes && (
                        <div className="mt-2">
                          <h5 className="font-medium text-green-900 mb-1">{t('additional_notes_prescription')}</h5>
                          <p className="text-green-700">{appointment.notes}</p>
                        </div>
                      )}
                      {appointment.completedAt && (
                        <p className="text-xs text-green-600 mt-2">
                          {t('completed_at')} {new Date(appointment.completedAt).toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {/* Action buttons */}
                <div className="w-full md:w-auto flex flex-row md:flex-col gap-2 mt-4 md:mt-0">
                  {/* Scheduled and in the future */}
                  {appointment.status === 'scheduled' && !isPastAppointment(appointment.date, appointment.time) && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleCompleteAppointment(appointment)}
                        className="w-1/2 md:w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                        aria-label={t('visit_completed')}
                      >
                        {t('visit_completed')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancelAppointment(appointment._id)}
                        disabled={cancelling === appointment._id}
                        className="w-1/2 md:w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 flex justify-center items-center"
                        aria-disabled={cancelling === appointment._id}
                        aria-label={t('cancel_appointment')}
                      >
                        {cancelling === appointment._id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          t('cancel_appointment')
                        )}
                      </button>
                    </>
                  )}
                  {/* Completed (edit/view prescription) */}
                  {appointment.status === 'completed' && (
                    <button
                      type="button"
                      onClick={() => handleCompleteAppointment(appointment)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                      aria-label={t('view_edit_prescription')}
                    >
                      {t('view_edit_prescription')}
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {appointments.length === 0 && (
        <section className="text-center py-16 px-2" aria-live="polite" aria-atomic="true">
          <div className="text-6xl mb-4 select-none" aria-hidden="true">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_appointments')}</h3>
          <p className="text-gray-600">
            {noAppointmentsMessage}
          </p>
        </section>
      )}

      {/* Complete Appointment Modal */}
      {showCompleteForm && selectedAppointment && (
        <CompleteAppointment
          appointment={selectedAppointment}
          onClose={closeCompleteForm}
          onSuccess={handleCompletionSuccess}
        />
      )}
    </div>
  );
};

export default DoctorAppointments;