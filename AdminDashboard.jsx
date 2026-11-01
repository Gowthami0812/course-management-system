
import { useEffect, useState } from 'react';
import './Dashboard.css';

export default function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    title: '',
    instructor: '',
    category: '',
    duration: '',
    description: '',
  });

  async function loadCourses() {
    try {
      const response = await fetch('http://localhost:5000/api/courses');
      if (!response.ok) throw new Error();
      setCourses(await response.json());
    } catch {
      setMessage('Could not load courses. Check the backend.');
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function addCourse(event) {
    event.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not add course');

      setForm({
        title: '',
        instructor: '',
        category: '',
        duration: '',
        description: '',
      });
      setMessage('Course added successfully!');
      await loadCourses();
    } catch (error) {
      setMessage(error.message || 'Could not add course.');
    }
  }

  async function deleteCourse(id) {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/courses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Could not delete course');

      setMessage('Course deleted.');
      await loadCourses();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <a href="/" className="dashboard-brand">CourseHub · Admin</a>
        <a className="logout-link" href="/">Log out</a>
      </header>

      <section className="dashboard-welcome">
        <span className="dashboard-eyebrow">ADMIN PORTAL</span>
        <h1>Course management</h1>
        <p>Create and manage the courses in your system.</p>
      </section>

      <section className="dashboard-section">
        <h2>Add a course</h2>
        <form className="course-form" onSubmit={addCourse}>
          <input name="title" placeholder="Course title" value={form.title} onChange={updateField} required />
          <input name="instructor" placeholder="Instructor name" value={form.instructor} onChange={updateField} required />
          <input name="category" placeholder="Category" value={form.category} onChange={updateField} required />
          <input name="duration" placeholder="Duration (e.g. 6 weeks)" value={form.duration} onChange={updateField} required />
          <textarea name="description" placeholder="Course description" value={form.description} onChange={updateField} />
          <button className="dashboard-button" type="submit">Add course</button>
        </form>

        {message && <p className="dashboard-message" role="status">{message}</p>}
      </section>

      <section className="dashboard-section">
        <h2>Manage courses ({courses.length})</h2>
        <div className="course-grid">
          {courses.map((course) => (
            <article className="course-card" key={course._id}>
              <span className="course-category">{course.category}</span>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="course-meta">
                <span>{course.instructor}</span>
                <span>{course.duration}</span>
              </div>
              <button className="delete-button" onClick={() => deleteCourse(course._id)}>
                Delete course
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

