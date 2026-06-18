import React, { useState, useEffect, useMemo } from 'react';
import { adminAPI, specializationAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../common/LoadingSpinner';
import { ShieldCheckIcon, UserIcon } from "@heroicons/react/24/outline";
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [tableScroll, setTableScroll] = useState(false);

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    fetchUsers();
    fetchSpecializations();
    // eslint-disable-next-line
  }, []);

  // Responsive table horizontal scroll detection
  useEffect(() => {
    const handleResize = () => {
      setTableScroll(window.innerWidth < 700);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers();
      const usersData = Array.isArray(response.data)
        ? response.data
        : response.data?.users || response.data?.data || [];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(t('error_loading_users'));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const response = await specializationAPI.getSpecializations();
      const specializationsData = Array.isArray(response.data)
        ? response.data
        : response.data?.specializations || response.data?.data || [];
      setSpecializations(specializationsData);
    } catch (error) {
      console.error('Error fetching specializations:', error);
      toast.error(t('error_loading_specializations'));
      setSpecializations([]);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(t('confirm_role_change', { role: getRoleText(newRole) }))) return;
    setUpdating(userId);
    try {
      await adminAPI.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(user =>
        user._id === userId
          ? {
              ...user,
              role: newRole,
              ...(newRole === 'patient' && { specialization: null, availability: [] }),
            }
          : user
      ));
      toast.success(t('role_changed_success', { role: getRoleText(newRole) }));
    } catch (error) {
      toast.error(error?.response?.data?.message || t('error_changing_role'));
    } finally {
      setUpdating(null);
    }
  };

  // Placeholder, adapt if backend supports specialization update.
  const handleSpecializationChange = async (userId, specializationId) => {
    toast.loading(t('updating_doctor_specialization'));
    setTimeout(() => {
      toast.success(t('specialization_update_coming_soon'));
      toast.dismiss();
    }, 1000);
  };

  const getRoleText = (role) => {
    const roles = {
      patient: t('patient'),
      doctor: t('doctor'),
      admin: t('admin')
    };
    return roles[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      patient: 'bg-blue-100 text-blue-800',
      doctor: 'bg-green-100 text-green-800',
      admin: 'bg-purple-100 text-purple-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  // Memoize filteredUsers for efficiency
  const filteredUsers = useMemo(() => users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (user.name && user.name.toLowerCase().includes(term)) ||
      (user.email && user.email.toLowerCase().includes(term));
    return matchesFilter && matchesSearch;
  }), [users, filter, searchTerm]);

  // Responsive header + info
  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 min-h-[40vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-1 sm:px-2 md:px-6 py-2 space-y-6 max-w-screen-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header & quick info */}
      <div className={`flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
          {t('user_management')}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-xs sm:text-sm text-gray-600 bg-gray-100 rounded px-3 py-1 font-medium">
            {t('total_users')}: <span className="font-bold">{users.length}</span>
          </div>
        </div>
      </div>

      {/* Filter & search */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-2 sm:p-3 md:p-4 mb-2 flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="text"
          placeholder={t('search_users_placeholder')}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="form-input w-full sm:w-auto flex-1 min-w-0 rounded-md border-gray-200 focus:ring-primary-500 focus:border-primary-400 text-xs sm:text-sm transition-all"
          autoFocus
        />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="form-input w-full sm:w-auto sm:min-w-[160px] rounded-md border-gray-200 focus:ring-primary-500 focus:border-primary-400 text-xs sm:text-sm transition-all"
        >
          <option value="all">{t('all_roles')}</option>
          <option value="patient">{t('patients')}</option>
          <option value="doctor">{t('doctors')}</option>
          <option value="admin">{t('admins')}</option>
        </select>
      </div>

      {/* User table or list */}
      <div
        className={
          `bg-white border border-gray-100 shadow-md rounded-2xl ${tableScroll ? 'overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200' : 'overflow-visible'}`
        }
      >
        {filteredUsers.length > 0 ? (
          <table className="min-w-[540px] w-full divide-y divide-gray-200 text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{t('user')}</th>
                <th className="px-2 sm:px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{t('email')}</th>
                <th className="px-2 sm:px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{t('role')}</th>
                <th className="px-2 sm:px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{t('specialization')}</th>
                <th className="px-2 sm:px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredUsers.map(user => (
                <tr key={user._id} className="hover:bg-primary-50 group transition-colors">
                  {/* User Info */}
                  <td className="px-2 sm:px-4 py-3 min-w-[140px]">
                    <div className={`flex items-center gap-2 sm:gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-primary-50 rounded-full flex items-center justify-center shadow-sm border border-primary-100 overflow-hidden">
                        {user.role === 'doctor' ? (
                          <span className="text-lg">🥼</span>
                        ) : user.role === 'admin' ? (
                          <ShieldCheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                        ) : (
                          <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500" />
                        )}
                      </div>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <div className="font-semibold text-gray-900 truncate max-w-[120px] sm:max-w-[160px]" title={user.name}>{user.name}</div>
                        <div className="text-xs text-gray-500">{user.phone || t('none')}</div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-2 sm:px-4 py-3 min-w-[140px]">
                    <div className="break-all">{user.email}</div>
                  </td>

                  {/* Role */}
                  <td className="px-2 sm:px-4 py-3">
                    <span className={`inline-flex min-w-[46px] justify-center px-2 py-1 font-bold rounded-full text-xxs sm:text-xs ${getRoleColor(user.role)}`}>
                      {getRoleText(user.role)}
                    </span>
                  </td>

                  {/* Specialization */}
                  <td className="px-2 sm:px-4 py-3 text-gray-900">
                    {user.specialization?.name
                      ? <span className="truncate max-w-[110px] sm:max-w-[180px]" title={user.specialization?.name}>{user.specialization?.name}</span>
                      : <span className="text-gray-400">---</span>
                    }
                  </td>

                  {/* Actions */}
                  <td className="px-2 sm:px-4 py-3 w-full">
                    <div className={`flex flex-col xs:flex-row gap-2 items-stretch xs:items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <select
                        value={user.role}
                        onChange={e => handleRoleChange(user._id, e.target.value)}
                        disabled={updating === user._id}
                        className={`text-xs sm:text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 disabled:opacity-60 transition w-full xs:w-auto`}
                        aria-label={t('role')}
                      >
                        <option value="patient">{t('patient')}</option>
                        <option value="doctor">{t('doctor')}</option>
                        <option value="admin">{t('admin')}</option>
                      </select>
                      {user.role === 'doctor' && (
                        <select
                          value={user.specialization?._id || ''}
                          onChange={e => handleSpecializationChange(user._id, e.target.value)}
                          className={`text-xs sm:text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 transition w-full xs:w-auto`}
                          aria-label={t('specialization')}
                        >
                          <option value="">{t('choose_specialization')}</option>
                          {Array.isArray(specializations) &&
                            specializations.map(spec => (
                              <option key={spec._id} value={spec._id}>{spec.name}</option>
                            ))
                          }
                        </select>
                      )}
                    </div>
                    {updating === user._id && (
                      <div className="mt-1">
                        <LoadingSpinner size="sm" />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 min-h-[200px]">
            <div className="text-5xl mb-2">🔍</div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{t('no_results')}</h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              {searchTerm ? t('no_users_found') : t('no_users_available')}
            </p>
          </div>
        )}
      </div>

      {/* Quick statistics */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl shadow-sm px-4 py-4 flex flex-col items-center">
          <span className="text-xl sm:text-2xl font-extrabold text-blue-600 mb-0.5">
            {users.filter(u => u.role === 'patient').length}
          </span>
          <span className="text-xs sm:text-sm text-gray-700">{t('patient')}</span>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl shadow-sm px-4 py-4 flex flex-col items-center">
          <span className="text-xl sm:text-2xl font-extrabold text-green-600 mb-0.5">
            {users.filter(u => u.role === 'doctor').length}
          </span>
          <span className="text-xs sm:text-sm text-gray-700">{t('doctor')}</span>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-2xl shadow-sm px-4 py-4 flex flex-col items-center">
          <span className="text-xl sm:text-2xl font-extrabold text-purple-600 mb-0.5">
            {users.filter(u => u.role === 'admin').length}
          </span>
          <span className="text-xs sm:text-sm text-gray-700">{t('admin')}</span>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;