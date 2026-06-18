import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { publicAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  MagnifyingGlassIcon,
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

// Optimized Animated Section Component
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

// صور افتراضية للتخصصات (كحالة احتياطية)
const defaultSpecializationImage = '/images/istockphoto-1409442714-612x612.jpg';

// Memoized Specialization Card Component
const SpecializationCard = memo(({ specialization }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [imageError, setImageError] = useState(false);

  // استخدام دالة الترجمة
  const translatedName = translateMedicalText(specialization.name, i18n.language);
  const translatedDescription = specialization.description ? 
    translateMedicalText(specialization.description, i18n.language) : '';

  // الحصول على صورة التخصص من API أو استخدام الصورة الافتراضية
  const getSpecializationImage = useCallback(() => {
    // إذا كانت هناك صورة من API ولم يحدث خطأ
    if (specialization.image && !imageError) {
      return specialization.image;
    }
    // استخدام الصورة الافتراضية
    return defaultSpecializationImage;
  }, [specialization.image, imageError]);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      key={specialization._id}
      className="relative bg-white rounded-2xl shadow-xl group overflow-hidden border border-primary-100 hover:border-primary-500 hover:shadow-2xl hover:scale-105 transition-all duration-200"
    >
      <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-primary-200 to-primary-100 group-hover:from-primary-600 group-hover:to-primary-400 transition-all" />
      <div className="flex flex-col items-center p-0">
        <div className="mb-4 w-full h-44 flex-shrink-0">
          <img
            src={getSpecializationImage()}
            alt={translatedName}
            className="w-full h-full object-cover"
            onError={handleImageError}
            loading="lazy"
          />
        </div>
        <div className="p-7 w-full flex flex-col items-center">
          <h3 className="text-2xl font-extrabold text-primary-900 mb-2 group-hover:text-primary-700 transition-all">
            {translatedName}
          </h3>
          {translatedDescription && (
            <p className="text-gray-600 text-center mb-5 px-2 leading-relaxed font-light">
              {translatedDescription}
            </p>
          )}
          <Link
            to={`/doctors?specialization=${specialization._id}`}
            className="mt-4 inline-flex items-center justify-center gap-2 px-7 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-primary-700 text-white font-bold shadow hover:from-primary-600 hover:to-primary-800 hover:scale-105 transition-all duration-150 text-base group"
          >
            <span>{t('view_specialized_doctors')}</span>
            <svg className={`w-5 h-5 ${isRTL ? 'rtl:rotate-180' : ''} group-hover:translate-x-1 transition-transform duration-200`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
});

// Memoized Feature Step Component
const FeatureStep = memo(({ step, index }) => {
  const colors = useMemo(() => ['primary', 'green', 'blue'], []);
  const color = colors[index % colors.length];
  
  return (
    <motion.div 
      className="flex items-start gap-5"
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.2 + 0.3 }}
      viewport={{ once: true }}
    >
      <motion.div 
        className={`w-14 h-14 bg-${color}-100 shadow-md rounded-full flex items-center justify-center flex-shrink-0`}
        whileHover={{ 
          scale: 1.1,
          rotate: 360,
          transition: { duration: 0.5 }
        }}
      >
        <span className={`text-2xl font-bold text-${color}-600`}>{step.number}</span>
      </motion.div>
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">{step.title}</h3>
        <p className="text-gray-600 text-base leading-relaxed">
          {step.description}
        </p>
      </div>
    </motion.div>
  );
});

// Memoized Contact Info Component
const ContactInfo = memo(({ item, index }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <motion.div 
      className="flex items-center text-primary-800 text-base font-semibold"
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 + 0.5 }}
      viewport={{ once: true }}
    >
      <motion.span 
        className={`bg-primary-200 p-2 rounded-lg ${isRTL ? 'mr-2' : 'ml-2'} flex items-center justify-center`}
        whileHover={{ scale: 1.1 }}
      >
        <item.icon className="w-6 h-6 text-primary-600" />
      </motion.span>
      <span dir={item.dir} className="select-all">{item.text}</span>
    </motion.div>
  );
});

// Memoized NoResults Component
const NoResults = memo(({ searchTerm }) => {
  const { t } = useTranslation();

  return (
    <div className="text-center py-16">
      <div className="flex justify-center mb-4">
        <MagnifyingGlassIcon className="w-20 h-20 text-primary-200" />
      </div>
      <h3 className="text-2xl font-bold text-primary-800 mb-3">
        {t('no_results')}
      </h3>
      <p className="text-primary-700 text-lg">
        {searchTerm 
          ? t('no_specializations_found')
          : t('no_specializations_available')}
      </p>
    </div>
  );
});

