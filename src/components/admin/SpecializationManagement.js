import React, { useState, useEffect, useRef } from 'react';
import { specializationAPI, adminAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const SpecializationManagement = () => {
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Add ref to scroll to form
  const formRef = useRef(null);

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    fetchSpecializations();
    // eslint-disable-next-line
  }, []);

  const fetchSpecializations = async () => {
    try {
      const response = await specializationAPI.getSpecializations();
      // Handle different response structures
      const specializationsData = Array.isArray(response.data) ? response.data : 
                                response.data?.specializations || response.data?.data || [];
      setSpecializations(specializationsData);
    } catch (error) {
      console.error('Error fetching specializations:', error);
      toast.error(t('error_loading_specializations'));
      setSpecializations([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        toast.error(t('only_images_allowed'));
        return;
      }
      
      // التحقق من حجم الملف (5MB كحد أقصى)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('image_size_exceeded'));
        return;
      }
      
      setSelectedImage(file);
    }
  };

  const uploadImage = async (specializationId) => {
    if (!selectedImage) return null;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('specializationImage', selectedImage);
      
      const response = await specializationAPI.uploadSpecializationImage(specializationId, formData);
      return response.data.image;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.response?.data?.message || t('error_uploading_image'));
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let specializationId;
      
      if (editing) {
        // تحديث التخصص
        const response = await specializationAPI.updateSpecialization(editing._id, formData);
        specializationId = editing._id;
        
        // رفع الصورة إذا تم اختيار صورة جديدة
        if (selectedImage) {
          await uploadImage(specializationId);
        }
        
        toast.success(t('specialization_updated_success'));
      } else {
        // إنشاء تخصص جديد
        const response = await adminAPI.createSpecialization(formData);
        specializationId = response.data._id;
        
        // رفع الصورة إذا تم اختيار صورة
        if (selectedImage) {
          await uploadImage(specializationId);
        }
        
        toast.success(t('specialization_created_success'));
      }

      // إعادة تعيين النموذج
      setFormData({ name: '', description: '' });
      setSelectedImage(null);
      setShowForm(false);
      setEditing(null);

      // إعادة تحميل التخصصات
      fetchSpecializations();
    } catch (error) {
      toast.error(error.response?.data?.message || t('error_saving_specialization'));
    } finally {
      setSubmitting(false);
    }
  };

  // Editing: scroll to form after showing it
  const handleEdit = (specialization) => {
    setEditing(specialization);
    setFormData({
      name: specialization.name,
      description: specialization.description || ''
    });
    setSelectedImage(null);
    setShowForm(true);

    // Scroll to the form area smoothly after render
    // setTimeout allows the DOM to update first
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleDelete = async (specializationId) => {
    if (!window.confirm(t('confirm_delete_specialization'))) return;

    try {
      await specializationAPI.deleteSpecialization(specializationId);
      toast.success(t('specialization_deleted_success'));
      fetchSpecializations();
    } catch (error) {
      toast.error(error.response?.data?.message || t('error_deleting_specialization'));
    }
  };

  const handleDeleteImage = async (specializationId) => {
    if (!window.confirm(t('confirm_delete_image'))) return;

    try {
      await specializationAPI.deleteSpecializationImage(specializationId);
      toast.success(t('image_deleted_success'));
      fetchSpecializations();
    } catch (error) {
      toast.error(error.response?.data?.message || t('error_deleting_image'));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditing(null);
    setFormData({ name: '', description: '' });
    setSelectedImage(null);
  };

  const getImageUrl = (specialization) => {
    if (specialization.image) {
      return specialization.image;
    }
    
    // صور افتراضية للتخصصات المختلفة
    const defaultImages = {
      'القلب والأوعية الدموية': '/images/cardiology.jpg',
      'أطفال': '/images/pediatrics.jpg',
      'جراحة العظام': '/images/orthopedics.jpg',
      'عيون': '/images/ophthalmology.jpg',
      'أسنان': '/images/dentistry.jpg',
      'مخ وأعصاب': '/images/neurology.jpg',
      'الجراحة العامة': '/images/surgery.jpg',
      'نساء والتوليد': '/images/gynecology.jpg',
      'جلدية': '/images/dermatology.jpg',
      'باطنة': '/images/internal-medicine.jpg',
      'أنف وأذن وحنجره': '/images/ent.jpg',
      'الجهاز الهضمي': '/images/gastroenterology.jpg'
    };
    
    return defaultImages[specialization.name] || '/images/default-specialization.jpg';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[250px] py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 ${isRTL ? 'text-right' : 'text-left'}`}>
        <h2 className="text-2xl font-bold text-gray-900">{t('specialization_management')}</h2>
        <button
          onClick={() => {
            setShowForm(true);
            // Also scroll to form when adding new
            setTimeout(() => {
              if (formRef.current) {
                formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 100);
          }}
          className="btn-primary w-full sm:w-auto"
        >
          + {t('add_new_specialization')}
        </button>
      </div>

      {/* نموذج إضافة/تعديل التخصص */}
      {showForm && (
        <div
          className="card mb-6 px-3 py-4 max-w-xl mx-auto shadow-lg"
          ref={formRef}
        >
          <h3 className={`text-lg font-semibold text-gray-900 mb-4 text-center ${isRTL ? 'text-right' : 'text-left'}`}>
            {editing ? t('edit_specialization') : t('add_new_specialization')}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* حقل رفع الصورة */}
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('specialization_image')} ({t('optional')})
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="form-input w-full"
              />
              {selectedImage && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">{t('image_selected')}: {selectedImage.name}</p>
                </div>
              )}
              {editing?.image && !selectedImage && (
                <div className="mt-2">
                  <p className="text-sm text-blue-600">{t('current_image')}</p>
                  <img 
                    src={editing.image} 
                    alt={editing.name}
                    className="w-20 h-20 object-cover rounded mt-1"
                  />
                </div>
              )}
            </div>

            <div className={isRTL ? 'text-right' : 'text-left'}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('specialization_name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder={t('enter_specialization_name')}
                required
              />
            </div>

            <div className={isRTL ? 'text-right' : 'text-left'}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('description')} ({t('optional')})
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="form-input w-full"
                placeholder={t('enter_specialization_description')}
              />
            </div>

            <div className={`flex flex-col sm:flex-row gap-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="btn-primary"
              >
                {submitting || uploadingImage ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  editing ? t('update') : t('add')
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* قائمة التخصصات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Safe array mapping */}
        {Array.isArray(specializations) && specializations.map((specialization) => (
          <div key={specialization._id} className="card hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between">
            <div>
              {/* صورة التخصص */}
              <div className="mb-4 relative">
                <img
                  src={getImageUrl(specialization)}
                  alt={specialization.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
                {specialization.image && (
                  <button
                    onClick={() => handleDeleteImage(specialization._id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    title={t('delete_image')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <div className={`flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                <h3 className="text-lg font-semibold text-gray-900 truncate max-w-[70vw]">
                  {specialization.name}
                </h3>
                <div className="flex gap-1 mt-2 sm:mt-0">
                  <button
                    onClick={() => handleEdit(specialization)}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium border border-blue-100 rounded py-1 px-2 transition-colors"
                  >
                    {t('edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(specialization._id)}
                    className="text-red-600 hover:text-red-800 text-xs font-medium border border-red-100 rounded py-1 px-2 transition-colors"
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>

              {specialization.description && (
                <p className={`text-gray-600 text-sm mb-3 break-words ${isRTL ? 'text-right' : 'text-left'}`}>
                  {specialization.description.length > 150
                    ? specialization.description.slice(0, 150) + '...'
                    : specialization.description}
                </p>
              )}
            </div>

            <div className={`text-xs text-gray-500 border-t pt-3 mt-auto ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className="flex justify-between flex-wrap gap-x-2">
                <span>{t('created_by')}:</span>
                <span className="font-medium text-right truncate max-w-[70%]">
                  {specialization.createdBy?.name || t('system')}
                </span>
              </div>
              <div className="flex justify-between flex-wrap mt-1 gap-x-2">
                <span>{t('creation_date')}:</span>
                <span className="ltr:ml-auto rtl:mr-auto">
                  {new Date(specialization.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!Array.isArray(specializations) || specializations.length === 0) && (
        <div className="text-center py-12">
          <div className="text-5xl mb-3 animate-bounce">🏥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('no_specializations')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('no_specializations_description')}
          </p>
          <button
            onClick={() => {
              setShowForm(true);
              setTimeout(() => {
                if (formRef.current) {
                  formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 100);
            }}
            className="btn-primary mt-2"
          >
            {t('add_first_specialization')}
          </button>
        </div>
      )}

      {/* إحصائيات */}
      <div className="card mt-6 bg-gray-50">
        <h3 className={`text-lg font-semibold text-gray-900 mb-3 text-center ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('specializations_info')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-primary-600">{Array.isArray(specializations) ? specializations.length : 0}</div>
            <div className="text-gray-700 font-medium mt-1">{t('total_specializations')}</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-green-600">
              {Array.isArray(specializations) ? specializations.filter(s => s.isActive).length : 0}
            </div>
            <div className="text-gray-700 font-medium mt-1">{t('active_specialization')}</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-blue-600">
              {Array.isArray(specializations) ? specializations.filter(s => s.image).length : 0}
            </div>
            <div className="text-gray-700 font-medium mt-1">{t('specializations_with_images')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecializationManagement;