import api from './api';

export const publicAPI = {
  getDoctors: () => api.get('/public/doctors'),
  getDoctorDetails: (doctorId) => api.get(`/public/doctors/${doctorId}`),
  getSpecializations: () => api.get('/public/specializations'),
  getStats: () => api.get('/public/stats'),
};

export default publicAPI;