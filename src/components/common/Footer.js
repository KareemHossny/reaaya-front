import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();
  const isRTL = i18n.language === 'ar';

  const quickLinks = [
    { name: t('home'), path: '/' },
    { name: t('about'), path: '/about' },
    { name: t('services'), path: '/services' },
    { name: t('doctors'), path: '/doctors' },
    { name: t('specializations'), path: '/specializations' },
    { name: t('contact'), path: '/contact' }
  ];

  const services = [
    t('cardiology'),
    t('pediatrics'),
    t('orthopedics'),
    t('ophthalmology'),
    t('dentistry'),
    t('emergency')
  ];

  const socialLinks = [
    {
      href: 'https://facebook.com',
      label: 'Facebook',
      icon: (
        <svg fill="currentColor" className="w-5 h-5 transition-colors" viewBox="0 0 24 24">
          <path d="M17 2.1h-2.8C11.7 2.1 10 3.6 10 6.1v1.9H7.5A.48.48 0 0 0 7 8.5v2.6c0 .27.22.49.5.49H10v6c0 .27.23.5.51.5h2.63c.28 0 .5-.22.5-.5v-6h1.94c.26 0 .46-.18.49-.44l.3-2.6a.48.48 0 0 0-.12-.39.5.5 0 0 0-.37-.16H13.6V6.41c0-.32.13-.51.53-.51h1.81c.27 0 .49-.23.49-.5V2.6a.49.49 0 0 0-.43-.5Z"/>
        </svg>
      ),
    },
    {
      href: 'https://twitter.com',
      label: 'Twitter',
      icon: (
        <svg fill="currentColor" className="w-5 h-5 transition-colors" viewBox="0 0 1200 1227">
          <path d="M1200 24.6 740.6 628.6l458.7 574.6H949.2L608.6 788.7 232.2 1203.2H0l480.6-601.7L36.8 24.6h252.1l296.4 361.4L936.6 24.6H1200ZM885.3 1092.5h107.2L319.6 134.7h-115l680.7 957.8Z" />
        </svg>
      ),
    },
    {
      href: 'https://instagram.com',
      label: 'Instagram',
      icon: (
        <svg fill="none" stroke="currentColor" className="w-5 h-5 transition-colors" viewBox="0 0 24 24">
          <rect width="18" height="18" x="3" y="3" rx="5" strokeWidth="2"/>
          <circle cx="12" cy="12" r="4" strokeWidth="2"/>
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
        </svg>
      ),
    }
  ];

  const legalLinks = [
    {
      name: t('privacy_policy'),
      href: '/privacy-policy'
    },
    {
      name: t('terms_conditions'),
      href: '/terms'
    }
  ];

  const contactItems = [
    { icon: PhoneIcon, text: '0123456789', dir: 'ltr' },
    { icon: EnvelopeIcon, text: 'ReeayaCenter@gmail.com', dir: 'ltr' },
    { icon: MapPinIcon, text: t('main_address') ,dir: 'ltr'},
    { icon: ClockIcon, text: t('open_24_7') }
  ];

  return (
    <footer className="bg-gradient-to-b from-primary-900 via-gray-900 to-gray-950 text-gray-50 shadow-inner z-10 relative" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* معلومات المركز */}
          <div className="lg:col-span-1">
            <div className={`flex items-center ${isRTL ? 'space-x-3 space-x-reverse' : 'space-x-3'} mb-6`}>
              <div className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-primary-500 ring-offset-2 ring-offset-gray-900 flex-shrink-0">
                <img 
                  src="images/Medical-Logo-Graphics-20827447-1-580x386.jpg" 
                  alt={t('medical_care_center')}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'block';
                    }
                  }}
                />
                <span className="text-white font-bold text-lg hidden">🏥</span>
              </div>
              <div className={isRTL ? "text-right" : "text-left"}>
                <h3 className="text-xl font-bold text-white leading-tight">{t('medical_care_center')}</h3>
                <p className="text-primary-300 text-sm mt-1 font-medium">"{t('we_care_you_heal')}"</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              {t('footer_description')}
            </p>
            <div className={`flex ${isRTL ? 'space-x-3 space-x-reverse' : 'space-x-3'}`}>
              {socialLinks.map(({ href, label, icon }) => (
                <a 
                  key={label}
                  href={href}
                  className="w-10 h-10 bg-gray-800 hover:bg-primary-600 transition-all duration-300 flex items-center justify-center rounded-full border border-gray-700 hover:border-primary-500"
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {React.cloneElement(icon, { 
                    className: "w-4 h-4 text-gray-400 hover:text-white transition-colors" 
                  })}
                </a>
              ))}
            </div>
          </div>

          {/* روابط سريعة */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white tracking-wide">{t('quick_links')}</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium py-1 block hover:translate-x-1 transform transition-transform"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* الخدمات */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white tracking-wide">{t('our_services')}</h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <span className="inline-flex items-center text-gray-300 hover:text-white cursor-pointer transition-colors duration-200 text-sm font-medium py-1 group">
                    <span className={`w-1.5 h-1.5 rounded-full bg-primary-400 mr-3 ${isRTL ? 'ml-3 mr-0' : 'mr-3'} group-hover:bg-white transition-colors`} />
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* معلومات الاتصال */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white tracking-wide">{t('contact_info')}</h3>
            <div className="space-y-4">
              {contactItems.map((item, index) => (
                <div key={index} className={`flex items-start ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 mt-0.5 ${isRTL ? 'ml-3' : 'mr-3'}`}>
                    <item.icon className="w-5 h-5 text-primary-400" />
                  </div>
                  <span 
                    dir={item.dir} 
                    className="text-gray-300 text-sm font-medium leading-relaxed"
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* حقوق النشر */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm font-medium text-center md:text-left">
            © {currentYear} {t('medical_care_center')}. {t('all_rights_reserved')}.
          </p>
          <div className={`flex ${isRTL ? 'space-x-6 space-x-reverse' : 'space-x-6'}`}>
            {legalLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;