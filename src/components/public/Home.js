import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  UserIcon,
  PhoneIcon,
  ClockIcon,
  AcademicCapIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';
import { publicAPI } from '../../services/publicAPI';

// استيراد دالة الترجمة الطبية
import { translateMedicalText } from '../../utils/medicalTranslator';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Framer Motion for animations
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const heroImage = '/images/istockphoto-1409442714-612x612.jpg';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
};

const slideInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
};

const slideInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
};

// Optimized Animated Component Wrapper
const AnimatedSection = memo(({ children, className = "" }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate={inView ? "animate" : "initial"}
      variants={fadeInUp}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
});

// Memoized Feature Card Component
const FeatureCard = memo(({ feature, index }) => {
  const IconComponent = feature.icon;
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  return (
    <motion.div
      variants={fadeInUp}
      className="bg-white p-8 rounded-2xl shadow-lg text-center group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-t-4 hover:border-primary-600 border-transparent transform-gpu"
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3 }
      }}
      style={{ willChange: 'transform' }}
    >
      <motion.div 
        className="flex justify-center mb-6"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <span className="inline-flex items-center justify-center rounded-full bg-primary-50 group-hover:bg-primary-100 transition-all duration-200 p-4 shadow transform-gpu">
          <IconComponent className="w-12 h-12 text-primary-600" />
        </span>
      </motion.div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-700 transition-all">
        {feature.title}
      </h3>
      <p className="text-gray-600 leading-relaxed font-light">
        {feature.description}
      </p>
    </motion.div>
  );
});

// Memoized Doctor Card Component
const DoctorCard = memo(({ doctor }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // استخدام دالة الترجمة الطبية لتخصص الطبيب
  const translatedSpecialization = translateMedicalText(
    doctor.specialization?.name || (isRTL ? 'بدون تخصص' : 'No Specialization'), 
    i18n.language
  );

  const getExperienceText = (years) => {
    if (years === 1) return `${years} ${t('year')}`;
    if (years === 2) return `${years} ${t('two_years')}`;
    if (years >= 3 && years <= 10) return `${years} ${t('years')}`;
    return `${years} ${t('year')}`;
  };

  return (
    <motion.div 
      className="flex flex-col h-full bg-white shadow-xl hover:shadow-2xl rounded-2xl border border-primary-100 transition-all duration-300 overflow-hidden group/card mx-0 transform-gpu"
      whileHover={{ 
        y: -5,
        transition: { duration: 0.3 }
      }}
      style={{ willChange: 'transform' }}
    >
      {/* صورة الطبيب */}
      <div className="relative flex items-center justify-center h-48 bg-gradient-to-tr from-primary-50 via-primary-100 to-white">
        {doctor.profileImage ? (
          <motion.img
            src={doctor.profileImage}
            alt={doctor.name}
            className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg mx-auto my-6 ring-4 ring-yellow-300 group-hover/card:ring-primary-500 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            loading="lazy"
            decoding="async"
            style={{ willChange: 'transform' }}
          />
        ) : (
          <motion.div 
            className="w-28 h-28 bg-primary-200 rounded-full flex items-center justify-center border-4 border-white shadow-md"
            whileHover={{ scale: 1.05 }}
            style={{ willChange: 'transform' }}
          >
            <UserIcon className="w-14 h-14 text-primary-700" />
          </motion.div>
        )}
        <motion.div 
          className="absolute left-4 top-4 px-3 py-1.5 rounded-full bg-yellow-400 text-xs text-primary-900 font-bold shadow-md hidden md:block group-hover/card:scale-110 transition-all"
          whileHover={{ scale: 1.1 }}
          style={{ willChange: 'transform' }}
        >
          ⭐ {t('distinguished_doctor')}
        </motion.div>
      </div>

      {/* معلومات الطبيب */}
      <div className="flex-1 flex flex-col justify-between p-5 md:p-6 text-center">
        <div>
          <h3 className="text-lg md:text-xl font-extrabold text-primary-900 mb-1">
            {isRTL ? `د/ ${doctor.name}` : `Dr. ${doctor.name}`}
          </h3>
          <div className="flex items-center justify-center gap-2 mb-2">
            <AcademicCapIcon className="w-5 h-5 text-primary-600" />
            <p className="text-primary-600 text-sm font-medium">
              {translatedSpecialization}
            </p>
          </div>
          {doctor.experienceYears && (
            <div className="flex items-center justify-center gap-2 mb-2 text-yellow-700">
              <span className="text-xs font-semibold">
                {t('experience_years')} {getExperienceText(doctor.experienceYears)}
              </span>
            </div>
          )}
          {doctor.phone && (
            <div className="flex items-center justify-center gap-2 mb-2 text-primary-400">
              <PhoneIcon className="w-4 h-4" />
              <span className="text-xs">{doctor.phone}</span>
            </div>
          )}
          {doctor.availability && doctor.availability.length > 0 && (
            <div className="flex items-center justify-center gap-2 text-primary-400 mb-2">
              <ClockIcon className="w-4 h-4" />
              <span className="text-xs">
                {doctor.availability.length} {t('work_days')}
              </span>
            </div>
          )}
        </div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ willChange: 'transform' }}
        >
          <Link
            to="/doctors"
            className="block w-full mt-5 rounded-lg bg-gradient-to-r from-primary-700 to-primary-900 text-white font-bold text-base py-2.5 shadow hover:bg-primary-800 hover:from-primary-800 hover:to-primary-900 transition-colors transform-gpu"
          >
            {t('view_profile')}
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
});

