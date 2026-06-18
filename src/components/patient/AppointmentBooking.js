import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { patientAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../common/LoadingSpinner';
import { translateMedicalText } from '../../utils/medicalTranslator';
import toast from 'react-hot-toast';

const AppointmentBooking = ({ doctor, onClose, onSuccess }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Memoized date helpers for style and performance
  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  }, []);

  const fetchAvailableSlots = useCallback(async () => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await patientAPI.getAvailableSlots(doctor._id, selectedDate);
      setAvailableSlots(Array.isArray(data) ? data : []);
      setSelectedTime('');
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error(t('error_loading_slots'));
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, doctor._id, t]);

  useEffect(() => {
    fetchAvailableSlots();
    // eslint-disable-next-line
  }, [fetchAvailableSlots]);

  const handleBookAppointment = async (e) => {
    e && e.preventDefault && e.preventDefault();
    if (!selectedDate || !selectedTime) {
      toast.error(t('select_date_time'));
      return;
    }
    setBooking(true);
    try {
      await patientAPI.bookAppointment({
        doctorId: doctor._id,
        specializationId: doctor.specialization?._id,
        date: selectedDate,
        time: selectedTime,
        notes: notes.trim(),
      });
      toast.success(t('booking_success'));
      onSuccess && onSuccess();
    } catch (error) {
      toast.error(error?.response?.data?.message || t('booking_failed'));
    } finally {
      setBooking(false);
    }
  };

  // -- Styling Helpers -----
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";
  const formInputClass = "form-input w-full text-base px-3 py-2 rounded-xl border-gray-300 focus:border-primary-500 focus:ring-primary-100 transition";
  const slotBtnBase =
    "whitespace-nowrap px-3 py-2 rounded-xl font-medium text-sm border transition-all focus:outline-primary-500";
  const slotBtnSelected =
    "bg-primary-600 text-white border-primary-600 shadow focus:shadow-lg";
  const slotBtnUnselected =
    "bg-white text-gray-700 border-gray-300 hover:text-primary-700 hover:border-primary-500";
  const slotGridClass = "grid grid-cols-2 gap-2 sm:grid-cols-3 mt-2";
  const cardPad = "px-4 py-6 sm:p-6";
  const actionBtnBase =
    "flex-1 min-w-0 rounded-xl px-4 py-2 text-base font-semibold transition-all focus:outline-primary-500";

  // Get doctor avatar or fallback with better style
  const getDoctorImage = () =>
    doctor.profileImage ? (
      <img
        src={doctor.profileImage}
        alt={doctor.name}
        className="w-full h-full object-cover rounded-full ring-2 ring-primary-200"
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-primary-50 rounded-full">
        <span className="text-2xl" role="img" aria-label="Doctor">👨‍⚕️</span>
      </div>
    );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 sm:p-6 p-2 z-50">
      <div
        className="
          bg-white rounded-3xl w-full max-w-md max-h-[94vh] shadow-2xl overflow-y-auto relative
          border border-primary-100
          "
        dir={isRTL ? 'rtl' : 'ltr'}
        role="dialog"
        aria-modal="true"
        aria-label={t('appointment_booking')}
      >

        {/* Doctor Info */}
        <div className={`${cardPad} border-b border-b-primary-50 flex items-center gap-4`}>
          <div className="w-14 h-14 flex-shrink-0">{getDoctorImage()}</div>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <div className="text-base sm:text-lg font-bold text-primary-900 mb-1">
              {i18n.language === 'ar' ? 'د.' : 'Dr.'} {doctor.name}
            </div>
            <div className="text-primary-600 text-xs sm:text-sm bg-primary-50 px-2 py-1 rounded-md inline-block">
              {translateMedicalText(doctor.specialization?.name || t('general_practitioner'), i18n.language)}
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form className={`${cardPad} flex flex-col gap-5`} onSubmit={handleBookAppointment} autoComplete="off">
          {/* Date selection */}
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <label htmlFor="appointment-date" className={labelClass}>
              {t('choose_date')}
            </label>
            <input
              id="appointment-date"
              name="appointment-date"
              type="date"
              min={minDate}
              max={maxDate}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={formInputClass}
              required
              disabled={booking}
            />
          </div>

          {/* Time selection */}
          {selectedDate && (
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <label className={labelClass}>
                {t('choose_time')}
              </label>
              {loading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="md" />
                </div>
              ) : availableSlots.length > 0 ? (
                <div className={slotGridClass}>
                  {availableSlots.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`${slotBtnBase} ${selectedTime === slot ? slotBtnSelected : slotBtnUnselected}`}
                      aria-pressed={selectedTime === slot}
                      tabIndex={0}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-3 text-sm sm:text-base">
                  {t('no_available_slots')}
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <label htmlFor="appointment-notes" className={labelClass}>
              {t('notes_optional')}
            </label>
            <textarea
              id="appointment-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={formInputClass + ' resize-vertical'}
              placeholder={t('notes_placeholder')}
              maxLength={400}
              disabled={booking}
              style={{ minHeight: 70, maxHeight: 160 }}
            />
          </div>
        </form>

        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row gap-2 sm:gap-4 py-5 px-5 sm:px-7 border-t border-t-primary-50 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={onClose}
            className={actionBtnBase + " btn-secondary"}
            disabled={booking}
            aria-label={t('cancel')}
            type="button"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleBookAppointment}
            disabled={!selectedTime || booking}
            className={actionBtnBase + " btn-primary"}
            aria-label={t('confirm_booking')}
            type="submit"
          >
            {booking ? <LoadingSpinner size="sm" /> : t('confirm_booking')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;
