import React from 'react'
import { Navigate } from 'react-router-dom';

const userData = JSON.parse(localStorage.getItem('user'));

export function AdminProtectedRoutes({children}) {
  if (!userData || userData.role !== 'admin') {
    return <Navigate to="/login" />;
  }
  return children;
}

export function UserProtectedRoutes({children}) {
  if (!userData) {
    return <Navigate to="/login" />;
  }
  return children;
}