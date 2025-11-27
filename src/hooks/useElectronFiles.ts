import { useState, useEffect, useCallback } from 'react';

interface UseElectronFilesReturn {
  isElectron: boolean;
  workingDir: string | null;
  requirementsContent: string;
  designContent: string;
  tasksContent: string;
  setRequirementsContent: (content: string) => void;
  setDesignContent: (content: string) => void;
  setTasksContent: (content: string) => void;
  saveFile: (filename: string, content: string) => Promise<boolean>;
  isLoading: boolean;
}

export function useElectronFiles(): UseElectronFilesReturn {
  const [isElectron] = useState(() => !!window.electronAPI);
  const [workingDir, setWorkingDir] = useState<string | null>(null);
  const [requirementsContent, setRequirementsContent] = useState('');
  const [designContent, setDesignContent] = useState('');
  const [tasksContent, setTasksContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFiles() {
      if (!window.electronAPI) {
        setIsLoading(false);
        return;
      }

      try {
        const dir = await window.electronAPI.getWorkingDir();
        setWorkingDir(dir);

        const [requirements, design, tasks] = await Promise.all([
          window.electronAPI.readFile('requirements.md'),
          window.electronAPI.readFile('design.md'),
          window.electronAPI.readFile('tasks.md'),
        ]);

        if (requirements) setRequirementsContent(requirements);
        if (design) setDesignContent(design);
        if (tasks) setTasksContent(tasks);
      } catch (error) {
        console.error('Error loading files:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadFiles();
  }, []);

  const saveFile = useCallback(async (filename: string, content: string): Promise<boolean> => {
    if (!window.electronAPI) return false;
    return window.electronAPI.writeFile(filename, content);
  }, []);

  return {
    isElectron,
    workingDir,
    requirementsContent,
    designContent,
    tasksContent,
    setRequirementsContent,
    setDesignContent,
    setTasksContent,
    saveFile,
    isLoading,
  };
}
