import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute = ({ children, roles = [] }) => {
  const { user, loading, requiresProfileCompletion } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // إذا لم يكن المستخدم مسجل الدخول
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // إذا كان المستخدم محتاج يكمل البروفايل ويحاول الدخول للـ dashboard
  if (requiresProfileCompletion && location.pathname === '/dashboard') {
    return <Navigate to="/complete-profile" replace />;
  }

  // إذا كان المستخدم محتاج يكمل البروفايل ولكن ليس في صفحة إكمال البروفايل
  if (requiresProfileCompletion && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  // التحقق من الصلاحيات إذا كانت محددة
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;