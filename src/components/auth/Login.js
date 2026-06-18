import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, googleLogin } = useAuth();
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

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success(t('login_success'));
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      setError(result.message);
      toast.error(result.message || t('login_failed'));
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
    toast.error(t('google_login_failed'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-50 via-primary-50 to-white py-12 px-4 sm:px-6 lg:px-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full mx-auto bg-white shadow-xl rounded-2xl p-8 space-y-8 border border-gray-100">
        <div>
          <h2 className="text-center text-4xl font-extrabold text-primary-700 tracking-tight drop-shadow-sm">
            {t('welcome_back')}
          </h2>
          <p className="mt-3 text-center text-base text-gray-500">
            {t('login_to_continue')}
          </p>
          <div className="mt-2 text-center text-sm">
            <span className="text-gray-500">{t('dont_have_account')} </span>
            <Link
              to="/register"
              className="font-semibold text-primary-600 hover:text-primary-500 transition-colors duration-200"
            >
              {t('create_new_account')}
            </Link>
          </div>
        </div>

        {/* زر تسجيل الدخول بـ Google */}
        <div className="flex justify-center my-4 ">
          <div className="w-full md:w-[320px] ">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="continue_with"
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

        <form
          className="space-y-6 mt-6 relative"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg font-semibold text-center shadow-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="relative">
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                {t('email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full px-4 py-3 text-base rounded-lg border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 bg-gray-50 shadow-sm transition"
                placeholder="mail@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                {t('password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full px-4 py-3 text-base rounded-lg border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 bg-gray-50 shadow-sm transition"
                placeholder={t('password_placeholder')}
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-bold text-lg shadow-md transition
                ${loading
                ? 'bg-primary-300 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 focus:ring-2 focus:ring-primary-200'
                }`}
            >
              {loading ? (
                <span className="flex justify-center">
                  <LoadingSpinner size="sm" />
                </span>
              ) : (
                t('login')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;