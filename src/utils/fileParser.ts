
/**
 * Scans a chat message for code blocks with path markers and saves them to the local disk via the Vite API.
 */
export async function autoSaveToDisk(content: string, projectName: string): Promise<string[]> {
  const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
  const pathRegex = /^\/\/\s*path:\s*(.+)$/m;
  
  let match;
  const filesSaved: string[] = [];

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const code = match[1];
    const pathMatch = code.match(pathRegex);
    
    if (pathMatch && pathMatch[1]) {
      let filePath = pathMatch[1].trim();
      
      // Ensure the filePath is under the project name
      if (!filePath.startsWith(projectName)) {
         filePath = `${projectName}/${filePath.replace(/^\//, '')}`;
      }

      try {
        const response = await fetch('/api/write-file', {
          method: 'POST',
          body: JSON.stringify({ filePath, content: code }),
          headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();
        if (result.success) {
          filesSaved.push(`✅ Saved: ${filePath}`);
        } else {
          filesSaved.push(`❌ Failed: ${filePath} (${result.error})`);
        }
      } catch {
        filesSaved.push(`❌ Error connecting to file server for ${filePath}`);
      }
    }
  }

  return filesSaved;
}
