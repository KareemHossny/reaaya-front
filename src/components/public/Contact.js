import React, { useState, useCallback, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  MapIcon
} from '@heroicons/react/24/outline';

// Framer Motion imports للـ animations
import { motion, AnimatePresence } from 'framer-motion';
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

// Memoized Contact Info Card Component
const ContactInfoCard = memo(({ info, index }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const IconComponent = info.icon;
  
  return (
    <motion.div
      variants={scaleIn}
      whileHover="hover"
      className="bg-white p-8 rounded-2xl shadow-lg text-center group border-t-4 hover:border-primary-600 border-transparent"
    >
      <motion.div 
        className="flex justify-center mb-6"
        whileHover={{ 
          scale: 1.1,
          rotate: [0, -5, 5, 0]
        }}
        transition={{ duration: 0.5 }}
      >
        <span className="inline-flex items-center justify-center rounded-full bg-primary-50 group-hover:bg-primary-100 transition-all duration-200 p-4 shadow">
          <IconComponent className="w-12 h-12 text-primary-600" />
        </span>
      </motion.div>
      <motion.h3 
        className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-700 transition-all"
        whileHover={{ scale: 1.05 }}
      >
        {info.title}
      </motion.h3>
      <div className="space-y-1 mb-3">
        {info.details.map((detail, idx) => (
          <motion.p 
            key={idx} 
            className="text-gray-700 font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: idx * 0.1 + 0.3 }}
          >
            {detail}
          </motion.p>
        ))}
      </div>
      <motion.p 
        className="text-sm text-primary-600"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {info.description}
      </motion.p>
    </motion.div>
  );
});

// Memoized Emergency Contact Component
const EmergencyContact = memo(({ contact, index }) => (
  <motion.div 
    key={index} 
    className="bg-white rounded-lg p-4 text-center border-2 border-red-200"
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ 
      scale: 1.05,
      borderColor: "#dc2626"
    }}
  >
    <div className="text-red-600 font-semibold mb-2">{contact.department}</div>
    <div className="text-lg font-bold text-red-700">{contact.number}</div>
  </motion.div>
));

