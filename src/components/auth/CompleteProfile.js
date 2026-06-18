import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const CompleteProfile = () => {
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, completeProfile, requiresProfileCompletion } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // إذا كان المستخدم مكمل البروفايل خلاص، ا redirect للـ dashboard
  useEffect(() => {
    if (!requiresProfileCompletion && user?.age) {
      navigate('/dashboard', { replace: true });
    }
  }, [requiresProfileCompletion, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!age || isNaN(age) || Number(age) < 1 || Number(age) > 150) {
      toast.error(t('please_enter_valid_age'));
      return;
    }

    setLoading(true);
    
    try {
      const result = await completeProfile({ age, phone });
      
      if (result.success) {
        toast.success(t('profile_completed_success'));
        navigate('/dashboard', { replace: true });
      } else {
        toast.error(result.message || t('profile_completion_failed'));
      }
    } catch (error) {
      toast.error(t('profile_completion_error'));
    } finally {
      setLoading(false);
    }
  };

  if (!requiresProfileCompletion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-50 via-primary-50 to-white py-12 px-4 sm:px-6 lg:px-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full mx-auto bg-white shadow-xl rounded-2xl p-8 space-y-8 border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-bold text-primary-700">
            {t('complete_your_profile')}
          </h2>
          <p className="mt-3 text-center text-gray-600">
            {t('welcome')} {user?.name}!
            <br />
            {t('need_additional_info')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
              {t('age')} *
            </label>
            <input
              id="age"
              type="number"
              required
              min="1"
              max="150"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={t('enter_your_age')}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              {t('phone_number')} 
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={t('enter_your_phone')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-semibold transition duration-200 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <LoadingSpinner size="sm" /> : t('complete_registration_go_to_dashboard')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;