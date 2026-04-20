import React, { useState } from 'react';
import { Task, formatDate, formatTime, getDuration, getTotalHectares } from '../utils/storage';
import './TaskList.css';

interface TaskListProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onCompleteTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddHectares: (taskId: string, hectares: number) => void;
  onRemoveHectareEntry: (taskId: string, entryId: string) => void;
  isSending?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onSelectTask,
  onCompleteTask,
  onDeleteTask,
  onAddHectares,
  onRemoveHectareEntry,
  isSending = false,
}) => {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [hectareInput, setHectareInput] = useState<{ [key: string]: string }>({});

  const handleAddHectare = (taskId: string) => {
    const value = parseFloat(hectareInput[taskId] || '0');
    if (value > 0) {
      onAddHectares(taskId, value);
      setHectareInput({ ...hectareInput, [taskId]: '' });
    }
  };

  return (
    <div className="task-list">
      <h2>Aufträge</h2>
      {tasks.length === 0 ? (
        <p className="no-tasks">Noch keine Aufträge. Starten Sie einen neuen Auftrag!</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <div className="task-header" onClick={() => onSelectTask(task)}>
                <span className="task-name">{task.name}</span>
                <span className={`task-status ${task.completed ? 'done' : 'active'}`}>
                  {task.completed ? '✓ Abgeschlossen' : '⏱ Aktiv'}
                </span>
              </div>

              <div className="task-details">
                <div>
                  📅 {formatDate(task.startTime)} | ⏱ {formatTime(task.startTime)}
                  {task.endTime && ` - ${formatTime(task.endTime)}`}
                </div>
                {task.endTime && <div>⏱ Dauer: {getDuration(task.startTime, task.endTime)}</div>}
                <div>
                  📊 <strong>Gesamte Hektare: {getTotalHectares(task).toFixed(2)} ha</strong>
                </div>
              </div>

              {/* Hektar Einträge */}
              <div
                className="hectares-section"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="btn-expand"
                  onClick={() =>
                    setExpandedTaskId(expandedTaskId === task.id ? null : task.id)
                  }
                >
                  {expandedTaskId === task.id ? '▼' : '▶'} Hektare ({task.hectareEntries.length})
                </button>

                {expandedTaskId === task.id && (
                  <div className="hectares-detail">
                    {/* Liste der Einträge */}
                    {task.hectareEntries.length > 0 && (
                      <div className="hectares-list">
                        {task.hectareEntries.map((entry) => (
                          <div key={entry.id} className="hectare-entry">
                            <span>
                              {entry.value.toFixed(2)} ha - {new Date(entry.timestamp).toLocaleTimeString('de-DE')}
                            </span>
                            <button
                              className="btn-remove"
                              onClick={() => onRemoveHectareEntry(task.id, entry.id)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Neuer Eintrag hinzufügen */}
                    {!task.completed && (
                      <div className="hectares-input">
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Hektare eingeben"
                          value={hectareInput[task.id] || ''}
                          onChange={(e) =>
                            setHectareInput({ ...hectareInput, [task.id]: e.target.value })
                          }
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleAddHectare(task.id);
                          }}
                        />
                        <button
                          className="btn-add-hectare"
                          onClick={() => handleAddHectare(task.id)}
                        >
                          ➕ Hinzufügen
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="task-actions">
                {!task.completed && (
                  <button
                    className="btn btn-complete"
                    onClick={() => onCompleteTask(task.id)}
                    disabled={isSending}
                  >
                    {isSending ? '⏳ Wird versendet...' : '✓ Beenden & Report'}
                  </button>
                )}
                {task.completed && !task.emailSent && (
                  <button className="btn btn-email">📧 Email ausstehend</button>
                )}
                {task.emailSent && (
                  <button className="btn btn-sent" disabled>
                    ✓ Email gesendet
                  </button>
                )}
                <button className="btn btn-delete" onClick={() => onDeleteTask(task.id)}>
                  🗑 Löschen
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
