import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [requiresProfileCompletion, setRequiresProfileCompletion] = useState(false);

  const getUserProfile = useCallback(async () => {
    try {
      const response = await authAPI.getMe();
      const userData = response.data;
      
      setUser(userData);
      
      // تحقق إذا كان المستخدم محتاج يكمل البروفايل (مش موجود عمر)
      const needsCompletion = !userData.age && userData.authProvider === 'google';
      setRequiresProfileCompletion(needsCompletion);
      
    } catch (error) {
      console.error('Failed to get user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      getUserProfile();
    } else {
      setLoading(false);
    }
  }, [token, getUserProfile]);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token: newToken, ...userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setRequiresProfileCompletion(false); // المستخدم العادي مبيحتاجش يكمل بروفايل
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'فشل تسجيل الدخول' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token: newToken, ...userInfo } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userInfo);
      setRequiresProfileCompletion(false); // المستخدم المسجل عادي مبيحتاجش يكمل بروفايل
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'فشل إنشاء الحساب' 
      };
    }
  };

  const googleLogin = async (googleToken) => {
    try {
      const response = await authAPI.googleLogin({ token: googleToken });
      const { token: newToken, ...userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      // تحقق إذا كان المستخدم محتاج يكمل البروفايل
      const needsCompletion = !userData.age;
      setRequiresProfileCompletion(needsCompletion);
      
      return { 
        success: true, 
        requiresProfileCompletion: needsCompletion 
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'فشل تسجيل الدخول باستخدام Google' 
      };
    }
  };

  const completeProfile = async (profileData) => {
    try {
      const response = await authAPI.completeProfile(profileData);
      const updatedUser = { ...user, ...profileData };
      
      setUser(updatedUser);
      setRequiresProfileCompletion(false); // بعد ما يكمل البروفايل، خلاص مبيحتاجش
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'فشل إكمال الملف الشخصي'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setRequiresProfileCompletion(false);
  };

  const value = {
    user,
    token,
    loading,
    requiresProfileCompletion,
    setRequiresProfileCompletion,
    login,
    register,
    googleLogin,
    completeProfile,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};