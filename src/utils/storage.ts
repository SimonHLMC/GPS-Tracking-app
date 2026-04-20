export interface GpsPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface HectareEntry {
  id: string;
  value: number;
  timestamp: number;
}

export interface Task {
  id: string;
  name: string;
  startTime: number;
  endTime: number | null;
  hectareEntries: HectareEntry[];
  points: GpsPoint[];
  completed: boolean;
  emailSent: boolean;
}

export interface TaskState {
  tasks: Task[];
}

const STORAGE_KEY = 'gps_tracking_tasks';

export const loadTasks = (): Task[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading tasks:', e);
    return [];
  }
};

export const saveTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks:', e);
  }
};

export const createTask = (name: string): Task => {
  return {
    id: Date.now().toString(),
    name,
    startTime: Date.now(),
    endTime: null,
    hectareEntries: [],
    points: [],
    completed: false,
    emailSent: false,
  };
};

export const getTotalHectares = (task: Task): number => {
  return task.hectareEntries.reduce((sum, entry) => sum + entry.value, 0);
};

export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('de-DE');
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('de-DE');
};

export const getDuration = (startTime: number, endTime: number): string => {
  const diff = endTime - startTime;
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
};
