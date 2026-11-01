
import { useEffect, useState } from 'react';
import './Dashboard.css';

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');

  const savedUser = localStorage.getItem('user');
  let user = {};

  try {
    user = savedUser ? JSON.parse(savedUser) : {};
  } catch {
    user = {};
  }

  const studentName = user.name || 'Student';
  const studentEmail = user.email || 'Not available';

  const [progress, setProgress] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('courseProgress') || '{}'
      );
    } catch {
      return {};
    }
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/courses')
      .then((response) => {
        if (!response.ok) throw new Error('Could not load courses');
        return response.json();
      })
      .then(setCourses)
      .catch(() =>
        setError('Unable to load courses. Check that the backend is running.')
      );
  }, []);

  function updateProgress(courseId, value) {
    const updated = {
      ...progress,
      [courseId]: Number(value),
    };

    setProgress(updated);
    localStorage.setItem('courseProgress', JSON.stringify(updated));
  }

  const completedCourses = courses.filter(
    (course) => Number(progress[course._id] || 0) === 100
  ).length;

  const overallProgress = courses.length
    ? Math.round(
        courses.reduce(
          (total, course) => total + Number(progress[course._id] || 0),
          0
        ) / courses.length
      )
    : 0;

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <a href="/" className="dashboard-brand">CourseHub</a>

        <nav style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <a href="#profile">My Profile</a>
          <a href="#progress">My Progress</a>
          <a className="logout-link" href="/">Log out</a>
        </nav>
      </header>

      <section className="dashboard-welcome">
        <span className="dashboard-eyebrow">STUDENT PORTAL</span>
        <h1>Welcome, {studentName}!</h1>
        <p>Explore your courses and keep track of your learning journey.</p>
      </section>

      <section className="dashboard-section" id="profile">
        <h2>My Profile</h2>
        <div className="course-card">
          <h3>👤 {studentName}</h3>
          <p>Email: {studentEmail}</p>
          <p>Role: Student</p>
        </div>
      </section>

      <section className="dashboard-section" id="progress">
        <h2>My Progress</h2>
        <p className="section-subtitle">
          Track your learning progress for each available course.
        </p>

        <div className="course-grid">
          <article className="course-card">
            <h3>📚 Total Courses</h3>
            <p>{courses.length}</p>
          </article>

          <article className="course-card">
            <h3>✅ Completed Courses</h3>
            <p>{completedCourses}</p>
          </article>

          <article className="course-card">
            <h3>📈 Overall Progress</h3>
            <p>{overallProgress}%</p>
            <progress value={overallProgress} max="100" />
          </article>
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Available Courses</h2>
        <p className="section-subtitle">
          Update your progress as you work through each course.
        </p>

        {error && <p className="dashboard-error">{error}</p>}

        {!error && courses.length === 0 && (
          <div className="empty-state">
            <span>📚</span>
            <h3>No courses available yet</h3>
            <p>Your administrator can add courses for you to explore.</p>
          </div>
        )}

        <div className="course-grid">
          {courses.map((course) => {
            const courseProgress = Number(progress[course._id] || 0);

            return (
              <article className="course-card" key={course._id}>
                <span className="course-category">{course.category}</span>
                <h3>{course.title}</h3>
                <p>
                  {course.description ||
                    'Explore this course and begin learning.'}
                </p>

                <div className="course-meta">
                  <span>Instructor: {course.instructor}</span>
                  <span>{course.duration}</span>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label htmlFor={`progress-${course._id}`}>
                    Your progress: {courseProgress}%
                  </label>

                  <progress
                    value={courseProgress}
                    max="100"
                    style={{ display: 'block', width: '100%', margin: '8px 0' }}
                  />

                  <input
                    id={`progress-${course._id}`}
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={courseProgress}
                    onChange={(event) =>
                      updateProgress(course._id, event.target.value)
                    }
                    style={{ width: '100%' }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
