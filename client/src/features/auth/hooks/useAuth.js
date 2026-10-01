import { useState } from 'react';
import { useAuthContext } from '../context/AuthContext.jsx';
import { useToast } from '../../../contexts/ToastContext.jsx';

export const useAuth = () => {
  const authContext = useAuthContext();
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (credentials) => {
    try {
      setSubmitting(true);
      setError(null);
      const res = await authContext.login(credentials);
      addToast('Welcome back! Logged in successfully.', 'success');
      return res;
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (payload) => {
    try {
      setSubmitting(true);
      setError(null);
      const res = await authContext.register(payload);
      addToast('Account created successfully!', 'success');
      return res;
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authContext.logout();
      addToast('Logged out safely.', 'info');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return {
    ...authContext,
    submitting,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout
  };
};
