
import { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from 'react-router-dom';

import AuthPage from './AuthPage.jsx';
import StudentDashboard from './StudentDashboard.jsx';
import AdminDashboard from './AdminDashboard.jsx';

import './App.css';

// Backend API URL:
// Local development: create a .env file with
// VITE_API_URL=http://localhost:5000
//
// Production: configure VITE_API_URL to your deployed backend URL.
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000')
  .replace(/\/+$/, '');

function LoginPage() {
  const [role, setRole] = useState('Student');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();
    setMessage('');

    const email = userId.trim().toLowerCase();

    if (!email || !password) {
      setMessage('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please try again.');
      }

      if (!data.user || !data.token) {
        throw new Error('Invalid response from the server.');
      }

      const expectedRole = role.toLowerCase();

      if (data.user.role !== expectedRole) {
        setMessage(
          `This account is not an ${expectedRole} account. Please select the correct login type.`
        );
        return;
      }

      // Save login information after successful authentication.
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate(expectedRole === 'student' ? '/student' : '/admin', {
        replace: true,
      });
    } catch (error) {
      if (error instanceof TypeError) {
        setMessage(
          'Cannot connect to the server. Please check your internet connection or backend deployment.'
        );
      } else {
        setMessage(error.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  function changeRole(nextRole) {
    setRole(nextRole);
    setMessage('');
    setPassword('');
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <h2>Course Management System</h2>

        <div className="nav-buttons">
          <button
            type="button"
            onClick={() => changeRole('Student')}
            aria-pressed={role === 'Student'}
            disabled={loading}
          >
            Student
          </button>

          <button
            type="button"
            onClick={() => changeRole('Admin')}
            aria-pressed={role === 'Admin'}
            disabled={loading}
          >
            Admin
          </button>
        </div>
      </nav>

      <main className="auth-page">
        <section className="auth-card">
          <h1>{role} Login</h1>
          <p>Sign in to your Course Management account.</p>

          <form onSubmit={handleLogin}>
            <label htmlFor="login-email">
              Email
            </label>

            <input
              id="login-email"
              type="email"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
              disabled={loading}
            />

            <label htmlFor="login-password">
              Password
            </label>

            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              disabled={loading}
            />

            {message && (
              <p className="error-message" role="alert">
                {message}
              </p>
            )}

            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          {role === 'Student' && (
            <p>
              New student?{' '}
              <button
                type="button"
                onClick={() => navigate('/account')}
                disabled={loading}
              >
                Create an account
              </button>
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

function ProtectedRoute({ role, children }) {
  const token = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');

  if (!token || !savedUser) {
    return <Navigate to="/" replace />;
  }

  try {
    const user = JSON.parse(savedUser);

    if (!user || user.role !== role.toLowerCase()) {
      return <Navigate to="/" replace />;
    }

    return children;
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    return <Navigate to="/" replace />;
  }
}

export default function App() {
  return (
    <BrowserRouter basename="/course-management-system">
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          path="/account"
          element={<AuthPage />}
        />

        <Route
          path="/student"
          element={
            <ProtectedRoute role="Student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