// Optimized Counter Component
const Counter = memo(({ number }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  useEffect(() => {
    if (inView) {
      const target = parseInt(number.replace('+', ''));
      const duration = 1500;
      const steps = 30;
      const step = target / steps;
      let current = 0;
      let startTime = null;

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);
        
        current = Math.floor(target * percentage);
        
        if (current >= target) {
          setCount(target);
        } else {
          setCount(current);
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [inView, number]);

  return (
    <motion.div
      ref={ref}
      className="text-4xl md:text-5xl font-extrabold text-primary-700 mb-2 drop-shadow-sm"
      style={{ willChange: 'transform, opacity' }}
    >
      {count}+
    </motion.div>
  );
});

const Home = () => {
  const { t, i18n } = useTranslation();
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const isRTL = i18n.language === 'ar';

  // Memoized static data
  const features = useMemo(() => [
    {
      icon: AcademicCapIcon,
      title: t('best_doctors'),
      description: t('best_doctors_description'),
    },
    {
      icon: ClockIcon,
      title: t('online_booking'),
      description: t('online_booking_description'),
    },
    {
      icon: BuildingOfficeIcon,
      title: t('diverse_specializations'),
      description: t('diverse_specializations_description'),
    },
    {
      icon: DevicePhoneMobileIcon,
      title: t('service_24_7'),
      description: t('service_24_7_description'),
    },
  ], [t]);

  const stats = useMemo(() => [
    { number: '50+', label: t('specialized_doctors') },
    { number: '15+', label: t('medical_specialties') },
    { number: '3000+', label: t('satisfied_patient') },
    { number: '15+', label: t('years_experience') },
  ], [t]);

  // Optimized API call with useCallback
  const fetchDoctors = useCallback(async () => {
    try {
      const response = await publicAPI.getDoctors();
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoadingDoctors(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Memoized doctors section
  const doctorsSection = useMemo(() => {
    if (loadingDoctors || doctors.length === 0) return null;

    return (
      <AnimatedSection className="py-20 bg-gradient-to-b from-white via-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-black text-primary-900 mb-4 drop-shadow-sm">
              {t('our_medical_team')}
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto font-light">
              {t('medical_team_description')}
            </p>
          </motion.div>
          
          <motion.div 
            className="relative group"
            variants={fadeInUp}
          >
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              slidesPerView={1}
              spaceBetween={20}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 24 },
                1024: { slidesPerView: 3, spaceBetween: 32 },
                1280: { slidesPerView: 4, spaceBetween: 36 },
              }}
              navigation={{
                prevEl: '.doctors-swiper-prev',
                nextEl: '.doctors-swiper-next',
              }}
              pagination={{
                clickable: true,
                el: '.doctors-swiper-pagination',
                bulletClass: 'swiper-pagination-bullet custom-dot',
                bulletActiveClass: 'swiper-pagination-bullet-active custom-dot-active',
              }}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
              }}
              loop={doctors.length > 4}
              className="mySwiper"
            >
              {/* Navigation Buttons */}
              <motion.button
                className="doctors-swiper-prev absolute top-1/2 right-4 -translate-y-1/2 z-20 bg-white/90 group-hover:bg-primary-100/90 hover:bg-primary-200 transition-all duration-200 rounded-full shadow-xl border-2 border-primary-100 p-2 flex items-center justify-center"
                aria-label={isRTL ? "السابق" : "Previous"}
                style={{ boxShadow: "0 6px 20px 0 rgba(60, 100, 150, 0.15)" }}
                type="button"
                tabIndex={0}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRightIcon className="w-7 h-7 text-yellow-400" />
              </motion.button>
              <motion.button
                className="doctors-swiper-next absolute top-1/2 left-4 -translate-y-1/2 z-20 bg-white/90 group-hover:bg-primary-100/90 hover:bg-primary-200 transition-all duration-200 rounded-full shadow-xl border-2 border-primary-100 p-2 flex items-center justify-center"
                aria-label={isRTL ? "التالي" : "Next"}
                style={{ boxShadow: "0 6px 20px 0 rgba(60, 100, 150, 0.15)" }}
                type="button"
                tabIndex={0}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeftIcon className="w-7 h-7 text-yellow-400" />
              </motion.button>

              {doctors.map((doctor) => (
                <SwiperSlide key={doctor._id}>
                  <DoctorCard doctor={doctor} />
                </SwiperSlide>
              ))}

              {/* Pagination */}
              <div className="doctors-swiper-pagination flex justify-center gap-3 mt-8 pb-0" />
            </Swiper>
            
            <style>
              {`
                .custom-dot {
                  width: 0.75rem;
                  height: 0.625rem;
                  background: #dbeafe;
                  border-radius: 9999px;
                  margin: 0 4px;
                  transition: all 0.2s;
                  display: inline-block;
                }
                .custom-dot-active {
                  background: #194185;
                  width: 2rem;
                  box-shadow: 0 2px 10px 0 rgba(25,65,133,0.22);
                  transform: scale(1.12);
                }
              `}
            </style>
          </motion.div>

          <motion.div 
            className="text-center mt-12"
            variants={fadeInUp}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/doctors"
                className="group inline-block bg-yellow-400 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 hover:from-primary-900 hover:to-primary-700 hover:text-yellow-300 text-primary-900 px-12 py-4 rounded-2xl text-2xl font-extrabold shadow-xl shadow-yellow-200/40 border border-yellow-400 hover:border-primary-700 transition-all duration-200 ring-1 ring-yellow-100 hover:ring-primary-700/40 focus:outline-none focus:ring-4 focus:ring-yellow-300/40 transform-gpu"
                style={{
                  letterSpacing: '0.035em',
                  boxShadow: '0 6px 28px 0 rgba(255,215,85,0.16), 0 2px 10px 0 rgba(25,65,133,0.08)'
                }}
              >
                <span className="inline-flex items-center gap-3">
                  <span style={{ textShadow: '0 1.5px 8px #fff6,0 1.5px 10px #f8d46455' }}>
                    {t('view_all_doctors')}
                  </span>
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>
    );
  }, [loadingDoctors, doctors, t, isRTL]);

  return (
    <div className="overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* الهيرو مع انيميشن دخول */}
      <section
        className="relative text-white min-h-[520px] flex items-center py-16 md:py-28"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700/70 to-primary-900/80 z-0 pointer-events-none" />
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-6 md:px-8 text-center">
            <motion.h1 
              className="text-5xl md:text-7xl font-black font-arabic mb-8 drop-shadow-lg"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ willChange: 'transform, opacity' }}
            >
              {isRTL ? 'مركز ' : ''}
              <motion.span 
                className="text-yellow-300 drop-shadow-[0_2px_12px_rgba(250,200,50,0.3)]"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
                style={{ willChange: 'transform, opacity' }}
              >
                {isRTL ? 'رعاية' : 'Reaaya Center'}
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-2xl md:text-3xl mb-10 font-arabic font-semibold opacity-90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              style={{ willChange: 'opacity' }}
            >
              "{t('we_care_you_heal')}"
            </motion.p>
            
            <motion.p 
              className="text-lg md:text-2xl mb-10 max-w-2xl mx-auto font-light opacity-95 shadow-sm shadow-primary-900/10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              style={{ willChange: 'transform, opacity' }}
            >
              {t('hero_description')}
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center pt-2"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              style={{ willChange: 'transform, opacity' }}
            >
              <Link
                to="/doctors"
                className="bg-gradient-to-r from-yellow-300 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500 text-primary-900 px-10 py-3 rounded-xl text-xl font-bold shadow-lg shadow-yellow-300/30 border-2 border-yellow-200 transition-all duration-200 hover:scale-105  transform-gpu"
              >
                {t('book_appointment_now')}
              </Link>
              <Link
                to="/about"
                className="border-2 border-white hover:bg-white hover:text-primary-700 text-white px-10 py-3 rounded-xl text-xl font-semibold transition-all duration-200 hover:scale-105 transform-gpu"
              >
                {t('learn_about_us')}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* الإحصائيات مع انيميشن عداد */}
      <AnimatedSection className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            variants={staggerContainer}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="bg-gradient-to-br from-primary-100 via-white to-primary-50 p-7 rounded-2xl shadow transition-all hover:scale-105 hover:shadow-lg transform-gpu"
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                style={{ willChange: 'transform' }}
              >
                <Counter number={stat.number} />
                <div className="text-gray-600 font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* المميزات مع انيميشن متتالية */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-extrabold text-primary-900 mb-5"
              variants={fadeInUp}
            >
              {t('why_choose_care_center')}
            </motion.h2>
            <motion.p 
              className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto font-light"
              variants={fadeInUp}
            >
              {t('excellence_description')}
            </motion.p>
          </AnimatedSection>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, threshold: 0.1 }}
          >
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* قسم الأطباء مع انيميشن انزلاقي */}
      {doctorsSection}

      {/* دعوة للعمل مع انيميشن نبضي خفيف */}
      <AnimatedSection className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6 text-white"
            variants={fadeInUp}
          >
            {t('ready_start_journey')}
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 opacity-90 text-white"
            variants={fadeInUp}
          >
            {t('join_thousands_patients')}
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={staggerContainer}
          >
            <motion.div
              variants={slideInRight}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ willChange: 'transform' }}
            >
              <Link
                to="/register"
                className="bg-yellow-400 hover:bg-transparent border-2 border-yellow-400 hover:border-white hover:text-white text-primary-900 px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 block transform-gpu"
              >
                {t('create_new_account')}
              </Link>
            </motion.div>
            <motion.div
              variants={slideInLeft}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ willChange: 'transform' }}
            >
              <Link
                to="/contact"
                className="border-2 border-white hover:bg-yellow-400 hover:text-primary-900 hover:border-yellow-400 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 block transform-gpu"
              >
                {t('contact_us')}
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Background animated elements */}
        <motion.div 
          className="absolute top-0 left-0 w-32 h-32 bg-yellow-300/10 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ willChange: 'transform, opacity' }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          style={{ willChange: 'transform, opacity' }}
        />
      </AnimatedSection>
    </div>
  );
};

export default memo(Home);