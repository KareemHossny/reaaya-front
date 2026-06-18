import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { ShieldCheckIcon, UserIcon, LanguageIcon } from "@heroicons/react/24/outline";

const Header = () => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const getRoleText = (role) => {
    const roles = {
      patient: t('patient'),
      doctor: t('doctor'),
      admin: t('admin')
    };
    return roles[role] || role;
  };

  // اللينكات الأساسية في الهيدر
  const navLinks = [
    { to: '/', label: t('home'), exact: true },
    { to: '/about', label: t('about') },
    { to: '/services', label: t('services') },
    { to: '/doctors', label: t('doctors') },
    { to: '/specializations', label: t('specializations') },
    { to: '/contact', label: t('contact') },
  ];

  const getNavLinkClass = (to, exact = false) => {
    const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
    return (
      (isActive
        ? 'text-primary-700 border-b-4 border-primary-700 font-bold'
        : 'text-gray-700 hover:text-primary-600 ') +
      'font-medium transition-colors duration-200 px-3 py-2 rounded-lg'
    );
  };

  const isRTL = i18n.language === 'ar';

  return (
    <header className="bg-white sticky top-0 shadow-lg z-[9999]" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* الشعار واسم المركز */}
          <div className={`flex items-center ${isRTL ? 'space-x-4 space-x-reverse' : 'space-x-4'}`}>
            <Link to="/" className={`flex items-center ${isRTL ? 'space-x-3 space-x-reverse' : 'space-x-3'}`}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary-50 shadow-md">
                <img 
                  src="images/Medical-Logo-Graphics-20827447-1-580x386.jpg" 
                  alt={t('medical_care_center')}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <span className="text-primary-600 font-bold text-lg hidden">🏥</span>
              </div>
              <div className={isRTL ? "text-right" : "text-left"}>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">{t('medical_care_center')}</h1>
                <p className="text-sm text-primary-600 font-medium mt-0.5">"{t('we_care_you_heal')}"</p>
              </div>
            </Link>
          </div>

          {/* قائمة التنقل - تظهر للجميع */}
          <nav className={`hidden lg:flex items-center ${isRTL ? 'space-x-1 space-x-reverse' : 'space-x-1'}`}>
            {navLinks.map(({ to, label, exact }) => (
              <Link
                key={to}
                to={to}
                className={getNavLinkClass(to, exact)}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* الجزء الأيمن (المستخدم أو تسجيل الدخول) */}
          <div className={`hidden lg:flex items-center ${isRTL ? 'space-x-4 space-x-reverse' : 'space-x-4'}`}>
            {/* زر تغيير اللغة */}
            <div className="flex items-center">
              <button
                onClick={() => changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors p-2 rounded-lg hover:bg-gray-50"
              >
                <LanguageIcon className="w-5 h-5" />
                <span className="text-sm font-medium">{i18n.language === 'ar' ? 'EN' : 'العربية'}</span>
              </button>
            </div>

            {user ? (
              <div className={`flex items-center ${isRTL ? 'space-x-4 space-x-reverse' : 'space-x-4'}`}>
                <div className={`flex items-center ${isRTL ? 'space-x-3 space-x-reverse' : 'space-x-3'}`}>
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <p className="text-sm font-medium text-gray-900 leading-tight">{t('welcome')}, {user.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{getRoleText(user.role)}</p>
                  </div>
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {user.role === 'doctor' ? '🥼' : 
                     user.role === 'admin' ? <ShieldCheckIcon className="h-5 w-5 text-primary-600" /> : <UserIcon className="h-5 w-5 text-primary-600" />}
                  </div>
                </div>
                <div className={`flex items-center ${isRTL ? 'space-x-3 space-x-reverse' : 'space-x-3'}`}>
                  <Link
                    to="/dashboard"
                    className={
                      location.pathname.startsWith('/dashboard')
                        ? "bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md"
                        : "bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md hover:shadow-lg"
                    }
                  >
                    {t('dashboard')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t('logout')}
                  </button>
                </div>
              </div>
            ) : (
              <div className={`flex items-center ${isRTL ? 'space-x-4 space-x-reverse' : 'space-x-4'}`}>
                <Link
                  to="/login"
                  className={
                    location.pathname === '/login'
                      ? "text-primary-700 font-bold px-4 py-2 rounded-lg bg-primary-50"
                      : "text-gray-700 hover:text-primary-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  }
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className={
                    location.pathname === '/register'
                      ? "bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md"
                      : "bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md hover:shadow-lg"
                  }
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          {/* زر القائمة للموبايل */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="text-2xl text-gray-700">☰</span>
          </button>
        </div>

        {/* القائمة المتنقلة للموبايل */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 bg-white">
            {/* زر تغيير اللغة في الموبايل */}
            <div className="flex justify-center mb-4">
              <button
                onClick={() => changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors px-4 py-3 rounded-lg bg-gray-50 w-full justify-center"
              >
                <LanguageIcon className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {i18n.language === 'ar' ? 'Switch to English' : 'التغيير إلى العربية'}
                </span>
              </button>
            </div>

            <nav className="flex flex-col space-y-2">
              {navLinks.map(({ to, label, exact }) => (
                <Link
                  key={to}
                  to={to}
                  className={getNavLinkClass(to, exact) + ' text-center'}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className={
                      location.pathname.startsWith('/dashboard')
                        ? "bg-primary-700 text-white px-4 py-3 rounded-lg text-sm font-bold text-center"
                        : "bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg text-sm font-medium text-center transition-colors"
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('dashboard')}
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-gray-700 hover:text-primary-600 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors text-center"
                  >
                    {t('logout')}
                  </button>
                </>
              )}
              {!user && (
                <>
                  <Link
                    to="/login"
                    className={
                      location.pathname === '/login'
                        ? "bg-primary-700 text-white px-4 py-3 rounded-lg text-sm font-bold text-center"
                        : "bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg text-sm font-medium text-center transition-colors"
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    className={
                      location.pathname === '/register'
                        ? "bg-primary-700 text-white px-4 py-3 rounded-lg text-sm font-bold text-center"
                        : "bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg text-sm font-medium text-center transition-colors"
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('register')}
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;