const Specializations = () => {
  const { t, i18n } = useTranslation();
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const isRTL = i18n.language === 'ar';

  // useCallback للدوال
  const fetchSpecializations = useCallback(async () => {
    try {
      const response = await publicAPI.getSpecializations();
      setSpecializations(response.data);
    } catch (error) {
      console.error('Error fetching specializations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpecializations();
  }, [fetchSpecializations]);

  // useMemo للقيم المكلفة
  const filteredSpecializations = useMemo(() => {
    return specializations.filter(spec => {
      const translatedName = translateMedicalText(spec.name, i18n.language);
      const searchLower = searchTerm.toLowerCase();
      
      return (
        translatedName.toLowerCase().includes(searchLower) ||
        spec.name.toLowerCase().includes(searchLower) ||
        (spec.description && spec.description.toLowerCase().includes(searchLower))
      );
    });
  }, [specializations, searchTerm, i18n.language]);

  // useCallback ل event handlers
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Memoized hero background animation
  const heroBackgroundAnimation = useCallback(() => (
    <>
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
    </>
  ), []);

  // Memoized CTA background animation
  const ctaBackgroundAnimation = useCallback(() => (
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
  ), []);

  // Memoized static data
  const featureSteps = useMemo(() => [
    {
      number: '1',
      title: t('know_your_health'),
      description: t('know_your_health_description')
    },
    {
      number: '2',
      title: t('consult_specialists'),
      description: t('consult_specialists_description')
    },
    {
      number: '3',
      title: t('choose_right_doctor'),
      description: t('choose_right_doctor_description')
    }
  ], [t]);

  const contactItems = useMemo(() => [
    { icon: PhoneIcon, text: '0123456789', dir: 'ltr' },
    { icon: ChatBubbleLeftRightIcon, text: t('free_medical_consultation'), dir: isRTL ? 'rtl' : 'ltr' },
    { icon: ClockIcon, text: t('reception_service_24_7'), dir: isRTL ? 'rtl' : 'ltr' }
  ], [t, isRTL]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* الهيرو مع انيميشنات - أول سيكشن */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 relative overflow-hidden">
        {heroBackgroundAnimation()}
        
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
              {t('medical_specialties')}
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
              {t('specializations_hero_description')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* البحث - بدون animations */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-black text-primary-900 mb-4 drop-shadow-sm">{t('find_right_specialization')}</h2>
            <p className="text-gray-600">
              {t('search_specialization_description')}
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <input
              type="text"
              placeholder={t('search_medical_specialty')}
              value={searchTerm}
              onChange={handleSearchChange}
              className="form-input text-lg py-3"
            />
          </div>
        </div>
      </section>

      {/* قائمة التخصصات - بدون animations */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-primary-900 mb-2 tracking-tight drop-shadow-sm">
              {t('our_diverse_medical_specialties')}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-light">
              {t('specialties_description')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredSpecializations.map((specialization) => (
              <SpecializationCard key={specialization._id} specialization={specialization} />
            ))}
          </div>

          {filteredSpecializations.length === 0 && (
            <NoResults searchTerm={searchTerm} />
          )}
        </div>
      </section>

      {/* معلومات إضافية مع انيميشنات - رابع سيكشن */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* أسباب اختيار التخصص الصحيح */}
            <AnimatedSection variants={fadeInRight}>
              <div>
                <motion.h2 
                  className="text-4xl md:text-5xl font-extrabold text-primary-900 mb-7 drop-shadow-sm"
                  variants={fadeInUp}
                >
                  {t('why_choose_right_specialty')}
                </motion.h2>
                <div className="space-y-7">
                  {featureSteps.map((step, index) => (
                    <FeatureStep key={index} step={step} index={index} />
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* صندوق استفسار ومساعدة */}
            <AnimatedSection variants={fadeInLeft}>
              <motion.div 
                className="bg-gradient-to-br from-primary-50 via-white to-primary-100 rounded-3xl shadow-lg p-10 border border-primary-100"
                whileHover={{ 
                  y: -5,
                  transition: { duration: 0.3 }
                }}
              >
                <h3 className="text-3xl font-extrabold text-primary-900 mb-5 tracking-tight">
                  {t('need_help_choosing')}
                </h3>
                <p className="text-primary-800 mb-8 text-lg leading-relaxed">
                  {t('help_choosing_description')}
                </p>
                <div className="space-y-5">
                  {contactItems.map((item, index) => (
                    <ContactInfo key={index} item={item} index={index} />
                  ))}
                </div>
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* دعوة للعمل مع انيميشنات - خامس سيكشن */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        {ctaBackgroundAnimation()}
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <AnimatedSection>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-6 text-white"
              variants={fadeInUp}
            >
              {t('found_right_specialty')}
            </motion.h2>
            <motion.p 
              className="text-xl mb-8 opacity-90 text-white"
              variants={fadeInUp}
            >
              {t('found_specialty_description')}
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
                  to="/doctors"
                  className="bg-yellow-400 hover:bg-transparent border-2 border-yellow-400 hover:border-white hover:text-white text-primary-900 px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 block"
                >
                  {t('view_specialized_doctors')}
                </Link>
              </motion.div>
              <motion.div
                variants={fadeInLeft}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/contact"
                  className="border-2 border-white hover:bg-yellow-400 hover:text-primary-900 hover:border-yellow-400 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 block"
                >
                  {t('medical_consultation')}
                </Link>
              </motion.div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default memo(Specializations);