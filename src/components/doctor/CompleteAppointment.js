import React, { useState, useEffect, useCallback } from 'react';
import { doctorAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const CompleteAppointment = ({ appointment, onClose, onSuccess }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [formData, setFormData] = useState({
    prescription: '',
    notes: '',
    diagnosis: '',
    followUpDate: '',
    medications: ['']
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('prescription');
  const [appointmentDetails, setAppointmentDetails] = useState(null);

  // Reset and prepopulate form data on appointment change for more accurate edits
  useEffect(() => {
    if (appointment) {
      fetchAppointmentDetails();
      setFormData({
        prescription: appointment.prescription || '',
        notes: appointment.notes || '',
        diagnosis: '',
        followUpDate: '',
        medications: ['']
      });
    }
    // eslint-disable-next-line
  }, [appointment]);

  // Fetch appointment details
  const fetchAppointmentDetails = useCallback(async () => {
    try {
      const response = await doctorAPI.getAppointmentDetails(appointment._id);
      setAppointmentDetails(response.data);
    } catch (error) {
      toast.error(t('error_loading_data'));
      // console.error is okay to omit for cleaner code
    }
  }, [appointment, t]);

  // General handler for form input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Medication handlers
  const handleMedicationChange = useCallback((index, value) => {
    setFormData(prev => {
      const medications = [...prev.medications];
      medications[index] = value;
      return { ...prev, medications };
    });
  }, []);

  const addMedication = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, '']
    }));
  }, []);

  const removeMedication = useCallback((index) => {
    setFormData(prev => {
      if (prev.medications.length <= 1) return prev;
      const medications = prev.medications.filter((_, i) => i !== index);
      return { ...prev, medications };
    });
  }, []);

  // Generate prescription full text
  const generatePrescriptionText = useCallback(() => {
    let prescription = `${t('diagnosis')}: ${formData.diagnosis || t('no_diagnosis_specified')}\n\n`;
    prescription += `${t('prescribed_medications')}:\n`;
    formData.medications.forEach((med, idx) => {
      if (med.trim()) prescription += `${idx + 1}. ${med}\n`;
    });
    if (formData.notes) {
      prescription += `\n${t('additional_notes')}:\n${formData.notes}`;
    }
    if (formData.followUpDate) {
      prescription += `\n\n${t('followup_date')}: ${new Date(formData.followUpDate).toLocaleDateString(
        isRTL ? 'ar-EG' : 'en-US'
      )}`;
    }
    return prescription;
    // eslint-disable-next-line
  }, [formData, isRTL, t]);

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.diagnosis.trim()) {
      toast.error(t('write_diagnosis'));
      return;
    }
    if (!formData.medications.some(med => med.trim())) {
      toast.error(t('add_at_least_one_medication'));
      return;
    }
    setLoading(true);
    try {
      const finalPrescription = generatePrescriptionText();
      await doctorAPI.completeAppointment(appointment._id, {
        prescription: finalPrescription,
        notes: formData.notes
      });
      toast.success(t('success_saved'));
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || t('error_updating_profile'));
    } finally {
      setLoading(false);
    }
  };

  if (!appointment) return null;

  // Util for responsive grid cols (for patient info)
  const patientInfoGridCols = "grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3";

  // Responsive and improved visual structure
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-2 md:p-4 min-h-screen"
      style={{ overscrollBehavior: "none" }}
    >
      <div
        className={`bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[95vh] min-h-[70vh] flex flex-col overflow-y-auto transition-all`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Patient Information Section */}
        <section className="p-3 sm:p-5 border-b bg-gray-50 sticky top-0 z-10 shadow-sm mt-6">
          <h3 className={`text-lg font-semibold text-blue-700 mb-2 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
            {t('patient_information')}
          </h3>
          <div className={`grid ${patientInfoGridCols} gap-2 sm:gap-3 text-xs sm:text-sm`}>
            <div className="bg-white p-3 rounded-lg border flex flex-col">
              <span className="font-medium text-gray-700">{t('patient_name')}</span>
              <span className="text-gray-900 font-semibold truncate">{appointment.patient?.name || '--'}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border flex flex-col break-all">
              <span className="font-medium text-gray-700">{t('patient_email')}</span>
              <span className="text-gray-900">{appointment.patient?.email || '--'}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border flex flex-col">
              <span className="font-medium text-gray-700">{t('patient_phone')}</span>
              <span className="text-gray-900">{appointment.patient?.phone || t('not_available')}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border flex flex-col">
              <span className="font-medium text-gray-700">{t('patient_age')}</span>
              <span className="text-gray-900">{appointment.patient?.age || '--'} {t('years')}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border flex flex-col">
              <span className="font-medium text-gray-700">{t('appointment_date')}</span>
              <span className="text-gray-900">{new Date(appointment.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border flex flex-col">
              <span className="font-medium text-gray-700">{t('appointment_time')}</span>
              <span className="text-gray-900 font-semibold">{appointment.time}</span>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <nav className="border-b bg-white sticky top-[70px] z-10 flex px-2 py-1">
          <button
            onClick={() => setActiveTab('prescription')}
            className={`flex-1 px-2 py-2 text-xs sm:text-sm font-medium border-b-2 transition 
              ${activeTab === 'prescription'
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
            {t('write_prescription')}
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 px-2 py-2 text-xs sm:text-sm font-medium border-b-2 transition 
              ${activeTab === 'preview'
                ? 'border-green-600 text-green-600 bg-green-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
            {t('preview_prescription')}
          </button>
        </nav>

        {/* Main Content */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col p-2 sm:p-5 gap-4 sm:gap-7 overflow-y-auto"
        >
          {activeTab === 'prescription' ? (
            <>
              <div className={`flex flex-col gap-3 ${isRTL ? 'items-end' : 'items-start'}`}>
                {/* Diagnosis */}
                <div className="w-full">
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <span className="text-red-500">🩺</span>
                    {t('diagnosis_required')}
                  </label>
                  <textarea
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    rows={2}
                    className="form-input resize-none w-full border-2 border-gray-300 focus:border-blue-500 transition"
                    placeholder={t('enter_diagnosis')}
                    required
                  />
                </div>

                {/* Medications */}
                <div className="w-full">
                  <div className={`flex items-center justify-between gap-3 mb-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      <span className="text-green-600">💊</span>
                      {t('prescribed_medications')} *
                    </label>
                    <button
                      type="button"
                      aria-label={t('add_medication')}
                      onClick={addMedication}
                      className="text-xs bg-green-600 text-white px-2.5 py-1 rounded-lg hover:bg-green-700 transition"
                    >
                      {t('add_medication')}
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 w-full max-h-48 sm:max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200">
                    {formData.medications.map((medication, index) => (
                      <div key={index} className={`flex gap-1 items-start ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <input
                          type="text"
                          value={medication}
                          onChange={(e) => handleMedicationChange(index, e.target.value)}
                          className="form-input flex-1 min-w-0"
                          placeholder={`${t('prescribed_medications')} ${index + 1} (${t('write_medication_name')})`}
                          autoComplete="off"
                        />
                        {formData.medications.length > 1 && (
                          <button
                            type="button"
                            aria-label={t('remove_medication')}
                            onClick={() => removeMedication(index)}
                            className="text-red-500 hover:text-red-800 p-1.5 rounded bg-red-50 hover:bg-red-100 shadow-sm transition"
                          >
                            <span aria-hidden>🗑️</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t('medication_example')}</p>
                </div>

                {/* Follow Up Date */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                      <span className="text-purple-600">📅</span>
                      {t('followup_optional')}
                    </label>
                    <input
                      type="date"
                      name="followUpDate"
                      value={formData.followUpDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="form-input w-full"
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="w-full">
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <span className="text-blue-600">📝</span>
                    {t('additional_notes')}
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    className="form-input resize-none w-full"
                    placeholder={t('enter_notes')}
                  />
                </div>
              </div>
            </>
          ) : (
            // Preview Mode
            <div className="bg-white border-2 border-gray-300 rounded-lg p-2 sm:p-5 font-sans w-full" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="text-center mb-6 border-b border-gray-300 pb-4">
                <h3 className="text-lg sm:text-xl font-bold text-blue-800">{t('medical_prescription')}</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Medical Prescription</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">{t('patient_information')}:</h4>
                  <p><strong>{t('patient_name')}:</strong> {appointment.patient?.name}</p>
                  <p><strong>{t('appointment_date')}:</strong> {new Date().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">{t('doctor_information')}:</h4>
                  <p><strong>د.</strong>&nbsp;[اسم الطبيب]</p>
                  <p><strong>{t('specialization')}:</strong> {appointment.specialization?.name}</p>
                </div>
              </div>

              <div className="mb-5">
                <h4 className="font-semibold text-gray-700 mb-1 border-b border-gray-300 pb-1">{t('diagnosis')}:</h4>
                <p className="text-gray-800 bg-yellow-50 p-2 rounded border border-yellow-200">
                  {formData.diagnosis || t('no_diagnosis_specified')}
                </p>
              </div>

              <div className="mb-5">
                <h4 className="font-semibold text-gray-700 mb-1 border-b border-gray-300 pb-1">{t('treatment')}:</h4>
                <div className="flex flex-col gap-2">
                  {formData.medications.map((medication, idx) => (
                    medication.trim() &&
                      <div key={idx} className="flex items-start gap-2 bg-green-50 p-2 rounded border border-green-200">
                        <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mt-1 flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-gray-800">{medication}</span>
                      </div>
                  ))}
                </div>
              </div>

              {!!formData.notes && (
                <div className="mb-5">
                  <h4 className="font-semibold text-gray-700 mb-1 border-b border-gray-300 pb-1">{t('instructions')}:</h4>
                  <p className="text-gray-800 bg-blue-50 p-2 rounded border border-blue-200 whitespace-pre-wrap">
                    {formData.notes}
                  </p>
                </div>
              )}

              {!!formData.followUpDate && (
                <div className="mb-5">
                  <h4 className="font-semibold text-gray-700 mb-1 border-b border-gray-300 pb-1">{t('followup_date')}:</h4>
                  <p className="text-gray-800 bg-purple-50 p-2 rounded border border-purple-200">
                    {new Date(formData.followUpDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                  </p>
                </div>
              )}

              <div className="text-center mt-6 pt-3 border-t border-gray-400">
                <span className="inline-block border-t border-gray-600 pt-2 text-gray-700 font-semibold">{t('doctor_signature')}</span>
              </div>
            </div>
          )}

          {/* Prescription Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-4">
            <h4 className={`text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              {t('prescription_tips')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 sm:gap-2 text-blue-800 text-xs sm:text-sm">
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="text-green-600">•</span>
                <span>{t('write_medication_name')}</span>
              </div>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="text-green-600">•</span>
                <span>{t('specify_treatment_duration')}</span>
              </div>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="text-green-600">•</span>
                <span>{t('mention_usage_method')}</span>
              </div>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="text-green-600">•</span>
                <span>{t('set_followup_if_needed')}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`flex flex-wrap-reverse sm:flex-nowrap gap-2 justify-between items-center pt-4 border-t mt-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'prescription' ? 'preview' : 'prescription')}
                className="btn-secondary w-full sm:w-auto"
              >
                {activeTab === 'prescription' ? t('preview_prescription') : t('edit_prescription')}
              </button>
            </div>

            <div className={`flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary w-full sm:w-auto"
                disabled={loading}
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full sm:w-auto"
              >
                {loading
                  ? <LoadingSpinner size="sm" />
                  : t('save_prescription_complete')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteAppointment;