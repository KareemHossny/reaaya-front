import React, { useMemo, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HeartIcon,
  UserIcon,
  ScissorsIcon,
  EyeIcon,
  CpuChipIcon,
  BuildingOfficeIcon,
  BeakerIcon,
  CameraIcon,
  TrophyIcon,
  AcademicCapIcon,
  ComputerDesktopIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

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
      staggerChildren: 0.15
    }
  }
};

const cardHover = {
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const iconHover = {
  hover: {
    scale: 1.1,
    rotate: [0, -5, 5, 0],
    transition: {
      duration: 0.5
    }
  }
};

const glowHover = {
  hover: {
    scale: 1.2,
    opacity: 0.9,
    transition: {
      duration: 0.3
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
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
});

// Memoized Medical Service Card
const MedicalServiceCard = memo(({ service, index }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const IconComponent = service.icon;
  
  return (
    <motion.div
      variants={scaleIn}
      whileHover="hover"
      className="bg-gradient-to-br from-primary-50/70 via-white to-primary-100/60 border border-primary-100 shadow-lg hover:shadow-2xl transition-all rounded-2xl p-8 relative overflow-visible group transform-gpu"
      style={{ willChange: 'transform' }}
    >
      {/* Animated Decorative Glow Ring */}
      <motion.div 
        className="absolute -top-6 left-1/2 -translate-x-1/2 z-0 w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-300/30 via-primary-200/20 to-yellow-200/20 blur-2xl opacity-70 pointer-events-none"
        variants={glowHover}
        style={{ willChange: 'transform, opacity' }}
      />
      
      {/* Icon Circle */}
      <motion.div 
        className="flex justify-center mb-6 relative z-10"
        variants={iconHover}
        style={{ willChange: 'transform' }}
      >
        <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-100 via-primary-100 to-white shadow-lg transition-transform p-4 border-2 border-primary-200/40 transform-gpu">
          <IconComponent className="w-12 h-12 text-primary-700" />
        </span>
      </motion.div>
      
      <motion.h3 
        className="text-2xl font-black text-primary-900 mb-2 drop-shadow-sm group-hover:text-yellow-600 transition-colors"
        whileHover={{ scale: 1.05 }}
        style={{ willChange: 'transform' }}
      >
        {service.title}
      </motion.h3>
      
      <motion.p 
        className="text-gray-700 mb-5 leading-relaxed font-light text-base min-h-[56px]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.3 }}
        style={{ willChange: 'opacity' }}
      >
        {service.description}
      </motion.p>
      
      {service.features && service.features.length > 0 && (
        <motion.ul 
          className="space-y-2 mb-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.5 }}
          style={{ willChange: 'opacity' }}
        >
          {service.features.map((feature, featureIndex) => (
            <motion.li 
              key={featureIndex} 
              className="flex items-center text-sm text-gray-600 font-medium"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: featureIndex * 0.1 + index * 0.1 + 0.7 }}
              style={{ willChange: 'transform, opacity' }}
            >
              <motion.span 
                className={`text-green-500 ${isRTL ? 'ml-2' : 'mr-2'}`}
                whileHover={{ scale: 1.2 }}
                style={{ willChange: 'transform' }}
              >
                ✔
              </motion.span>
              {feature}
            </motion.li>
          ))}
        </motion.ul>
      )}
      
      <motion.div 
        className="mt-4 flex justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ willChange: 'transform' }}
      >
        <Link
          to="/doctors"
          className="inline-flex items-center gap-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow group-hover:from-yellow-400 group-hover:to-yellow-500 group-hover:text-primary-900 transition-all transform-gpu"
        >
          <span>{t('learn_about_specialists')}</span>
          <motion.svg 
            className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} 
            fill="none" 
            stroke="currentColor" 
            strokeWidth={2} 
            viewBox="0 0 24 24"
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
            style={{ willChange: 'transform' }}
          >
            <path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </Link>
      </motion.div>
    </motion.div>
  );
});

// Memoized Support Service Card
const SupportServiceCard = memo(({ service, index }) => {
  const IconComponent = service.icon;
  
  return (
    <motion.div
      key={index}
      variants={scaleIn}
      whileHover="hover"
      className="bg-white p-8 rounded-2xl shadow-lg text-center group transition-all border-t-4 hover:border-primary-600 border-transparent transform-gpu"
      style={{ willChange: 'transform' }}
    >
      <motion.div 
        className="flex justify-center mb-6"
        variants={iconHover}
        style={{ willChange: 'transform' }}
      >
        <span className="inline-flex items-center justify-center rounded-full bg-primary-50 group-hover:bg-primary-100 transition-all duration-200 p-4 shadow transform-gpu">
          <IconComponent className="w-12 h-12 text-primary-600" />
        </span>
      </motion.div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-700 transition-all">
        {service.title}
      </h3>
      <p className="text-gray-600 leading-relaxed font-light text-sm md:text-base">
        {service.description}
      </p>
    </motion.div>
  );
});

