'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'

interface Task {
  id: number
  text: string
  completed: boolean
}

interface Note {
  id: number
  title: string
  content: string
  color: string
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes' | 'weather' | 'profile'>('tasks')
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskInput, setTaskInput] = useState('')
  const [notes, setNotes] = useState<Note[]>([])
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteColor, setNoteColor] = useState('#fef3c7')
  const [weather, setWeather] = useState<any>(null)
  const [location, setLocation] = useState<string>('')
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks')
    const savedNotes = localStorage.getItem('notes')
    if (savedTasks) setTasks(JSON.parse(savedTasks))
    if (savedNotes) setNotes(JSON.parse(savedNotes))

    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes))
  }, [notes])

  const addTask = () => {
    if (taskInput.trim()) {
      setTasks([...tasks, { id: Date.now(), text: taskInput, completed: false }])
      setTaskInput('')
    }
  }

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const addNote = () => {
    if (noteTitle.trim() || noteContent.trim()) {
      setNotes([...notes, {
        id: Date.now(),
        title: noteTitle || 'Untitled',
        content: noteContent,
        color: noteColor
      }])
      setNoteTitle('')
      setNoteContent('')
    }
  }

  const deleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id))
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`)
          fetchWeather(latitude, longitude)
        },
        (error) => {
          setLocation('Location unavailable')
        }
      )
    }
  }

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      )
      const data = await response.json()
      setWeather(data.current_weather)
    } catch (error) {
      console.error('Weather fetch failed:', error)
    }
  }

  const getWeatherIcon = (code: number) => {
    if (code === 0) return '☀️'
    if (code <= 3) return '⛅'
    if (code <= 67) return '🌧️'
    if (code <= 77) return '❄️'
    if (code <= 82) return '🌧️'
    return '⛈️'
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>📱 Mobile App</h1>
        <div className={styles.time}>
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </header>

      <main className={styles.main}>
        {activeTab === 'tasks' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>✓ Tasks</h2>
            <div className={styles.inputGroup}>
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                placeholder="Add a new task..."
                className={styles.input}
              />
              <button onClick={addTask} className={styles.addButton}>+</button>
            </div>
            <div className={styles.taskList}>
              {tasks.length === 0 ? (
                <p className={styles.emptyState}>No tasks yet. Add one above!</p>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className={styles.taskItem}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className={styles.checkbox}
                    />
                    <span className={task.completed ? styles.completed : ''}>
                      {task.text}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className={styles.deleteButton}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>📝 Notes</h2>
            <div className={styles.noteForm}>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note title..."
                className={styles.input}
              />
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Note content..."
                className={styles.textarea}
                rows={4}
              />
              <div className={styles.colorPicker}>
                {['#fef3c7', '#fecaca', '#bbf7d0', '#bfdbfe', '#e9d5ff'].map(color => (
                  <button
                    key={color}
                    className={styles.colorButton}
                    style={{
                      backgroundColor: color,
                      border: noteColor === color ? '3px solid #4F46E5' : 'none'
                    }}
                    onClick={() => setNoteColor(color)}
                  />
                ))}
              </div>
              <button onClick={addNote} className={styles.primaryButton}>
                Add Note
              </button>
            </div>
            <div className={styles.noteGrid}>
              {notes.length === 0 ? (
                <p className={styles.emptyState}>No notes yet. Create one above!</p>
              ) : (
                notes.map(note => (
                  <div
                    key={note.id}
                    className={styles.note}
                    style={{ backgroundColor: note.color }}
                  >
                    <div className={styles.noteHeader}>
                      <h3>{note.title}</h3>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className={styles.deleteButton}
                      >
                        ×
                      </button>
                    </div>
                    <p>{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'weather' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>🌤️ Weather</h2>
            <button onClick={getLocation} className={styles.primaryButton}>
              Get My Location & Weather
            </button>
            {location && (
              <div className={styles.weatherCard}>
                <p className={styles.location}>📍 {location}</p>
                {weather && (
                  <div className={styles.weatherInfo}>
                    <div className={styles.weatherIcon}>
                      {getWeatherIcon(weather.weathercode)}
                    </div>
                    <div className={styles.temperature}>
                      {Math.round(weather.temperature)}°C
                    </div>
                    <p>Wind: {weather.windspeed} km/h</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>👤 Profile</h2>
            <div className={styles.profileCard}>
              <div className={styles.avatar}>👤</div>
              <h3>Mobile User</h3>
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <div className={styles.statValue}>{tasks.length}</div>
                  <div className={styles.statLabel}>Tasks</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statValue}>{notes.length}</div>
                  <div className={styles.statLabel}>Notes</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statValue}>
                    {tasks.filter(t => t.completed).length}
                  </div>
                  <div className={styles.statLabel}>Completed</div>
                </div>
              </div>
              <div className={styles.deviceInfo}>
                <p><strong>Device:</strong> {navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}</p>
                <p><strong>Screen:</strong> {window.innerWidth}×{window.innerHeight}</p>
                <p><strong>Online:</strong> {navigator.onLine ? '✓' : '✗'}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className={styles.navbar}>
        <button
          className={activeTab === 'tasks' ? styles.active : ''}
          onClick={() => setActiveTab('tasks')}
        >
          <span className={styles.icon}>✓</span>
          <span className={styles.label}>Tasks</span>
        </button>
        <button
          className={activeTab === 'notes' ? styles.active : ''}
          onClick={() => setActiveTab('notes')}
        >
          <span className={styles.icon}>📝</span>
          <span className={styles.label}>Notes</span>
        </button>
        <button
          className={activeTab === 'weather' ? styles.active : ''}
          onClick={() => setActiveTab('weather')}
        >
          <span className={styles.icon}>🌤️</span>
          <span className={styles.label}>Weather</span>
        </button>
        <button
          className={activeTab === 'profile' ? styles.active : ''}
          onClick={() => setActiveTab('profile')}
        >
          <span className={styles.icon}>👤</span>
          <span className={styles.label}>Profile</span>
        </button>
      </nav>
    </div>
  )
}
