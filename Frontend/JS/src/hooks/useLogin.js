import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as yup from 'yup';
import { useAuthContext } from '@/context/useAuthContext';
import httpClient from '@/helpers/httpClient';
import axios from 'axios';

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { saveSession } = useAuthContext();
  const [searchParams] = useSearchParams();

  const loginFormSchema = yup.object({
    username: yup.string().required('Please enter your username'), // keep username
    password: yup.string().required('Please enter your password'),
  });

  const { control, handleSubmit, setError } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const redirectUser = () => {
    const redirectLink = searchParams.get('redirectTo');
    if (redirectLink) navigate(redirectLink);
    else navigate('/dashboard-1');
  };

  const login = handleSubmit(async (values) => {
  try {
    setLoading(true);

    // Login API call
    const res = await httpClient.post("login/", values);

    if (res.data.access) {
      // ✅ Save tokens in localStorage (optional)
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);

      // ✅ Save session (your existing context method)
      saveSession({
        ...(res.data ?? {}),
        token: res.data.access,
        refresh: res.data.refresh,
      });

      // ✅ Save user info to localStorage
      // Adjust this line based on your API response structure
      const user = res.data.user;
localStorage.setItem('user', JSON.stringify(user));

      // ✅ Redirect user after login
      redirectUser();
    }
} catch (e) {
  if (e.response) {
    console.error("Login failed:", e.response.data);
    setError('username', { type: 'custom', message: 'Invalid credentials' });
    setError('password', { type: 'custom', message: 'Invalid credentials' });
  } else {
    console.error("Network error:", e.message);
    setError('username', { type: 'custom', message: 'Server not reachable' });
    setError('password', { type: 'custom', message: 'Please try again later' });
  }

  } finally {
    setLoading(false);
  }
});
  return { loading, login, control };
};

export default useLogin;
