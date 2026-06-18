import React, { useState, useEffect, useMemo } from 'react';
import { patientAPI, specializationAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../common/LoadingSpinner';
import AppointmentBooking from './AppointmentBooking';
import { translateMedicalText } from '../../utils/medicalTranslator';
import {
  EnvelopeIcon,
  PhoneIcon,
  MagnifyingGlassIcon,
  StarIcon,
  CheckBadgeIcon,
  MapPinIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

// Enhanced random doctor data – now deterministic (less flicker between renders) & extendable.
function createRandomStats(doctorId) {
  // Derive a pseudo-random but deterministic seed from doctorId for stability
  let seed = 0;
  for (let i = 0; i < (doctorId || '').length; i++) {
    seed += doctorId.charCodeAt(i);
  }
  // Simple LCG for deterministic pseudo-random values per doctor
  function rand(factor) {
    seed = (seed * 9301 + 49297) % 233280;
    return (seed / 233280) * factor;
  }
  return {
    rating: +(3 + rand(2)).toFixed(1),
    reviewCount: Math.floor(rand(490)) + 10,
    patientCount: Math.floor(rand(1900)) + 100,
    successRate: `${Math.floor(rand(14)) + 85}%`,
    responseTime: `${Math.floor(rand(55)) + 5}m`,
    consultationFee: Math.floor(rand(250)) + 50,
    experienceYears: Math.floor(rand(32)) + 3,
    isVerified: rand(1) > 0.3,
    availability: (() => {
      const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
      const n = Math.floor(rand(4)) + 3;
      const permed = [...days]
        .sort(() => rand(1) > 0.5 ? 1 : -1)
        .slice(0, n)
        .map(day => ({day}));
      return permed;
    })(),
    location: (() => {
      const locations = [
        'Downtown Medical Center', 'City General Hospital', 'Health First Clinic',
        'Main Street Medical', 'University Hospital', 'Community Health Center',
        'Specialty Care Clinic', 'Family Practice Center'
      ];
      return locations[Math.floor(rand(locations.length))];
    })(),
  };
}

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [sortBy, setSortBy] = useState('rating');

  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir?.() === 'rtl' || i18n.language === 'ar';

  /** Fetch doctors with applied filters */
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedSpecialization) params.specialization = selectedSpecialization;
      const resp = await patientAPI.getDoctors(params);
      // Ensure array
      const rawDocs = Array.isArray(resp.data) ? resp.data : [];
      // Add 'stable' random values by doctor._id:
      const enhanced = rawDocs.map(doc => ({
        ...doc,
        ...createRandomStats(doc._id)
      }));
      setDoctors(enhanced);
    } catch (e) {
      console.error(e);
      toast.error(t('error_loading_doctors'));
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  /** Fetch all specializations */
  const fetchSpecializations = async () => {
    try {
      const resp = await specializationAPI.getSpecializations();
      let list = [];
      // Flexible handling for different response shapes
      if (Array.isArray(resp.data)) {
        list = resp.data;
      } else if (resp.data?.specializations) {
        list = resp.data.specializations;
      } else if (resp.data?.data) {
        list = resp.data.data;
      }
      setSpecializations(list);
    } catch (e) {
      console.error(e);
      toast.error(t('error_loading_specialties'));
      setSpecializations([]);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchSpecializations();
    // eslint-disable-next-line
  }, []);

  /** Search submit handler */
  const handleSearch = e => {
    e.preventDefault();
    fetchDoctors();
  };

  /** Book button handler */
  const handleBookAppointment = doctor => {
    setSelectedDoctor(doctor);
    setShowBooking(true);
  };

  /** List sorting */
  const sortedDoctors = useMemo(() => {
    const arr = [...doctors];
    switch (sortBy) {
      case 'rating': return arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'experience': return arr.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
      case 'name': return arr.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      default: return arr;
    }
  }, [doctors, sortBy]);

  /** Star renderer with better partial support */
  const renderStars = (rating = 0) => {
    // For 4.5: 4 yellow + 1 half yellow, else empty
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      let fill = 'text-gray-300';
      if (i <= Math.floor(rating)) fill = 'text-yellow-400';
      else if (i - rating > 0 && i - rating < 1) fill = 'text-yellow-300';
      stars.push(
        <StarIconSolid key={i} className={`w-5 h-5 transition-colors ${fill}`} />
      );
    }
    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="text-sm font-semibold text-gray-700 ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  /** Get translated weekday */
  const getDayName = day => {
    // fallback if no translation key exists
    const key = (day || '').toLowerCase();
    return t(key) || key.charAt(0).toUpperCase() + key.slice(1);
  };

  /** Large review counts formatted as 1.2k etc */
  const formatReviewCount = count =>
    count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count?.toLocaleString();

  /** Stats summary - memoized for perf */
  const stats = useMemo(() => {
    const d = sortedDoctors;
    return {
      avgRating: d.length
        ? (d.reduce((sum, doc) => sum + (doc.rating || 0), 0) / d.length).toFixed(1)
        : '0.0',
      totalDoctors: d.length,
      totalReviews: formatReviewCount(d.reduce((sum, doc) => sum + (doc.reviewCount || 0), 0)),
      verifiedCount: d.filter(doc => doc.isVerified).length,
    };
  }, [sortedDoctors]);

  // Loader state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <LoadingSpinner size="lg" />
          <UserIcon className="w-8 h-8 text-primary-500 absolute inset-0 m-auto animate-pulse pointer-events-none" />
        </div>
        <span className="text-gray-600 mt-4 font-medium">{t('loading_doctors')}</span>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${isRTL ? 'rtl' : ''}`}>
      {/* Search + Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search Bar */}
          <div className="flex-1 w-full relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('search_doctor_placeholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              aria-label={t('search_doctor_placeholder')}
            />
          </div>
          {/* Specialization Filter */}
          <div className="relative w-full md:w-60">
            <FunnelIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedSpecialization}
              onChange={e => setSelectedSpecialization(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 appearance-none outline-none"
              aria-label={t('all_specialties')}
            >
              <option value="">{t('all_specialties')}</option>
              {specializations.map(spec => (
                <option key={spec._id || spec.value || spec.name} value={spec._id || spec.value}>
                  {translateMedicalText(spec.name, i18n.language)}
                </option>
              ))}
            </select>
          </div>
          {/* Sort Filter */}
          <div className="relative w-full md:w-40">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none"
              aria-label={t('sort_by_rating')}
            >
              <option value="rating">{t('sort_by_rating')}</option>
              <option value="experience">{t('sort_by_experience')}</option>
              <option value="name">{t('sort_by_name')}</option>
            </select>
          </div>
          {/* Search Button */}
          <button
            type="submit"
            className="shrink-0 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500 transition-all flex items-center gap-2"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            <span>{t('search')}</span>
          </button>
        </form>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('average_rating')}
          value={stats.avgRating}
          icon={<StarIconSolid className="w-6 h-6" />}
          color="from-blue-500 to-blue-600"
          textColor="text-blue-100"
        />
        <StatsCard
          title={t('total_doctors')}
          value={stats.totalDoctors}
          icon={<UserIcon className="w-6 h-6" />}
          color="from-green-500 to-green-600"
          textColor="text-green-100"
        />
        <StatsCard
          title={t('total_reviews')}
          value={stats.totalReviews}
          icon={<StarIcon className="w-6 h-6" />}
          color="from-purple-500 to-purple-600"
          textColor="text-purple-100"
        />
        <StatsCard
          title={t('verified_doctors')}
          value={stats.verifiedCount}
          icon={<CheckBadgeIcon className="w-6 h-6" />}
          color="from-orange-500 to-orange-600"
          textColor="text-orange-100"
        />
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedDoctors.map(doctor => (
          <DoctorCard
            key={doctor._id}
            doctor={doctor}
            onBook={handleBookAppointment}
            t={t}
            i18n={i18n}
            renderStars={renderStars}
            getDayName={getDayName}
            formatReviewCount={formatReviewCount}
          />
        ))}
      </div>

      {/* Empty State */}
      {!sortedDoctors.length && (
        <div className="text-center py-16 px-8 bg-white rounded-2xl shadow-lg border border-gray-200 max-w-2xl mx-auto">
          <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <MagnifyingGlassIcon className="w-20 h-20 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {t('no_results_found')}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">{t('no_doctors_match_search')}</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSpecialization('');
              fetchDoctors();
            }}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200"
          >
            {t('view_all_doctors')}
          </button>
        </div>
      )}

      {/* Booking Modal */}
      {showBooking && selectedDoctor && (
        <AppointmentBooking
          doctor={selectedDoctor}
          onClose={() => {
            setShowBooking(false);
            setSelectedDoctor(null);
          }}
          onSuccess={() => {
            setShowBooking(false);
            setSelectedDoctor(null);
            fetchDoctors();
          }}
        />
      )}
    </div>
  );
};

/** StatsCard: reusable stat summary */
function StatsCard({ title, value, icon, color, textColor }) {
  return (
    <div
      className={`bg-gradient-to-r ${color} rounded-2xl p-4 text-white flex flex-col justify-between h-full`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${textColor}`}>{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="p-2 bg-white/20 rounded-lg">{icon}</div>
      </div>
    </div>
  );
}

