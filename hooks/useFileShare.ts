import { useStore } from '@/store/useStore';
import { useWebRTC } from './useWebRTC';

export const useFileShare = () => {
  const { addSharedFile, addMessage } = useStore();
  const { sendFileData } = useWebRTC();

  const shareFile = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Add to local store
      const fileData = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        data: arrayBuffer,
      };
      
      addSharedFile(fileData);
      
      // Send via data channel
      sendFileData({
        id: fileData.id,
        name: file.name,
        size: file.size,
        type: file.type,
        data: Array.from(new Uint8Array(arrayBuffer)),
      });

      addMessage({
        id: Date.now().toString(),
        text: `Shared file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
        timestamp: Date.now(),
        from: 'System',
      });
    } catch (error) {
      console.error('Error sharing file:', error);
    }
  };

  const downloadFile = (fileData: { id: string; name: string; data: ArrayBuffer }) => {
    const blob = new Blob([fileData.data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileData.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return { shareFile, downloadFile };
};