// Memoized Feature Item
const FeatureItem = memo(({ feature, index }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const IconComponent = feature.icon;
  
  return (
    <motion.div 
      className={`flex items-start gap-5 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.2 + 0.3 }}
      viewport={{ once: true }}
      style={{ willChange: 'transform, opacity' }}
    >
      <motion.div 
        className={`w-14 h-14 bg-${feature.color}-100 shadow-md rounded-full flex items-center justify-center flex-shrink-0 transform-gpu`}
        whileHover={{ 
          scale: 1.1,
          rotate: 360,
          transition: { duration: 0.5 }
        }}
        style={{ willChange: 'transform' }}
      >
        <IconComponent className={`w-7 h-7 text-${feature.color}-600`} />
      </motion.div>
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">{feature.title}</h3>
        <p className="text-gray-600 text-base leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
});

// Memoized Contact Item
const ContactItem = memo(({ item, index }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <motion.div 
      className="flex items-center text-primary-800 text-base font-semibold"
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 + 0.5 }}
      viewport={{ once: true }}
      style={{ willChange: 'transform, opacity' }}
    >
      <motion.span 
        className={`bg-primary-200 p-2 rounded-lg ${isRTL ? 'mr-2' : 'ml-2'} flex items-center justify-center`}
        whileHover={{ scale: 1.1 }}
        style={{ willChange: 'transform' }}
      >
        <item.icon className="w-6 h-6 text-primary-600" />
      </motion.span>
      <span dir={item.dir} className="select-all">{item.text}</span>
    </motion.div>
  );
});

const Services = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Memoized static data - كل النصوص من الترجمة
  const medicalServices = useMemo(() => [
    {
      icon: HeartIcon,
      title: t('cardiology'),
      description: t('cardiology_description'),
      features: [t('cardiac_catheterization'), t('echo_exams'), t('blood_pressure_monitoring')]
    },
    {
      icon: UserIcon,
      title: t('pediatrics'),
      description: t('pediatrics_description'),
      features: [t('vaccinations'), t('growth_monitoring'), t('newborn_care')]
    },
    {
      icon: ScissorsIcon,
      title: t('orthopedics'),
      description: t('orthopedics_description'),
      features: [t('joint_surgeries'), t('fracture_treatment'), t('spine_surgeries')]
    },
    {
      icon: EyeIcon,
      title: t('ophthalmology'),
      description: t('ophthalmology_description'),
      features: [t('vision_exams'), t('cataract_surgeries'), t('retinal_diseases')]
    },
    {
      icon: ScissorsIcon,
      title: t('dentistry'),
      description: t('dentistry_description'),
      features: [t('fillings_root_canal'), t('dental_implants'), t('orthodontics')]
    },
    {
      icon: CpuChipIcon,
      title: t('neurology'),
      description: t('neurology_description'),
      features: [t('headache_treatment'), t('stroke_care'), t('nerve_mapping')]
    }
  ], [t]);

  const supportServices = useMemo(() => [
    {
      icon: BuildingOfficeIcon,
      title: t('emergency_24_hours'),
      description: t('emergency_24_hours_description')
    },
    {
      icon: BeakerIcon,
      title: t('laboratories'),
      description: t('laboratories_description')
    },
    {
      icon: CameraIcon,
      title: t('radiology_diagnosis'),
      description: t('radiology_diagnosis_description')
    },
    {
      icon: BeakerIcon,
      title: t('pharmacy'),
      description: t('pharmacy_description')
    }
  ], [t]);

  const featuresData = useMemo(() => [
    {
      icon: TrophyIcon,
      color: 'primary',
      title: t('certified_quality'),
      description: t('certified_quality_description')
    },
    {
      icon: AcademicCapIcon,
      color: 'green',
      title: t('expert_specialists'),
      description: t('expert_specialists_description')
    },
    {
      icon: ComputerDesktopIcon,
      color: 'blue',
      title: t('advanced_technologies'),
      description: t('advanced_technologies_description')
    }
  ], [t]);

  const contactItems = useMemo(() => [
    { icon: PhoneIcon, text: '0123456789', dir: 'ltr' },
    { icon: EnvelopeIcon, text: 'services@hospital.com', dir: 'ltr' },
    { icon: ClockIcon, text: t('customer_service_24_7'), dir: isRTL ? 'rtl' : 'ltr' }
  ], [t, isRTL]);

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
      style={{ willChange: 'transform' }}
    />
  ), []);

  return (
    <div className="min-h-screen overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* الهيرو مع انيميشنات */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 relative overflow-hidden">
        {heroBackgroundAnimation()}
        
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
              {t('our_medical_services')}
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
              {t('services_hero_description')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* الخدمات الطبية الرئيسية مع انيميشنات */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-black text-primary-900 mb-4 drop-shadow-sm"
              variants={fadeInUp}
            >
              {t('specialized_medical_services')}
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              {t('discover_comprehensive_services')}
            </motion.p>
          </AnimatedSection>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, threshold: 0.1 }}
          >
            {medicalServices.map((service, index) => (
              <MedicalServiceCard key={index} service={service} index={index} />
            ))}
          </motion.div>

          {/* زر الانتقال إلى جميع التخصصات */}
          <motion.div 
            className="flex justify-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            style={{ willChange: 'transform, opacity' }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ willChange: 'transform' }}
            >
              <Link
                to="/specializations"
                className="group inline-block bg-yellow-400 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 hover:from-primary-900 hover:to-primary-700 hover:text-yellow-300 text-primary-900 px-12 py-4 rounded-2xl text-2xl font-extrabold shadow-xl shadow-yellow-200/40 border border-yellow-400 hover:border-primary-700 transition-all duration-200 ring-1 ring-yellow-100 hover:ring-primary-700/40 focus:outline-none focus:ring-4 focus:ring-yellow-300/40 transform-gpu"
                style={{
                  letterSpacing: '0.035em',
                  boxShadow: '0 6px 28px 0 rgba(255,215,85,0.16), 0 2px 10px 0 rgba(25,65,133,0.08)'
                }}
              >
                <span className="inline-flex items-center gap-3">
                  <span style={{ textShadow: '0 1.5px 8px #fff6,0 1.5px 10px #f8d46455' }}>
                    {t('browse_all_specializations')}
                  </span>
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* خدمات الدعم مع انيميشنات */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-extrabold text-primary-900 mb-5"
              variants={fadeInUp}
            >
              {t('support_care_services')}
            </motion.h2>
            <motion.p 
              className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto font-light"
              variants={fadeInUp}
            >
              {t('support_services_description')}
            </motion.p>
          </AnimatedSection>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, threshold: 0.1 }}
          >
            {supportServices.map((service, index) => (
              <SupportServiceCard key={index} service={service} index={index} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* مزايا إضافية مع انيميشنات */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Why Choose Us */}
            <AnimatedSection variants={fadeInRight}>
              <div>
                <motion.h2 
                  className="text-4xl md:text-5xl font-extrabold text-primary-900 mb-7 drop-shadow-sm"
                  variants={fadeInUp}
                >
                  {t('why_choose_our_services')}
                </motion.h2>
                <div className="space-y-7">
                  {featuresData.map((feature, index) => (
                    <FeatureItem key={index} feature={feature} index={index} />
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Services Inquiry */}
            <AnimatedSection variants={fadeInLeft}>
              <motion.div 
                className="bg-gradient-to-br from-primary-50 via-white to-primary-100 rounded-3xl shadow-lg p-10 border border-primary-100 transform-gpu"
                whileHover={{ 
                  y: -5,
                  transition: { duration: 0.3 }
                }}
                style={{ willChange: 'transform' }}
              >
                <h3 className="text-3xl font-extrabold text-primary-900 mb-5 tracking-tight">
                  {t('service_inquiries')}
                </h3>
                <p className="text-primary-800 mb-8 text-lg leading-relaxed">
                  {t('service_inquiries_description')}
                </p>
                <div className="space-y-5">
                  {contactItems.map((item, index) => (
                    <ContactItem key={index} item={item} index={index} />
                  ))}
                </div>
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* دعوة للعمل مع انيميشنات */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white relative overflow-hidden">
        {ctaBackgroundAnimation()}
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <AnimatedSection>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-6"
              variants={fadeInUp}
            >
              {t('ready_start_treatment')}
            </motion.h2>
            <motion.p 
              className="text-xl mb-8 opacity-90"
              variants={fadeInUp}
            >
              {t('choose_service_description')}
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
                  to="/doctors"
                  className="bg-yellow-400 hover:bg-transparent border-2 border-yellow-400 hover:border-white hover:text-white text-primary-900 px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 block transform-gpu"
                >
                  {t('book_appointment_now')}
                </Link>
              </motion.div>
              <motion.div
                variants={fadeInLeft}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ willChange: 'transform' }}
              >
                <Link
                  to="/contact"
                  className="border-2 border-white hover:bg-yellow-400 hover:text-primary-900 hover:border-yellow-400 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 block transform-gpu"
                >
                  {t('inquire_about_service')}
                </Link>
              </motion.div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default memo(Services);