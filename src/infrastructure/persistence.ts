import * as fs from 'fs';
import * as path from 'path';

/**
 * Simple file-based persistence for MVP
 * Saves in-memory data to JSON files
 */

const DATA_DIR = path.join(process.cwd(), '.data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function saveToFile(filename: string, data: any): void {
  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Failed to save ${filename}:`, error);
  }
}

export function loadFromFile<T>(filename: string, defaultValue: T): T {
  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error(`Failed to load ${filename}:`, error);
  }
  return defaultValue;
}
