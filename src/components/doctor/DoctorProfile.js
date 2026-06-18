import React, { useState, useEffect, useCallback } from 'react';
import { doctorAPI, specializationAPI, uploadAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const MAX_IMAGE_SIZE_MB = 5;

const DoctorProfile = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Fetch profile and specializations
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await doctorAPI.getProfile();
      setProfile(data);
    } catch (error) {
      toast.error(t('error_loading_data'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchSpecializations = useCallback(async () => {
    try {
      const response = await specializationAPI.getSpecializations();
      let specializationsData = [];
      if (Array.isArray(response.data)) {
        specializationsData = response.data;
      } else if (response.data && Array.isArray(response.data.specializations)) {
        specializationsData = response.data.specializations;
      } else if (response.data && Array.isArray(response.data.data)) {
        specializationsData = response.data.data;
      } else if (Array.isArray(response)) {
        specializationsData = response;
      }
      setSpecializations(specializationsData);
    } catch {
      toast.error(t('error_loading_specializations'));
      setSpecializations([]);
    }
  }, [t]);

  useEffect(() => {
    fetchProfile();
    fetchSpecializations();
  }, [fetchProfile, fetchSpecializations]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSpecializationChange = (e) => {
    const newSpecializationId = e.target.value;
    setProfile((prev) => ({
      ...prev,
      specialization: newSpecializationId ? { _id: newSpecializationId } : null
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updateData = {
        name: profile.name,
        phone: profile.phone,
        experienceYears: profile.experienceYears,
        specialization: profile.specialization?._id || null
      };

      const { data } = await doctorAPI.updateProfile(updateData);
      setProfile(data.data);

      if (setUser) {
        setUser(prevUser => ({
          ...prevUser,
          ...data.data
        }));
      }

      toast.success(t('success_updated'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('error_updating_profile'));
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('image_file_only'));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(t('image_size_limit', { size: MAX_IMAGE_SIZE_MB }));
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const { data } = await uploadAPI.uploadProfileImage(formData);

      if (data.success) {
        setProfile((prev) => ({
          ...prev,
          profileImage: data.profileImage
        }));

        if (setUser) {
          setUser(prevUser => ({
            ...prevUser,
            profileImage: data.profileImage
          }));
        }

        toast.success(data.message || t('success_uploaded'));
      } else {
        toast.error(data.message || t('error_uploading_image'));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || t('error_uploading_image');
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm(t('confirm_delete_image'))) return;

    setUploading(true);
    try {
      const { data } = await uploadAPI.deleteProfileImage();

      if (data.success) {
        setProfile((prev) => ({
          ...prev,
          profileImage: null
        }));

        if (setUser) {
          setUser(prevUser => ({
            ...prevUser,
            profileImage: null
          }));
        }

        toast.success(data.message || t('success_deleted'));
      } else {
        toast.error(data.message || t('error_deleting_image'));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || t('error_deleting_image');
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Style improved: now omits console logs and uses cleaner fallback
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = 'https://re3aya-backend.vercel.app';
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${baseUrl}/${cleanPath}`;
  };

  if (loading) {
    return (
      <section className="flex justify-center items-center py-16 min-h-[320px]">
        <LoadingSpinner size="lg" />
      </section>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">{t('error_loading_data')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-3 md:px-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <h2 className={`text-3xl font-extrabold tracking-tight text-gray-900 mb-7 ${isRTL ? 'text-right' : 'text-left'}`}>
        {t('profile')}
      </h2>

      <div className="rounded-xl border bg-white/90 p-4 md:p-8 shadow-md ring-1 ring-gray-100 transition-all duration-300">
        <div className="flex flex-col items-center mb-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center overflow-hidden border-4 border-white shadow ring-2 ring-primary-300">
              {profile.profileImage ? (
                <img
                  src={getImageUrl(profile.profileImage)}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.target.style.display = 'none';
                    const fallback = e.target.parentElement.querySelector('.fallback-icon');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                  draggable={false}
                />
              ) : null}
              <div
                className="fallback-icon w-full h-full flex items-center justify-center transition-all"
                style={{ display: profile.profileImage ? 'none' : 'flex' }}
              >
                <span className="text-4xl text-gray-300" role="img" aria-label="doctor">👨‍⚕️</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <label className="btn-primary cursor-pointer min-w-[120px]">
                {uploading ? <LoadingSpinner size="sm" /> : t('change_image')}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              {profile.profileImage && (
                <label className="btn-primary cursor-pointer min-w-[120px] !bg-red-500 hover:!bg-red-600 !text-white transition-all disabled:opacity-70 disabled:pointer-events-none">
                  {uploading ? <LoadingSpinner size="sm" /> : t('delete_image')}
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    disabled={uploading}
                    className="hidden"
                    tabIndex={-1}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Name */}
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="name">
                {t('full_name')} <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={profile.name || ''}
                onChange={handleInputChange}
                className="form-input rounded-lg border-gray-300 focus:ring-2 focus:ring-primary-200"
                required
                autoComplete="name"
                maxLength={60}
                dir="auto"
              />
            </div>

            {/* Email */}
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="email">
                {t('email')}
              </label>
              <input
                id="email"
                type="email"
                value={profile.email}
                className="form-input bg-gray-50 border-gray-200 cursor-not-allowed text-gray-500"
                disabled
                readOnly
                dir="ltr"
              />
              <span className="text-xs text-gray-400 mt-1 inline-block">{t('cannot_change_email')}</span>
            </div>

            {/* Phone */}
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="phone">
                {t('phone_number')}
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={profile.phone || ''}
                onChange={handleInputChange}
                className="form-input rounded-lg border-gray-300 focus:ring-2 focus:ring-primary-200"
                placeholder={t('enter_phone')}
                maxLength={20}
                autoComplete="tel"
                dir="ltr"
              />
            </div>

            {/* Experience Years */}
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="experienceYears">
                {t('experience_years')} <span className="text-red-500">*</span>
              </label>
              <input
                id="experienceYears"
                type="number"
                name="experienceYears"
                value={profile.experienceYears || 0}
                onChange={handleInputChange}
                min={0}
                max={60}
                className="form-input rounded-lg border-gray-300 focus:ring-2 focus:ring-primary-200"
                required
                dir="ltr"
              />
              <span className="text-xs text-gray-400 mt-1 inline-block">{t('experience_description')}</span>
            </div>

            {/* Specialization */}
            <div className={`sm:col-span-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="specialization">
                {t('specialization')} <span className="text-red-500">*</span>
              </label>
              <select
                id="specialization"
                value={profile.specialization?._id || ''}
                onChange={handleSpecializationChange}
                className="form-input rounded-lg border-gray-300 focus:ring-2 focus:ring-primary-200"
                required
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <option value="">{t('choose_specialization')}</option>
                {Array.isArray(specializations) && specializations.map((spec) => (
                  <option key={spec._id} value={spec._id}>
                    {spec.name}
                  </option>
                ))}
              </select>
              <span className="text-xs text-gray-400 mt-1 inline-block">
                {profile.specialization?.name
                  ? `${t('current_specialization')} ${profile.specialization.name}`
                  : t('no_specialization_chosen')}
              </span>
            </div>
          </div>

          {/* Role */}
          <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
            <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="role">
              {t('role')}
            </label>
            <input
              id="role"
              type="text"
              value={t('doctor_role')}
              className="form-input bg-gray-50 border-gray-200 cursor-not-allowed text-gray-500"
              disabled
              readOnly
              dir="auto"
            />
          </div>

          {/* Join Date */}
          {profile.createdAt && (
            <div className={`text-sm text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
              <p>
                {t('joined_at')}{' '}
                <span className="font-semibold">
                  {new Date(profile.createdAt).toLocaleDateString(
                    i18n.language === 'ar' ? 'ar-EG' : 'en-US'
                  )}
                </span>
              </p>
            </div>
          )}

          {/* Save Button */}
          <div className={`flex justify-center sm:justify-end pt-6 ${isRTL ? 'sm:justify-start' : 'sm:justify-end'}`}>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary font-bold w-full sm:w-auto min-w-[140px] flex items-center justify-center gap-2 transition-all"
            >
              {saving && <LoadingSpinner size="sm" />}
              {saving ? t('saving') : t('save_all_data')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorProfile;