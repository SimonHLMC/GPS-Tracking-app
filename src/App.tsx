import React, { useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GpsTracker from './components/GpsTracker';
import TaskMap from './components/TaskMap';
import TaskList from './components/TaskList';
import EmailLogin from './components/EmailLogin';
import { Task, GpsPoint, createTask, loadTasks, saveTasks } from './utils/storage';
import { sendReport } from './utils/email';
import './App.css';

function AppContent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [currentPosition, setCurrentPosition] = useState<GpsPoint | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Lade Aufträge beim Start
  useEffect(() => {
    const loadedTasks = loadTasks();
    setTasks(loadedTasks);
    if (loadedTasks.length > 0) {
      setSelectedTask(loadedTasks[0]);
    }
  }, []);

  // Speichere Aufträge wenn sie sich ändern
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const handleStartTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) {
      alert('Bitte Auftragsnamen eingeben');
      return;
    }

    const newTask = createTask(newTaskName);
    setTasks([newTask, ...tasks]);
    setSelectedTask(newTask);
    setNewTaskName('');
  };

  const handleLocationUpdate = (point: GpsPoint) => {
    // Aktualisiere aktuelle Position
    setCurrentPosition(point);

    if (!selectedTask || selectedTask.completed) return;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === selectedTask.id ? { ...task, points: [...task.points, point] } : task
      )
    );

    setSelectedTask((prev) =>
      prev ? { ...prev, points: [...prev.points, point] } : null
    );
  };

  const handleCompleteTask = async (taskId: string) => {
    if (!userEmail) {
      alert('Bitte melde dich zuerst an');
      return;
    }

    // Finde Task VOR State Update
    const completedTask = tasks.find((t) => t.id === taskId);
    
    if (!completedTask) {
      alert('Auftrag nicht gefunden');
      return;
    }

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              endTime: Date.now(),
              completed: true,
            }
          : task
      )
    );

    // Sende Email mit gefundener Task
    setIsSending(true);
    try {
      await sendReport({ task: completedTask }, userEmail);
      
      setTimeout(() => {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, emailSent: true } : task
          )
        );
        setIsSending(false);
        alert('✓ Report versendet!');
      }, 1000);
    } catch (error) {
      console.error('Error sending report:', error);
      alert('× Fehler beim Versenden: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
      setIsSending(false);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Auftrag wirklich löschen?')) {
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId));
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
    }
  };

  const handleAddHectares = (taskId: string, hectares: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              hectareEntries: [
                ...task.hectareEntries,
                {
                  id: Date.now().toString(),
                  value: hectares,
                  timestamp: Date.now(),
                },
              ],
            }
          : task
      )
    );
  };

  const handleRemoveHectareEntry = (taskId: string, entryId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              hectareEntries: task.hectareEntries.filter((e) => e.id !== entryId),
            }
          : task
      )
    );
  };

  const handleLogin = (email: string, name: string) => {
    setUserEmail(email);
    setUserName(name);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌍 GPS Tracking - Feldarbeiten</h1>
        <p>Verwalte deine Aufträge mit GPS-Tracking</p>
      </header>

      <main className="app-main">
        {/* Email Login */}
        <EmailLogin
          onLogin={handleLogin}
          isLoggedIn={!!userEmail}
          userEmail={userEmail}
          userName={userName}
        />

        {/* Neuer Auftrag starten */}
        <section className="new-task-section">
          <h2>Neuer Auftrag</h2>
          <form onSubmit={handleStartTask} className="new-task-form">
            <input
              type="text"
              placeholder="Auftrags-Name eingeben (z.B. 'Feldbearbeitung Süd')"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="task-name-input"
            />
            <button type="submit" className="btn-start-task">
              ➕ Auftrag starten
            </button>
          </form>
        </section>

        {/* GPS Tracking active task */}
        {selectedTask && !selectedTask.completed && (
          <section className="tracking-section">
            <GpsTracker
              onLocationUpdate={handleLocationUpdate}
              isTracking={!selectedTask.completed}
            />
          </section>
        )}

        {/* Karte des aktiven oder gewählten Auftrags */}
        {selectedTask && selectedTask.points.length > 0 && (
          <section className="map-section">
            <TaskMap
              points={selectedTask.points}
              taskName={selectedTask.name}
              currentPosition={currentPosition || undefined}
            />
          </section>
        )}

        {/* Liste aller Aufträge */}
        <section className="task-list-section">
          <TaskList
            tasks={tasks}
            onSelectTask={setSelectedTask}
            onCompleteTask={handleCompleteTask}
            onDeleteTask={handleDeleteTask}
            onAddHectares={handleAddHectares}
            onRemoveHectareEntry={handleRemoveHectareEntry}
            isSending={isSending}
          />
        </section>
      </main>

      <footer className="app-footer">
        <p>💡 Tipp: Aktiviere die hohe Genauigkeit in den Handy-Einstellungen für bessere GPS-Daten</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId="905916287416-gjf24ad0b3mrt8riuhst53cqufs9bspb.apps.googleusercontent.com">
      <AppContent />
    </GoogleOAuthProvider>
  );
}

export default App;
