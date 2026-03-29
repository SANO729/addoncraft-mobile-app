import JSZip from 'jszip';
import { GeneratedAddon } from './geminiService';

export async function createMcPack(addon: GeneratedAddon): Promise<Blob> {
  const zip = new JSZip();

  addon.files.forEach(file => {
    zip.file(file.path, file.content);
  });

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
