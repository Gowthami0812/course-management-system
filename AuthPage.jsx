
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(
        `${API}/auth/${isRegister ? 'register' : 'login'}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...(isRegister ? { name } : {}),
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/student');
    } catch (error) {
      setMessage(error.message || 'Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>{isRegister ? 'Create Student Account' : 'Student Login'}</h1>

        <p>
          {isRegister
            ? 'Register to enroll in courses and track your learning.'
            : 'Log in to continue learning.'}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <label>
              Full name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoComplete="name"
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label>
            Password (minimum 8 characters)
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </label>

          {message && <p role="alert">{message}</p>}

          <button type="submit" disabled={loading}>
            {loading
              ? 'Please wait...'
              : isRegister
                ? 'Create Account'
                : 'Log In'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setMessage('');
          }}
        >
          {isRegister
            ? 'Already registered? Log in'
            : 'New student? Create an account'}
        </button>
      </section>
    </main>
  );
}
