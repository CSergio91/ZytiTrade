/**
 * ZYTI Trade - Single-Fetch & IndexedDB Offline Cache Manager
 * Implementa persistencia local-first para erradicar el consumo de egress
 */

const DB_NAME = 'zyti_trade_db';
const DB_VERSION = 1;
const STORE_NAME = 'bootstrap_cache';

export async function openCacheDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveBootstrapSnapshot(data: any): Promise<void> {
  try {
    const db = await openCacheDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({
      data,
      timestamp: Date.now()
    }, 'current_session');
  } catch (err) {
    console.warn('Failed to cache session locally:', err);
  }
}

export async function loadBootstrapSnapshot(): Promise<any | null> {
  try {
    const db = await openCacheDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get('current_session');
      req.onsuccess = () => resolve(req.result?.data || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}