// Memoized Feature Item Component
const FeatureItem = memo(({ feature, index }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const IconComponent = feature.icon;
  const colors = useMemo(() => ['primary', 'green', 'blue'], []);
  const color = colors[index % colors.length];
  
  return (
    <motion.div 
      className={`flex items-start gap-5 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}
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
        <IconComponent className={`w-7 h-7 text-${color}-600`} />
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

const Contact = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isRTL = i18n.language === 'ar';

  // useCallback للدوال
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);

    // محاكاة إرسال البيانات
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 2000);
  }, []);

  const resetForm = useCallback(() => {
    setSubmitted(false);
  }, []);

  // useMemo للبيانات الثابتة
  const contactInfo = useMemo(() => [
    {
      icon: PhoneIcon,
      title: t('center_phone'),
      details: ['01000540964', '01112000964'],
      description: t('available_24_hours')
    },
    {
      icon: EnvelopeIcon,
      title: t('email'),
      details: ['ReaayaCenter@gmail.com', 'Reaaya2Center@gmail.com'],
      description: t('response_within_24_hours')
    },
    {
      icon: MapPinIcon,
      title: t('address'),
      details: [t('city_main_district'), t('hospital_street_near_mall')],
      description: t('free_parking')
    },
    {
      icon: ClockIcon,
      title: t('working_hours'),
      details: [t('saturday_thursday_hours'), t('friday_hours')],
      description: t('emergency_24_hours')
    }
  ], [t]);

  const emergencyContacts = useMemo(() => [
    { department: t('emergency'), number: '0123456111' },
    { department: t('ambulance'), number: '0123456222' },
    { department: t('reception'), number: '0123456333' },
    { department: t('appointments'), number: '0123456444' }
  ], [t]);

  const visitFeatures = useMemo(() => [
    {
      icon: MapPinIcon,
      title: t('address'),
      description: t('full_address_description')
    },
    {
      icon: TruckIcon,
      title: t('parking'),
      description: t('parking_description')
    },
    {
      icon: TruckIcon,
      title: t('transportation'),
      description: t('transportation_description')
    }
  ], [t]);

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

  return (
    <div className="min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* الهيرو مع انيميشنات */}
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
              {t('contact_us')}
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
              {t('contact_hero_description')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* معلومات الاتصال مع انيميشنات */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-extrabold text-primary-900 mb-5"
              variants={fadeInUp}
            >
              {t('contact_care_center_info')}
            </motion.h2>
            <motion.p 
              className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto font-light"
              variants={fadeInUp}
            >
              {t('contact_channels_description')}
            </motion.p>
          </AnimatedSection>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, threshold: 0.1 }}
          >
            {contactInfo.map((info, index) => (
              <ContactInfoCard key={index} info={info} index={index} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* أرقام الطوارئ مع انيميشنات */}
      <section className="py-16 bg-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-8">
            <motion.h2 
              className="text-2xl font-bold text-red-900 mb-2"
              variants={fadeInUp}
            >
              {t('emergency_numbers')}
            </motion.h2>
            <motion.p 
              className="text-red-700"
              variants={fadeInUp}
            >
              {t('emergency_24_hours')}
            </motion.p>
          </AnimatedSection>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, threshold: 0.1 }}
          >
            {emergencyContacts.map((contact, index) => (
              <EmergencyContact key={index} contact={contact} index={index} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* نموذج الاتصال مع انيميشنات */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-primary-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          <motion.div 
            className="bg-white rounded-3xl shadow-2xl p-10 sm:p-12 border border-primary-100"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <AnimatedSection className="text-center mb-10">
              <motion.h2 
                className="text-3xl font-extrabold text-primary-900 mb-3 leading-tight drop-shadow-sm"
                variants={fadeInUp}
              >
                {t('send_message')}
              </motion.h2>
              <motion.p 
                className="text-gray-500 text-lg"
                variants={fadeInUp}
              >
                {t('response_soon')}
              </motion.p>
            </AnimatedSection>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div 
                    className="flex justify-center mb-5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <CheckCircleIcon className="w-20 h-20 text-green-500 drop-shadow" />
                  </motion.div>
                  <motion.h3 
                    className="text-2xl font-bold text-primary-900 mb-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {t('thank_you_contact')}
                  </motion.h3>
                  <motion.p 
                    className="text-gray-600 mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {t('message_received_success')}
                  </motion.p>
                  <motion.button
                    onClick={resetForm}
                    className="btn-primary mt-2 px-8 py-3 rounded-lg text-lg font-semibold shadow hover:bg-green-600 hover:text-white focus:outline-primary-500 transition"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    {t('send_another_message')}
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form 
                  onSubmit={handleSubmit} 
                  className="space-y-7"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="block text-md font-semibold text-gray-700 mb-2">
                        {t('full_name')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-input focus:ring-primary-500 focus:border-primary-500 transition"
                        required
                        placeholder={t('name_example')}
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label className="block text-md font-semibold text-gray-700 mb-2">
                        {t('email')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-input focus:ring-primary-500 focus:border-primary-500 transition"
                        required
                        placeholder="you@email.com"
                      />
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label className="block text-md font-semibold text-gray-700 mb-2">
                        {t('phone_number')}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="form-input focus:ring-primary-500 focus:border-primary-500 transition"
                        placeholder="01XXXXXXXX"
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label className="block text-md font-semibold text-gray-700 mb-2">
                        {t('message_subject')} <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="form-input focus:ring-primary-500 focus:border-primary-500 transition"
                        required
                      >
                        <option value="">{t('choose_subject')}</option>
                        <option value="استفسار عام">{t('general_inquiry')}</option>
                        <option value="موعد">{t('appointment_booking')}</option>
                        <option value="شكوى">{t('complaint_suggestion')}</option>
                        <option value="تعاون">{t('cooperation_opportunities')}</option>
                        <option value="وظائف">{t('employment')}</option>
                        <option value="آخرى">{t('other')}</option>
                      </select>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="block text-md font-semibold text-gray-700 mb-2">
                      {t('message')} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="6"
                      className="form-input focus:ring-primary-500 focus:border-primary-500 transition"
                      placeholder={t('write_message_here')}
                      required
                    ></textarea>
                  </motion.div>

                  <motion.div 
                    className="text-center mt-6"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className={`btn-primary px-12 py-3 rounded-lg text-lg font-bold shadow transition-colors ${
                        loading
                          ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                          : "hover:bg-primary-700 hover:text-white"
                      }`}
                      whileHover={!loading ? { scale: 1.05 } : {}}
                      whileTap={!loading ? { scale: 0.95 } : {}}
                    >
                      {loading ? (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <span className="animate-spin inline-block mr-2 align-middle">&#9696;</span>
                          {t('sending')}
                        </motion.span>
                      ) : (
                        t('send_message')
                      )}
                    </motion.button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* الخريطة ومعلومات إضافية مع انيميشنات */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* تفاصيل الوصول وزيارة المستشفى */}
            <AnimatedSection variants={fadeInRight}>
              <div>
                <motion.h2 
                  className="text-4xl md:text-5xl font-extrabold text-primary-900 mb-7 drop-shadow-sm"
                  variants={fadeInUp}
                >
                  {t('visit_us_at_center')}
                </motion.h2>
                <div className="space-y-7">
                  {visitFeatures.map((feature, index) => (
                    <FeatureItem key={index} feature={feature} index={index} />
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* صندوق الخريطة */}
            <AnimatedSection variants={fadeInLeft}>
              <motion.div 
                className="bg-gradient-to-br from-primary-50 via-white to-primary-100 rounded-3xl shadow-lg p-10 border border-primary-100"
                whileHover={{ 
                  y: -5,
                  transition: { duration: 0.3 }
                }}
              >
                <motion.div 
                  className="text-center text-primary-800"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div 
                    className="flex justify-center mb-4"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MapIcon className="w-16 h-16 text-primary-500" />
                  </motion.div>
                  <motion.p 
                    className="text-2xl font-extrabold mb-1"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {t('site_map')}
                  </motion.p>
                  <motion.p 
                    className="text-primary-700 text-lg mt-2 mb-6"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    {t('interactive_map_coming_soon')}
                  </motion.p>
                  <motion.a
                    href="https://www.google.com/maps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-7 py-3 rounded-lg bg-gradient-to-r from-primary-500 to-primary-700 text-white font-bold shadow hover:from-primary-600 hover:to-primary-800 transition-all duration-150 text-base"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A2 2 0 013 15.382V6a2 2 0 012-2h14a2 2 0 012 2v9.382a2 2 0 01-.553 1.894L15 20m-6 0v-4a2 2 0 012-2h2a2 2 0 012 2v4M7 8h.01M7 12h.01M11 12h2" />
                    </svg>
                    {t('view_on_google_maps')}
                  </motion.a>
                </motion.div>
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
};

export default memo(Contact);