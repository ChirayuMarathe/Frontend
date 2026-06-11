// Local file storage using IndexedDB for storing file contents
// This is an alternative to Supabase Storage

const DB_NAME = 'DabbyFileStorage';
const DB_VERSION = 1;
const STORE_NAME = 'files';

// Open IndexedDB connection
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'path' });
      }
    };
  });
};

// Save file content to IndexedDB
export const saveFileLocally = async (path, content, metadata = {}) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const fileData = {
      path,
      content,
      metadata,
      savedAt: new Date().toISOString()
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(fileData);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error saving file locally:', error);
    return false;
  }
};

// Get file content from IndexedDB
export const getFileLocally = async (path) => {
  try {
    console.log('[LocalStorage] Opening DB to get file:', path);
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get(path);
      request.onsuccess = () => {
        const result = request.result;
        console.log('[LocalStorage] Get result for', path, ':', result ? 'FOUND' : 'NOT FOUND');
        if (result) {
          console.log('[LocalStorage] File details:', {
            hasContent: !!result.content,
            contentLength: result.content ? result.content.length : 0,
            savedAt: result.savedAt,
            metadata: result.metadata
          });
        }
        resolve(result);
      };
      request.onerror = () => {
        console.error('[LocalStorage] Error getting file:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[LocalStorage] Exception in getFileLocally:', error);
    return null;
  }
};

// Delete file from IndexedDB
export const deleteFileLocally = async (path) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(path);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error deleting file locally:', error);
    return false;
  }
};

// Check if file exists locally
export const fileExistsLocally = async (path) => {
  const file = await getFileLocally(path);
  return file !== null && file !== undefined;
};

// List all files in IndexedDB (for debugging)
export const listAllFilesLocally = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.getAllKeys();
      request.onsuccess = () => {
        console.log('[LocalStorage] All stored file paths:', request.result);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error listing files locally:', error);
    return [];
  }
};
