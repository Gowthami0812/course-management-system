
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

function LoginPage() {
  const [role, setRole] = useState('Student');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();
    setMessage('');

    if (!userId.trim() || !password) {
      setMessage('Please enter your email and password.');
      return;
    }

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userId.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      if (
        (role === 'Student' && data.user.role !== 'student') ||
        (role === 'Admin' && data.user.role !== 'admin')
      ) {
        setMessage(`This account is not an ${role.toLowerCase()} account.`);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate(role === 'Student' ? '/student' : '/admin');
    } catch (error) {
      setMessage(error.message || 'Could not connect to the server.');
    }
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <h2>Course Management System</h2>

        <div className="nav-buttons">
          <button
            type="button"
            onClick={() => {
              setRole('Student');
              setMessage('');
            }}
          >
            Student
          </button>

          <button
            type="button"
            onClick={() => {
              setRole('Admin');
              setMessage('');
            }}
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
            <label>
              Email
              <input
                type="email"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </label>

            {message && <p role="alert">{message}</p>}

            <button type="submit">Log In</button>
          </form>

          {role === 'Student' && (
            <p>
              New student?{' '}
              <button
                type="button"
                onClick={() => navigate('/account')}
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

    if (user.role !== role.toLowerCase()) {
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route path="/account" element={<AuthPage />} />

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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
