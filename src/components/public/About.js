import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  TrophyIcon,
  HeartIcon,
  BeakerIcon,
  UserGroupIcon,
  EyeIcon
} from '@heroicons/react/24/solid';

// Framer Motion imports
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

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
      staggerChildren: 0.2
    }
  }
};

const timelineItem = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
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
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
});

// Memoized Value Card Component
const ValueCard = memo(({ value, index }) => {
  const IconComponent = value.icon;
  
  return (
    <motion.div
      variants={scaleIn}
      className="bg-white p-8 rounded-2xl shadow-lg text-center group hover:shadow-2xl transition-all duration-300 border-t-4 hover:border-primary-600 border-transparent transform-gpu"
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      style={{ willChange: 'transform' }}
    >
      <motion.div 
        className="flex justify-center mb-6"
        whileHover={{ 
          scale: 1.1,
          rotate: [0, -5, 5, 0]
        }}
        transition={{ duration: 0.5 }}
        style={{ willChange: 'transform' }}
      >
        <span className="inline-flex items-center justify-center rounded-full bg-primary-50 group-hover:bg-primary-100 transition-all duration-200 p-4 shadow transform-gpu">
          <IconComponent className="w-12 h-12 text-primary-600" />
        </span>
      </motion.div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-700 transition-all">
        {value.title}
      </h3>
      <p className="text-gray-600 leading-relaxed font-light">
        {value.description}
      </p>
    </motion.div>
  );
});

// Memoized Milestone Component
const MilestoneItem = memo(({ milestone, index }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <motion.div 
      key={index} 
      className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
      variants={timelineItem}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, threshold: 0.3 }}
      transition={{ delay: index * 0.2 }}
    >
      {/* المحطة */}
      <div className={`w-1/2 ${index % 2 === 0 ? (isRTL ? 'pr-8 text-right' : 'pl-8 text-left') : (isRTL ? 'pl-8 text-left' : 'pr-8 text-right')}`}>
        <motion.div 
          className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform-gpu"
          whileHover={{ 
            scale: 1.05,
            transition: { duration: 0.2 }
          }}
          style={{ willChange: 'transform' }}
        >
          <motion.div 
            className="text-2xl font-bold text-primary-600 mb-2"
            whileHover={{ scale: 1.1 }}
            style={{ willChange: 'transform' }}
          >
            {milestone.year}
          </motion.div>
          <p className="text-gray-700 font-medium">
            {milestone.event}
          </p>
        </motion.div>
      </div>

      {/* النقطة على الخط */}
      <motion.div 
        className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary-600 rounded-full border-4 border-white shadow-lg z-10"
        whileInView={{ 
          scale: [0, 1.2, 1],
          opacity: [0, 1, 1]
        }}
        transition={{ 
          duration: 0.6,
          delay: index * 0.2 + 0.3
        }}
        style={{ willChange: 'transform, opacity' }}
      />
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
      whileInView={{ scale: [0.8, 1.1, 1] }}
      transition={{ duration: 0.5 }}
      style={{ willChange: 'transform, opacity' }}
    >
      {count}+
    </motion.div>
  );
});

// Memoized Vision/Mission Card
const VisionMissionCard = memo(({ 
  isVision = true, 
  title, 
  description, 
  icon: IconComponent, 
  borderColor,
  iconColor 
}) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <AnimatedSection variants={isVision ? fadeInRight : fadeInLeft}>
      <motion.div 
        className={`relative bg-white rounded-3xl shadow-lg p-10 group hover:shadow-2xl transition-all overflow-hidden border ${borderColor}`}
        whileHover={{ 
          y: -5,
          transition: { duration: 0.3 }
        }}
        style={{ willChange: 'transform' }}
      >
        <motion.div 
          className={`absolute ${isRTL ? (isVision ? 'right-0' : 'left-0') : (isVision ? 'left-0' : 'right-0')} top-0 w-2 h-16 bg-gradient-to-b ${isVision ? 'from-primary-600 to-primary-400 rounded-br-3xl' : 'from-green-500 to-green-300 rounded-bl-3xl'} group-hover:h-24 transition-all`}
          whileInView={{ height: "6rem" }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ willChange: 'transform' }}
        />
        <motion.div 
          className="flex justify-center mb-6"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
          style={{ willChange: 'transform' }}
        >
          <span className={`inline-flex items-center justify-center rounded-full ${isVision ? 'bg-primary-50 group-hover:bg-primary-100' : 'bg-green-50 group-hover:bg-green-100'} transition-all duration-200 shadow p-5`}>
            <IconComponent className={`w-14 h-14 ${iconColor} drop-shadow`} />
          </span>
        </motion.div>
        <h2 className={`text-3xl font-extrabold ${isVision ? 'text-primary-900' : 'text-green-800'} mb-4 tracking-tight drop-shadow-sm`}>
          {title}
        </h2>
        <p className="text-gray-700 leading-relaxed text-lg font-light">
          {description}
        </p>
      </motion.div>
    </AnimatedSection>
  );
});

