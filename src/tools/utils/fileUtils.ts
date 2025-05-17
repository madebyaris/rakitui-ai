import * as fs from 'fs';
import * as path from 'path';
import open from 'open';

/**
 * Creates a temporary directory if it doesn't exist
 * @returns The path to the temporary directory
 */
export function ensureTempDir(): string {
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  return tempDir;
}

/**
 * Writes content to a file and opens it in the browser
 * @param filename The name of the file
 * @param content The content to write
 * @returns The path to the created file
 */
export async function writeAndOpenFile(filename: string, content: string): Promise<string> {
  const tempDir = ensureTempDir();
  const filePath = path.join(tempDir, filename);
  
  fs.writeFileSync(filePath, content);
  await open(filePath);
  
  return filePath;
} 