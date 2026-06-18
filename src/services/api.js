import axios from 'axios';

const BASE_URL = 'https://re3aya-backend.vercel.app/api';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  googleLogin: (token) => api.post('/auth/google', token),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  completeProfile: (profileData) => api.patch('/auth/complete-profile', profileData),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  createSpecialization: (data) => api.post('/admin/specializations', data),
  getStats: () => api.get('/admin/stats'),
};

export const doctorAPI = {
  getProfile: () => api.get('/doctor/profile'),
  updateProfile: (data) => api.put('/doctor/profile', data), 
  getAppointments: (params) => api.get('/doctor/appointments', { params }),
  cancelAppointment: (appointmentId, reason) => 
    api.put(`/doctor/appointments/${appointmentId}/cancel`, { cancellationReason: reason }),
  getStats: () => api.get('/doctor/stats'),
  getAppointmentDetails: (appointmentId) => 
    api.get(`/doctor/appointments/${appointmentId}`),
  completeAppointment: (appointmentId, data) => 
    api.put(`/doctor/appointments/${appointmentId}/complete`, data),
  // إدارة الجدول الزمني
  getSchedule: (params) => api.get('/doctor/schedule', { params }),
  
saveSchedule: (data) => {
    const requestData = {
      date: data.date,
      isWorkingDay: data.isWorkingDay,
      availableTimes: data.availableTimes 
    };
    
    console.log('📤 البيانات المرسلة بدون تعديل:', JSON.stringify(requestData, null, 2));
    
    return api.post('/doctor/schedule', requestData);
  },
};

export const patientAPI = {
  getDoctors: (params) => api.get('/patient/doctors', { params }),
  getDoctorDetails: (doctorId) => api.get(`/patient/doctors/${doctorId}`),
  bookAppointment: (data) => api.post('/patient/appointments', data),
  getAppointments: (params) => api.get('/patient/appointments', { params }),
  cancelAppointment: (appointmentId, reason) => 
    api.put(`/patient/appointments/${appointmentId}/cancel`, { cancellationReason: reason }),
  getAvailableSlots: (doctorId, date) => 
    api.get(`/patient/available-slots/${doctorId}?date=${date}`),
  getStats: () => api.get('/patient/stats'),
};

// إضافة الـ APIs الجديدة
export const specializationAPI = {
  getSpecializations: () => api.get('/specializations'),
  updateSpecialization: (specializationId, data) => api.put(`/specializations/${specializationId}`, data),
  deleteSpecialization: (specializationId) => api.delete(`/specializations/${specializationId}`),
  uploadSpecializationImage: (specializationId, formData) => 
    api.post(`/specializations/${specializationId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteSpecializationImage: (specializationId) => api.delete(`/specializations/${specializationId}/image`),
};

export const uploadAPI = {
  uploadProfileImage: (formData) => api.post('/upload/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProfileImage: () => api.delete('/upload/profile-image'),
};

export { publicAPI } from './publicAPI';
export default api;