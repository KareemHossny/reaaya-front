import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { publicAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PhoneIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

// Framer Motion imports للـ animations فقط
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// utils
import { translateMedicalText } from '../../utils/medicalTranslator';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
};

const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
};

const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

// Animated Section Component مع memo
const AnimatedSection = memo(({ children, className = "", variants = fadeInUp }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate={inView ? "animate" : "initial"}
      variants={variants}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

// Memoized Doctor Icon Component
const DoctorIcon = memo(({ specializationName }) => {
  const icons = useMemo(() => ({
    'طب القلب': UserIcon,
    'طب الأطفال': UserIcon,
    'جراحة العظام': UserIcon,
    'طب العيون': UserIcon,
    'طب الأسنان': UserIcon,
    'طب الأعصاب': UserIcon,
    'الجراحة العامة': UserIcon,
    'النساء والتوليد': UserIcon,
    'الجلدية': UserIcon,
    'الباطنة': UserIcon,
    'الأنف والأذن': UserIcon,
    'الجهاز الهضمي': UserIcon,
  }), []);

  const IconComponent = icons[specializationName] || BuildingOfficeIcon;
  return <IconComponent className="w-12 h-12 text-primary-600" />;
});

// Memoized Doctor Card Component
const DoctorCard = memo(({ doctor }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // استخدام دالة الترجمة
  const translatedDoctorName = translateMedicalText(doctor.name, i18n.language);
  const translatedSpecializationName = doctor.specialization ? 
    translateMedicalText(doctor.specialization.name, i18n.language) : '';

  const getDaysCount = useCallback((availability) => {
    return availability ? availability.length : 0;
  }, []);

  const getExperienceText = (years) => {
    if (years === 1) return `${years} ${t('year')}`;
    if (years === 2) return `${years} ${t('two_years')}`;
    if (years >= 3 && years <= 10) return `${years} ${t('years')}`;
    return `${years} ${t('year')}`;
  };

  return (
    <div
      key={doctor._id}
      className="relative group overflow-visible min-h-[420px]"
    >
      {/* Decorative border & glow */}
      <div className="absolute -inset-1 top-3.5 left-3.5 z-0 rounded-2xl bg-gradient-to-br from-primary-200/60 to-yellow-100/30 to-90% blur-[2px] opacity-80 pointer-events-none transition-all group-hover:-inset-2 group-hover:opacity-100 group-hover:blur-lg"></div>
      
      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-primary-100 group-hover:border-primary-300/80 p-6 md:p-8 min-h-[410px] flex flex-col justify-between group-hover:scale-105 group-hover:-translate-y-2 transition-transform duration-300">
        {/* Avatar circle with ring */}
        <div className="flex flex-col items-center mb-4 -mt-14">
          <div className="relative mb-1">
            <span className="absolute -inset-2 rounded-full bg-gradient-to-br from-yellow-300/70 via-primary-100/70 to-yellow-100/50 blur-lg opacity-65"></span>
            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full ring-4 ring-primary-200 shadow-md z-10 bg-gradient-to-br from-primary-50 via-white to-primary-200 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-200">
              {doctor.profileImage ? (
                <img
                  src={doctor.profileImage}
                  alt={translatedDoctorName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="group-hover:rotate-360 transition-transform duration-600">
                  <DoctorIcon specializationName={doctor.specialization?.name} />
                </div>
              )}
            </div>
          </div>
          
          <h3 className="mt-2 text-xl md:text-2xl font-extrabold text-primary-800 mb-1 drop-shadow-sm group-hover:scale-105 transition-transform duration-200">
            {isRTL ? `د/ ${translatedDoctorName}` : `Dr. ${translatedDoctorName}`}
          </h3>
          
          <span className="text-primary-700 font-semibold text-base md:text-lg px-3 py-1 rounded-full bg-yellow-100 bg-opacity-60 border border-yellow-200/40 shadow-sm group-hover:scale-110 transition-transform duration-200">
            {translatedSpecializationName || doctor.specialization?.name}
          </span>
          
          {/* خبرة الطبيب */}
          {typeof doctor.experienceYears === 'number' && (
            <span className="mt-2 text-primary-600 font-bold text-[15px] md:text-base px-3 py-1 rounded-full bg-primary-100 bg-opacity-60 border border-primary-200/40 shadow-sm block group-hover:scale-110 transition-transform duration-200">
              {t('experience_years')} {getExperienceText(doctor.experienceYears)}
            </span>
          )}
        </div>
        
        {/* Details */}
        <div className="text-base text-gray-700 font-medium mt-5 mb-8 text-center space-y-2">
          {doctor.phone && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary-50/90 border border-primary-100 text-primary-800 shadow-sm text-base font-bold transition group-hover:scale-105">
              <div className="group-hover:rotate-12 transition-transform duration-500">
                <PhoneIcon className="w-5 h-5 text-primary-700" />
              </div>
              <span dir="ltr" style={{ direction: "ltr" }}>{doctor.phone}</span>
            </div>
          )}
          
          {doctor.availability && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-yellow-50/70 border border-yellow-100 text-yellow-900 shadow-sm text-base font-semibold transition group-hover:scale-105">
              <div className="group-hover:rotate-360 transition-transform duration-600">
                <ClockIcon className="w-5 h-5 text-yellow-600" />
              </div>
              <span>{getDaysCount(doctor.availability)} {t('work_days')}</span>
            </div>
          )}
        </div>
        
        {/* Book button */}
        <div className="mt-auto pt-3 text-center relative">
          <Link
            to="/dashboard"
            className="inline-flex justify-center items-center gap-2 w-full rounded-xl bg-gradient-to-r from-primary-700 to-primary-900 text-yellow-300 font-bold text-lg py-3 shadow-md hover:from-yellow-400 hover:to-yellow-500 hover:text-primary-900 hover:scale-105 transition-all duration-150 ring-1 ring-primary-900/10 focus:outline-none focus:ring-4 focus:ring-yellow-300/20 group"
            style={{
              letterSpacing: '0.02em'
            }}
          >
            <span className="font-bold">{t('book_appointment')}</span>
            <svg className={`w-6 h-6 ${isRTL ? 'rtl:rotate-180' : ''} group-hover:translate-x-1 transition-transform duration-200`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <span className="block mt-2 text-xs text-gray-400">* {t('requires_login')}</span>
        </div>
      </div>
    </div>
  );
});

// Memoized NoResults Component
const NoResults = memo(({ searchTerm, selectedSpecialization }) => {
  const { t } = useTranslation();

  return (
    <div className="text-center py-20">
      <div className="flex justify-center mb-4">
        <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
        </svg>
      </div>
      <h3 className="text-xl font-extrabold text-primary-800 mb-2">
        {t('no_results')}
      </h3>
      <p className="text-gray-600 text-lg">
        {searchTerm || selectedSpecialization
          ? t('no_doctors_found')
          : t('no_doctors_available')}
      </p>
    </div>
  );
});

const Doctors = () => {
  const { t, i18n } = useTranslation();
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');

  const isRTL = i18n.language === 'ar';

  // useCallback للدوال
  const fetchDoctors = useCallback(async () => {
    try {
      const response = await publicAPI.getDoctors();
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSpecializations = useCallback(async () => {
    try {
      const response = await publicAPI.getSpecializations();
      setSpecializations(response.data);
    } catch (error) {
      console.error('Error fetching specializations:', error);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
    fetchSpecializations();
  }, [fetchDoctors, fetchSpecializations]);

  // useMemo للقيم المكلفة
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialization =
        !selectedSpecialization ||
        doctor.specialization?._id === selectedSpecialization;
      return matchesSearch && matchesSpecialization;
    });
  }, [doctors, searchTerm, selectedSpecialization]);

  // useCallback ل event handlers
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSpecializationChange = useCallback((e) => {
    setSelectedSpecialization(e.target.value);
  }, []);

  // useMemo لل options
  const specializationOptions = useMemo(() => {
    return specializations.map((spec) => (
      <option key={spec._id} value={spec._id}>
        {translateMedicalText(spec.name, i18n.language)}
      </option>
    ));
  }, [specializations, i18n.language]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* الهيرو مع انيميشنات - أول سيكشن */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div 
          className="absolute top-10 left-10 w-20 h-20 bg-yellow-300/10 rounded-full blur-xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-6 text-yellow-300 drop-shadow-[0_2px_12px_rgba(250,200,50,0.3)]"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
            >
              {t('doctors_team')}
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl mb-8 font-arabic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              "{t('we_care_you_heal')}"
            </motion.p>
            <motion.p 
              className="text-lg max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {t('doctors_hero_description')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* البحث والتصفية - بدون animations */}
      <section className="py-12 bg-white relative z-10" style={{ marginTop: '-60px' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={t('search_doctor_by_name')}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="form-input text-lg py-3"
                />
              </div>
              <div className="sm:w-64">
                <select
                  value={selectedSpecialization}
                  onChange={handleSpecializationChange}
                  className="form-input text-lg py-3"
                >
                  <option value="">{t('all_specializations')}</option>
                  {specializationOptions}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* قائمة الأطباء - بدون animations */}
      <section className="py-24 bg-gradient-to-bl from-primary-50 via-white to-primary-100 min-h-[60vh] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-4 md:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 lg:gap-12">
            {filteredDoctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))}
          </div>

          {/* No results */}
          {filteredDoctors.length === 0 && (
            <NoResults searchTerm={searchTerm} selectedSpecialization={selectedSpecialization} />
          )}
        </div>
        
        {/* Background Decorative SVGs */}
        <svg className="hidden sm:block absolute opacity-50 left-0 top-0 w-48 md:w-64 rotate-12 -translate-y-12 -translate-x-10 pointer-events-none" viewBox="0 0 181 170" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="90.5" cy="85" rx="90.5" ry="85" fill="#e0e7ff" fillOpacity="0.08"/>
        </svg>
        <svg className="hidden sm:block absolute opacity-50 right-0 bottom-0 w-52 md:w-80 -rotate-12 translate-y-16 translate-x-8 pointer-events-none" viewBox="0 0 217 170" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="108" cy="85" rx="108" ry="85" fill="#fde68a" fillOpacity="0.07"/>
        </svg>
      </section>

      {/* دعوة للتسجيل مع انيميشنات - آخر سيكشن */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        {/* Animated background */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <AnimatedSection>
            <motion.h3 
              className="text-3xl md:text-4xl font-bold mb-6 text-white"
              variants={fadeInUp}
            >
              {t('join_care_center_family')}
            </motion.h3>
            <motion.p 
              className="text-xl mb-8 opacity-90 text-white"
              variants={fadeInUp}
            >
              {t('register_now_description')}
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={staggerContainer}
            >
              <motion.div
                variants={fadeInRight}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/register"
                  className="bg-yellow-400 hover:bg-transparent border-2 border-yellow-400 hover:border-white hover:text-white text-primary-900 px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 block"
                >
                  {t('create_new_account')}
                </Link>
              </motion.div>
              <motion.div
                variants={fadeInLeft}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login"
                  className="border-2 border-white hover:bg-yellow-400 hover:text-primary-900 hover:border-yellow-400 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 block"
                >
                  {t('login')}
                </Link>
              </motion.div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default memo(Doctors);