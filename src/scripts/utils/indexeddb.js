import { openDB } from 'idb';

const DB_NAME = 'my-database';
const DB_VERSION = 3; // Increment version untuk schema baru
const STORE_NAME = 'keyval';
const STORY_QUEUE_STORE = 'story-queue';
const FAVORITES_STORE = 'favorites'; // Store baru untuk favorites

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains(STORY_QUEUE_STORE)) {
          db.createObjectStore(STORY_QUEUE_STORE, { autoIncrement: true });
        }
      }
      // Tambahkan favorites store jika belum ada
      if (oldVersion < 3) {
        if (!db.objectStoreNames.contains(FAVORITES_STORE)) {
          db.createObjectStore(FAVORITES_STORE, { keyPath: 'id' });
        }
      }
    },
  });
}

export async function get(key) {
  try {
    const db = await getDB();
    const result = await db.get(STORE_NAME, key);
    console.log(`Get data untuk key '${key}':`, result);
    return result;
  } catch (error) {
    console.error(`Error getting data untuk key '${key}':`, error);
    throw error;
  }
}

export async function set(key, val) {
  try {
    const db = await getDB();
    const result = await db.put(STORE_NAME, val, key);
    console.log(`Data berhasil disimpan untuk key '${key}':`, val);
    return result;
  } catch (error) {
    console.error(`Error saving data untuk key '${key}':`, error);
    throw error;
  }
}

export async function del(key) {
  try {
    const db = await getDB();
    const result = await db.delete(STORE_NAME, key);
    console.log(`Data berhasil dihapus untuk key '${key}'`);
    
    // Verifikasi bahwa data benar-benar terhapus
    const checkData = await db.get(STORE_NAME, key);
    if (checkData !== undefined) {
      console.error(`Data masih ada setelah dihapus untuk key '${key}'`);
      throw new Error(`Gagal menghapus data untuk key '${key}'`);
    }
    
    return result;
  } catch (error) {
    console.error(`Error deleting data untuk key '${key}':`, error);
    throw error;
  }
}

export async function clear() {
  try {
    const db = await getDB();
    const result = await db.clear(STORE_NAME);
    console.log('Semua data berhasil dihapus dari store');
    return result;
  } catch (error) {
    console.error('Error clearing store:', error);
    throw error;
  }
}

export async function keys() {
  try {
    const db = await getDB();
    const result = await db.getAllKeys(STORE_NAME);
    console.log('Keys yang ada:', result);
    return result;
  } catch (error) {
    console.error('Error getting keys:', error);
    throw error;
  }
}

// Functions for story queue
export async function addStoryToQueue(story) {
  try {
    const db = await getDB();
    const result = await db.add(STORY_QUEUE_STORE, story);
    console.log('Story berhasil ditambahkan ke queue:', story);
    return result;
  } catch (error) {
    console.error('Error adding story to queue:', error);
    throw error;
  }
}

export async function getAllQueuedStories() {
  try {
    const db = await getDB();
    const result = await db.getAll(STORY_QUEUE_STORE);
    console.log('Queued stories:', result);
    return result;
  } catch (error) {
    console.error('Error getting queued stories:', error);
    throw error;
  }
}

export async function clearQueuedStories() {
  try {
    const db = await getDB();
    const result = await db.clear(STORY_QUEUE_STORE);
    console.log('Queue stories berhasil dihapus');
    return result;
  } catch (error) {
    console.error('Error clearing queued stories:', error);
    throw error;
  }
}

// ========== FAVORITES FUNCTIONS ==========

// Tambah story ke favorites
export async function addToFavorites(story) {
  try {
    const db = await getDB();
    const storyWithTimestamp = {
      ...story,
      savedAt: new Date().toISOString()
    };
    const result = await db.put(FAVORITES_STORE, storyWithTimestamp);
    console.log('Story berhasil ditambahkan ke favorites:', story);
    return result;
  } catch (error) {
    console.error('Error adding story to favorites:', error);
    throw error;
  }
}

// Hapus story dari favorites
export async function removeFromFavorites(storyId) {
  try {
    const db = await getDB();
    const result = await db.delete(FAVORITES_STORE, storyId);
    console.log(`Story dengan ID ${storyId} berhasil dihapus dari favorites`);
    return result;
  } catch (error) {
    console.error('Error removing story from favorites:', error);
    throw error;
  }
}

// Ambil semua favorite stories
export async function getAllFavorites() {
  try {
    const db = await getDB();
    const result = await db.getAll(FAVORITES_STORE);
    console.log('Favorite stories:', result);
    return result;
  } catch (error) {
    console.error('Error getting favorite stories:', error);
    throw error;
  }
}

// Cek apakah story sudah ada di favorites
export async function isStoryFavorited(storyId) {
  try {
    const db = await getDB();
    const result = await db.get(FAVORITES_STORE, storyId);
    return result !== undefined;
  } catch (error) {
    console.error('Error checking if story is favorited:', error);
    return false;
  }
}

// Clear semua favorites
export async function clearAllFavorites() {
  try {
    const db = await getDB();
    const result = await db.clear(FAVORITES_STORE);
    console.log('Semua favorite stories berhasil dihapus');
    return result;
  } catch (error) {
    console.error('Error clearing favorites:', error);
    throw error;
  }
}

// Function untuk debugging - melihat semua data
export async function getAllData() {
  try {
    const db = await getDB();
    const keys = await db.getAllKeys(STORE_NAME);
    const data = {};
    
    for (const key of keys) {
      data[key] = await db.get(STORE_NAME, key);
    }
    
    console.log('Semua data di IndexedDB:', data);
    return data;
  } catch (error) {
    console.error('Error getting all data:', error);
    throw error;
  }
}

// Helper function to delete the entire database (use with caution)
export async function deleteDatabase() {
  try {
    const result = await indexedDB.deleteDatabase(DB_NAME);
    console.log('Database berhasil dihapus');
    return result;
  } catch (error) {
    console.error('Error deleting database:', error);
    throw error;
  }
}