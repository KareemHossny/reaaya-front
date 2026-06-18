import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    age: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // التحقق من كلمة المرور
    if (formData.password !== formData.confirmPassword) {
      setError(t('passwords_do_not_match'));
      toast.error(t('passwords_do_not_match'));
      setLoading(false);
      return;
    }

    // التحقق من طول كلمة المرور
    if (formData.password.length < 6) {
      setError(t('password_min_length'));
      toast.error(t('password_min_length'));
      setLoading(false);
      return;
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t('invalid_email'));
      toast.error(t('invalid_email'));
      setLoading(false);
      return;
    }

    // التحقق من الاسم
    if (formData.name.trim().length < 2) {
      setError(t('name_min_length'));
      toast.error(t('name_min_length'));
      setLoading(false);
      return;
    }

    // تحقق من العمر (مطلوب وأن يكون رقم موجب وبسيط)
    if (!formData.age || isNaN(formData.age) || Number(formData.age) < 0 || formData.age.trim() === '') {
      setError(t('invalid_age'));
      toast.error(t('invalid_age'));
      setLoading(false);
      return;
    }

    const userData = {
      name: formData.name.trim(),
      email: formData.email.toLowerCase(),
      password: formData.password,
      phone: formData.phone,
      age: formData.age.trim()
    };

    // إشعار تحميل
    const loadingToast = toast.loading(t('creating_account'));

    const result = await register(userData);

    // إغلاق إشعار التحميل
    toast.dismiss(loadingToast);

    if (result.success) {
      toast.success(t('account_created_success'), {
        duration: 3000,
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      setError(result.message);
      toast.error(result.message || t('account_creation_failed'), {
        duration: 5000,
      });
    }

    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
  
    try {
      const result = await googleLogin(credentialResponse.credential);
  
      if (result.success) {
        if (result.requiresProfileCompletion) {
          toast.success(t('registration_success_complete_profile'));
          navigate('/complete-profile');
        } else {
          toast.success(t('google_login_success'));
          navigate('/dashboard');
        }
      } else {
        setError(result.message);
        toast.error(result.message || t('google_login_failed'));
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError(t('google_login_error'));
      toast.error(t('google_login_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error(t('google_registration_failed'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-50 via-primary-50 to-white py-12 px-4 sm:px-6 lg:px-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full mx-auto bg-white shadow-xl rounded-2xl p-8 space-y-8 border border-gray-100">
        <div>
          <h2 className="text-center text-4xl font-extrabold text-primary-700 tracking-tight drop-shadow-sm">
            {t('create_new_account')}
          </h2>
          <p className="mt-3 text-center text-base text-gray-500">
            {t('already_have_account')}{' '}
            <Link
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-500 transition-colors duration-200"
            >
              {t('login')}
            </Link>
          </p>
        </div>

        {/* زر التسجيل بـ Google */}
        <div className="flex justify-center my-4">
          <div className="w-full max-w-xs">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="signup_with"
              locale={isRTL ? 'ar' : 'en'}
              shape="pill"
              width="100%"
            />
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">{t('or')}</span>
          </div>
        </div>

        <form className="space-y-6 mt-6 relative" onSubmit={handleSubmit} autoComplete="off">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm text-center shadow-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                {t('full_name')}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="form-input block w-full rounded-xl border-gray-200 shadow-sm focus:ring-primary-500 focus:border-primary-500 transition"
                placeholder={t('enter_full_name')}
                value={formData.name}
                onChange={handleChange}
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                {t('email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input block w-full rounded-xl border-gray-200 shadow-sm focus:ring-primary-500 focus:border-primary-500 transition"
                placeholder={t('enter_your_email')}
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                {t('age')}
              </label>
              <input
                id="age"
                name="age"
                type="number"
                required
                min="0"
                className="form-input block w-full rounded-xl border-gray-200 shadow-sm focus:ring-primary-500 focus:border-primary-500 transition"
                placeholder={t('enter_your_age')}
                value={formData.age}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                {t('phone_number')} 
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="form-input block w-full rounded-xl border-gray-200 shadow-sm focus:ring-primary-500 focus:border-primary-500 transition text-right placeholder:text-right"
                placeholder={t('enter_your_phone')}
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                {t('password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="form-input block w-full rounded-xl border-gray-200 shadow-sm focus:ring-primary-500 focus:border-primary-500 transition"
                placeholder={t('password_min_placeholder')}
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                {t('confirm_password')}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="form-input block w-full rounded-xl border-gray-200 shadow-sm focus:ring-primary-500 focus:border-primary-500 transition"
                placeholder={t('re_enter_password')}
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full py-3 rounded-xl text-base font-bold transition-all duration-200 flex items-center justify-center ${
                loading ? 'opacity-80 cursor-not-allowed' : ''
              }`}
            >
              {loading ? <LoadingSpinner size="sm" /> : t('create_account')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;