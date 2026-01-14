// Local storage helpers with type safety

const PREFIX = 'duoplay_';

export function setItem<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(PREFIX + key, serialized);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(PREFIX + key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
}

export function removeItem(key: string): void {
  localStorage.removeItem(PREFIX + key);
}

export function clearAll(): void {
  const keys = Object.keys(localStorage).filter((key) => key.startsWith(PREFIX));
  keys.forEach((key) => localStorage.removeItem(key));
}

// Session storage helpers
export function setSessionItem<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    sessionStorage.setItem(PREFIX + key, serialized);
  } catch (error) {
    console.error('Error saving to sessionStorage:', error);
  }
}

export function getSessionItem<T>(key: string, defaultValue: T): T {
  try {
    const item = sessionStorage.getItem(PREFIX + key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error('Error reading from sessionStorage:', error);
    return defaultValue;
  }
}