const About = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Memoized static data
  const values = useMemo(() => [
    {
      icon: TrophyIcon,
      title: t('medical_excellence'),
      description: t('medical_excellence_description'),
    },
    {
      icon: HeartIcon,
      title: t('patient_care_first'),
      description: t('patient_care_first_description'),
    },
    {
      icon: BeakerIcon,
      title: t('continuous_development'),
      description: t('continuous_development_description'),
    },
    {
      icon: UserGroupIcon,
      title: t('teamwork'),
      description: t('teamwork_description'),
    },
  ], [t]);

  const milestones = useMemo(() => [
    { year: '2009', event: t('center_establishment') },
    { year: '2012', event: t('health_authority_approval') },
    { year: '2015', event: t('center_expansion') },
    { year: '2018', event: t('international_quality_certificate') },
    { year: '2021', event: t('electronic_booking_system') },
    { year: '2024', event: t('emergency_department_development') }
  ], [t]);

  const stats = useMemo(() => [
    { number: '50+', label: t('specialized_doctors') },
    { number: '15+', label: t('medical_specialties') },
    { number: '3000+', label: t('satisfied_patient') },
    { number: '15+', label: t('years_experience') }
  ], [t]);

  // Memoized vision and mission data
  const visionMissionData = useMemo(() => [
    {
      isVision: true,
      title: t('our_vision'),
      description: t('vision_description'),
      icon: EyeIcon,
      borderColor: 'border-primary-100',
      iconColor: 'text-primary-600'
    },
    {
      isVision: false,
      title: t('our_mission'),
      description: t('mission_description'),
      icon: HeartIcon,
      borderColor: 'border-green-100',
      iconColor: 'text-red-500'
    }
  ], [t]);

  return (
    <div className="min-h-screen overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* الهيرو مع انيميشن دخول */}
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
          style={{ willChange: 'transform, opacity' }}
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
          style={{ willChange: 'transform, opacity' }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ willChange: 'transform, opacity' }}
          >
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-6 text-yellow-300 drop-shadow-[0_2px_12px_rgba(250,200,50,0.3)]"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
              style={{ willChange: 'transform, opacity' }}
            >
              {t('about_care_center')}
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl mb-8 font-arabic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              style={{ willChange: 'opacity' }}
            >
              "{t('we_care_you_heal')}"
            </motion.p>
            <motion.p 
              className="text-lg max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              style={{ willChange: 'transform, opacity' }}
            >
              {t('about_hero_description')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* رؤيتنا ورسالتنا مع انيميشن انزلاقي */}
      <section className="py-24 bg-gradient-to-br from-white via-primary-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {visionMissionData.map((item, index) => (
              <VisionMissionCard
                key={index}
                isVision={item.isVision}
                title={item.title}
                description={item.description}
                icon={item.icon}
                borderColor={item.borderColor}
                iconColor={item.iconColor}
              />
            ))}
          </div>
        </div>
      </section>

      {/* قيمنا مع انيميشن متتالي */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-black text-primary-900 mb-4 drop-shadow-sm"
              variants={fadeInUp}
            >
              {t('our_core_values')}
            </motion.h2>
            <motion.p 
              className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto font-light"
              variants={fadeInUp}
            >
              {t('core_values_description')}
            </motion.p>
          </AnimatedSection>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, threshold: 0.1 }}
          >
            {values.map((value, index) => (
              <ValueCard key={index} value={value} index={index} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* محطات تاريخية مع انيميشن الخط الزمني */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-black text-primary-900 mb-4 drop-shadow-sm"
              variants={fadeInUp}
            >
              {t('milestones_in_our_journey')}
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-600"
              variants={fadeInUp}
            >
              {t('milestones_description')}
            </motion.p>
          </AnimatedSection>

          <div className="relative">
            {/* الخط الزمني المتحرك */}
            <motion.div 
              className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-primary-200 h-full"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ originY: 0, willChange: 'transform' }}
            />
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <MilestoneItem key={index} milestone={milestone} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* إحصائيات مع عداد متحرك */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, threshold: 0.3 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="bg-gradient-to-br from-primary-100 via-white to-primary-50 p-7 rounded-2xl shadow transition-all hover:shadow-lg transform-gpu"
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
      </section>

      {/* دعوة للتواصل مع انيميشن نبضي */}
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
          style={{ willChange: 'transform' }}
        />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <AnimatedSection>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-6 text-white"
              variants={fadeInUp}
            >
              {t('welcome_visit')}
            </motion.h2>
            <motion.p 
              className="text-xl mb-8 opacity-90 text-white"
              variants={fadeInUp}
            >
              {t('welcome_visit_description')}
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={staggerContainer}
            >
              <motion.div
                variants={fadeInRight}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ willChange: 'transform' }}
              >
                <Link
                  to="/contact"
                  className="bg-yellow-400 hover:bg-transparent border-2 border-yellow-400 hover:border-white hover:text-white text-primary-900 px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 block transform-gpu"
                >
                  {t('contact_us')}
                </Link>
              </motion.div>
              <motion.div
                variants={fadeInLeft}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ willChange: 'transform' }}
              >
                <Link
                  to="/doctors"
                  className="border-2 border-white hover:bg-yellow-400 hover:text-primary-900 hover:border-yellow-400 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 block transform-gpu"
                >
                  {t('meet_our_doctors')}
                </Link>
              </motion.div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default memo(About);