/** DoctorCard: reusable card for each doctor */
function DoctorCard({
  doctor,
  onBook,
  t,
  i18n,
  renderStars,
  getDayName,
  formatReviewCount,
}) {
  // Highlighting & visual badges
  const isTopRated = doctor.rating >= 4.5;
  
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group relative">
      {isTopRated && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
          <StarIconSolid className="w-3 h-3" />
          <span>{t('top_rated')}</span>
        </div>
      )}

      {/* Header image */}
      <div className="relative h-32 bg-gradient-to-r from-primary-400 to-primary-500">
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-white to-gray-100 rounded-2xl flex items-center justify-center overflow-hidden ring-4 ring-white shadow-xl">
              {doctor.profileImage ? (
                <img
                  src={doctor.profileImage}
                  alt={doctor.name}
                  className="w-24 h-24 object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-24 h-24 bg-primary-100 flex items-center justify-center">
                  <span role="img" aria-label="Doctor" className="text-3xl">👨‍⚕️</span>
                </div>
              )}
            </div>
            {doctor.isVerified && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow">
                <CheckBadgeIcon className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Doctor Info */}
      <div className="pt-16 px-6 pb-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {i18n.language === 'ar' ? 'د.' : 'Dr.'} {doctor.name}
          </h3>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-primary-700 font-medium text-base">
              {translateMedicalText(doctor.specialization?.name || t('general_practitioner'), i18n.language)}
            </span>
            {doctor.location && (
              <span className="inline-flex items-center mt-1 text-xs text-gray-500 gap-1">
                <MapPinIcon className="w-4 h-4" /> {doctor.location}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex flex-col items-center gap-2 mt-3">
            {renderStars(doctor.rating)}
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span className="font-medium">
                {formatReviewCount(doctor.reviewCount)} {t('reviews')}
              </span>
              <span className="text-gray-400">•</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  doctor.rating >= 4.5
                    ? 'bg-green-100 text-green-800'
                    : doctor.rating >= 4.0
                    ? 'bg-blue-100 text-blue-800'
                    : doctor.rating >= 3.5
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {doctor.rating >= 4.5
                  ? t('excellent')
                  : doctor.rating >= 4.0
                  ? t('very_good')
                  : doctor.rating >= 3.5
                  ? t('good')
                  : t('average')}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          {/* Experience */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
            <span className="text-gray-700 font-medium">{t('experience')}</span>
            <span className="text-blue-600 font-bold">
              {doctor.experienceYears}{' '}
              {doctor.experienceYears === 1 ? t('year') : t('years')}
            </span>
          </div>
          {/* Contact Info */}
          <div className="space-y-1 text-gray-600">
            <div className="flex items-center gap-2">
              <EnvelopeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm truncate">{doctor.email}</span>
            </div>
            {doctor.phone && (
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm">{doctor.phone}</span>
              </div>
            )}
          </div>
          {/* Availability */}
          {Array.isArray(doctor.availability) && doctor.availability.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-1">
                {t('available_days')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {doctor.availability.slice(0, 3).map((item, idx) => (
                  <span
                    key={item.day + idx}
                    className="px-3 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-lg border border-primary-200"
                  >
                    {getDayName(item.day)}
                  </span>
                ))}
                {doctor.availability.length > 3 && (
                  <span className="px-3 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                    +{doctor.availability.length - 3} {t('more')}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Book Button */}
        <button
          onClick={() => onBook(doctor)}
          className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label={t('book_appointment_btn')}
        >
          <CalendarIcon className="w-5 h-5" />
          {t('book_appointment_btn')}
        </button>
      </div>
    </div>
  );
}

export default DoctorList;
