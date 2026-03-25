import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// Use absolute path for Windows compatibility
const BASE_DIR = 'D:/projects';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 1. Scaffold Route
app.post('/api/scaffold', (req, res) => {
  const { projectName } = req.body;
  if (!projectName) return res.status(400).json({ error: 'Project name required' });

  const projectRoot = path.join(BASE_DIR, projectName);
  
  try {
    ensureDir(projectRoot);
    const folders = [
      'tests/pages/',
      'tests/e2e/',
      'tests/fixtures/',
      'tests/utils/',
      'tests/test-data/',
      'tests/api/',
      'tests/load-testing/'
    ];

    folders.forEach(f => {
      ensureDir(path.join(projectRoot, f));
    });
    
    const testCasesPath = path.join(projectRoot, 'tests/test-data/testcases.json');
    if (!fs.existsSync(testCasesPath)) {
      fs.writeFileSync(testCasesPath, JSON.stringify([], null, 2));
    }

    res.json({ success: true, message: `Scaffolded ${projectName} structure.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Write File
app.post('/api/write-file', (req, res) => {
  const { filePath, content } = req.body;
  let targetPath = filePath;
  
  if (!path.isAbsolute(filePath)) {
    targetPath = path.join(BASE_DIR, filePath);
  }

  try {
    ensureDir(path.dirname(targetPath));
    fs.writeFileSync(targetPath, content, 'utf8');
    res.json({ success: true, path: targetPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Read File
app.post('/api/read-file', (req, res) => {
  const { filePath } = req.body;
  let targetPath = filePath;
  
  if (!path.isAbsolute(filePath)) {
    targetPath = path.join(BASE_DIR, filePath);
  }

  try {
    if (fs.existsSync(targetPath)) {
      const content = fs.readFileSync(targetPath, 'utf8');
      res.json({ success: true, content });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects', (req, res) => {
  try {
    ensureDir(BASE_DIR);
    const dirs = fs.readdirSync(BASE_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    res.json({ success: true, projects: dirs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 QA Co-Pilot Backend running on port ${PORT}`);
  console.log(`📁 Base Projects Path: ${BASE_DIR}`);
});
