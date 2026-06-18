import React, { useState, useEffect } from 'react';
import { doctorAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../common/LoadingSpinner';

const DoctorSchedule = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [selectedDate, setSelectedDate] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isWorkingDay, setIsWorkingDay] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const allTimeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30'
  ];

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    loadSchedule(today);
    // eslint-disable-next-line
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    loadSchedule(date);
  };

  const loadSchedule = async (date) => {
    try {
      setLoading(true);
      const response = await doctorAPI.getSchedule({ date });
      if (response?.data?.success) {
        const schedule = response.data.data;
        setIsWorkingDay(schedule.isWorkingDay !== false);
        setAvailableTimes(Array.isArray(schedule.availableTimes) ? schedule.availableTimes : []);
      }
    } catch (error) {
      toast.error(t('error_loading_availability'));
      setAvailableTimes([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleTimeSlot = (time) => {
    setAvailableTimes(prevTimes =>
      prevTimes.includes(time)
        ? prevTimes.filter(t => t !== time)
        : [...prevTimes, time].sort()
    );
  };

  const selectAllTimes = () => {
    setAvailableTimes([...allTimeSlots]);
  };

  const clearAllTimes = () => {
    setAvailableTimes([]);
  };

  const saveSchedule = async () => {
    if (!Array.isArray(availableTimes)) {
      toast.error(t('error_loading_data'));
      return;
    }

    if (isWorkingDay && availableTimes.length === 0) {
      toast.error(t('choose_times_for_days'));
      return;
    }

    try {
      setSaving(true);

      const scheduleData = {
        date: selectedDate,
        isWorkingDay: isWorkingDay,
        availableTimes: availableTimes
      };

      const response = await doctorAPI.saveSchedule(scheduleData);

      if (response.data.success) {
        toast.success(t('success_saved'));
        await loadSchedule(selectedDate);
      } else {
        toast.error(response.data.message || t('error_saving_availability'));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('error_saving_availability'));
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? (isRTL ? 'م' : 'PM') : (isRTL ? 'ص' : 'AM');
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div 
      className="p-4 sm:p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          🗓️ {t('manage_schedule')}
        </h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-base sm:text-lg">
          {t('select_date_and_times')}
        </p>
      </div>

      {/* Quick summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div>
          <p className="font-semibold text-blue-800 text-base">
            {t('schedule_info')}
          </p>
          <p className="text-xs sm:text-sm text-blue-600 mt-1">
            {t('date')}: {selectedDate} | {t('slots_count')}: {availableTimes.length} | {t('status')}: {isWorkingDay ? t('active') : t('day_off')}
          </p>
        </div>
      </div>

      {/* Date selection */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow mb-4 sm:mb-6">
        <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">
          📅 {t('choose_date')}
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Day status */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="text-gray-700 font-semibold text-base sm:text-lg">
            {t('status')}
          </span>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={isWorkingDay}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsWorkingDay(checked);
                  if (!checked) setAvailableTimes([]);
                }}
              />
              <div className={`block w-11 sm:w-14 h-6 sm:h-7 rounded-full transition-colors duration-300 ${isWorkingDay ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div
                className={`
                  absolute left-1 top-1 bg-white 
                  w-4 h-4 sm:w-5 sm:h-5 rounded-full 
                  shadow transition-transform duration-200
                  ${isWorkingDay ? 'transform translate-x-5 sm:translate-x-7' : ''}
                `}
                style={{ transition: 'transform 0.2s' }}
              ></div>
            </div>
            <span className={`ml-2 sm:ml-3 font-bold text-sm sm:text-base ${isWorkingDay ? 'text-green-600' : 'text-red-600'}`}>
              {isWorkingDay ? t('active') : t('day_off')}
            </span>
          </label>
        </div>
      </div>

      {/* If it's a working day */}
      {isWorkingDay ? (
        <>
          {/* Controls */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow mb-4 sm:mb-6">
            <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-2 sm:gap-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700">
                {t('selected_times')}: {availableTimes.length} {t('of')} {allTimeSlots.length}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={selectAllTimes}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm sm:text-base transition"
                >
                  ✓ {t('select_all')}
                </button>
                <button
                  onClick={clearAllTimes}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 text-sm sm:text-base transition"
                >
                  ✗ {t('clear_all')}
                </button>
              </div>
            </div>
          </div>

          {/* Time slots grid */}
          <div className="bg-white p-3 sm:p-6 rounded-xl shadow mb-4 sm:mb-6">
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
              {allTimeSlots.map((time, index) => {
                const isSelected = availableTimes.includes(time);
                return (
                  <button
                    key={index}
                    onClick={() => toggleTimeSlot(time)}
                    disabled={loading}
                    className={`
                      p-2 sm:p-3 rounded-xl border-2 transition
                      text-xs sm:text-base
                      ${isSelected
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }
                      ${loading && 'opacity-50 pointer-events-none'}
                    `}
                  >
                    <div className="font-bold">{formatTime(time)}</div>
                    <div className={`text-[10px] sm:text-xs mt-1 px-2 py-0.5 rounded-full ${isSelected ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>
                      {isSelected ? t('selected') : t('not_selected')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected times display */}
          {availableTimes.length > 0 && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 sm:p-6 mb-4 sm:mb-6">
              <h3 className="text-lg font-bold text-green-800 mb-2 sm:mb-4">
                ✅ {t('selected_times')} ({availableTimes.length} {t('slots_count')})
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {availableTimes.map((time, index) => (
                  <div
                    key={index}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    <span className="font-bold">{formatTime(time)}</span>
                    <button
                      onClick={() => toggleTimeSlot(time)}
                      className="text-red-500 hover:text-red-700 ml-1 transition"
                      aria-label={`${t('remove')} ${formatTime(time)}`}
                      tabIndex={0}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center mb-4 sm:mb-6">
          <div className="text-4xl sm:text-6xl mb-1 sm:mb-4">🏝️</div>
          <h3 className="text-xl sm:text-2xl font-bold text-yellow-800 mb-1">
            {t('day_off')}
          </h3>
          <p className="text-yellow-600 text-base sm:text-lg">
            {t('no_available_slots')}
          </p>
        </div>
      )}

      {/* Save button */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
        <button
          onClick={saveSchedule}
          disabled={saving || loading}
          className={`
            w-full py-3 sm:py-4 rounded-xl font-bold text-base sm:text-xl transition
            ${saving || loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          `}
        >
          {saving ? (
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <LoadingSpinner size="sm" white />
              {t('saving_schedule')}
            </div>
          ) : (
            t('save_schedule')
          )}
        </button>
        <p className="text-center text-gray-500 mt-2 text-xs sm:text-base">
          {isWorkingDay
            ? `${t('will_save')} ${availableTimes.length} ${t('slots_count')}`
            : t('will_set_day_off')
          }
        </p>
      </div>
    </div>
  );
};

export default DoctorSchedule;
