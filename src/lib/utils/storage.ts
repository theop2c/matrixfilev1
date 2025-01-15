export function calculateTotalDiskUsage(files: Array<{ taille: number }>): number {
    return files.reduce((total, file) => total + (file.taille || 0), 0);
  }
  