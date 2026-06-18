import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  variant = 'default', // 'default', 'pulse', 'dots'
  className = '',
  text = ''
}) => {
  const sizeClasses = {
    xs: { spinner: 'w-4 h-4 border-2', text: 'text-xs' },
    sm: { spinner: 'w-6 h-6 border-3', text: 'text-sm' },
    md: { spinner: 'w-8 h-8 border-4', text: 'text-base' },
    lg: { spinner: 'w-12 h-12 border-4', text: 'text-lg' },
    xl: { spinner: 'w-16 h-16 border-4', text: 'text-xl' }
  };

  const colorClasses = {
    primary: {
      spinner: 'border-primary-100 border-t-primary-600',
      text: 'text-primary-600',
      dots: 'bg-primary-600'
    },
    white: {
      spinner: 'border-white/20 border-t-white',
      text: 'text-white',
      dots: 'bg-white'
    },
    gray: {
      spinner: 'border-gray-200 border-t-gray-600',
      text: 'text-gray-600',
      dots: 'bg-gray-600'
    },
    success: {
      spinner: 'border-green-100 border-t-green-600',
      text: 'text-green-600',
      dots: 'bg-green-600'
    },
    error: {
      spinner: 'border-red-100 border-t-red-600',
      text: 'text-red-600',
      dots: 'bg-red-600'
    }
  };

  // Spinner with pulse effect
  const PulseSpinner = () => (
    <div className="relative">
      <div
        className={`
          ${sizeClasses[size].spinner}
          ${colorClasses[color].spinner}
          rounded-full 
          animate-spin
          absolute
        `}
      ></div>
      <div
        className={`
          ${sizeClasses[size].spinner}
          border-transparent
          rounded-full 
          animate-ping
          opacity-75
        `}
      ></div>
    </div>
  );

  // Dots loading animation
  const DotsSpinner = () => (
    <div className={`flex space-x-1 ${isRTL ? 'space-x-reverse' : ''}`}>
      {[0, 1, 2].map((dot) => (
        <div
          key={dot}
          className={`
            w-2 h-2 rounded-full
            ${colorClasses[color].dots}
            animate-bounce
          `}
          style={{
            animationDelay: `${dot * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );

  // Default spinner
  const DefaultSpinner = () => (
    <div
      className={`
        ${sizeClasses[size].spinner}
        ${colorClasses[color].spinner}
        rounded-full 
        animate-spin
        transition-all
        duration-300
      `}
    />
  );

  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const renderSpinner = () => {
    switch (variant) {
      case 'pulse':
        return <PulseSpinner />;
      case 'dots':
        return <DotsSpinner />;
      default:
        return <DefaultSpinner />;
    }
  };

  return (
    <div 
      className={`
        inline-flex flex-col items-center justify-center
        ${className}
      `}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {renderSpinner()}
      {text && (
        <p 
          className={`
            mt-3 font-medium
            ${sizeClasses[size].text}
            ${colorClasses[color].text}
            animate-pulse
          `}
        >
          {text}
        </p>
      )}
    </div>
  );
};

// Custom hook for translation (if not available, you can remove it)
const useTranslation = () => ({
  i18n: { language: 'en' }
});

export default LoadingSpinner;