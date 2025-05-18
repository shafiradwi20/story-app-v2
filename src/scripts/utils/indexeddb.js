import { openDB } from 'idb';

const DB_NAME = 'my-database';
const DB_VERSION = 2;
const STORE_NAME = 'keyval';
const STORY_QUEUE_STORE = 'story-queue';

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
    },
  });
}

export async function get(key) {
  const db = await getDB();
  return db.get(STORE_NAME, key);
}

export async function set(key, val) {
  const db = await getDB();
  return db.put(STORE_NAME, val, key);
}

export async function del(key) {
  const db = await getDB();
  return db.delete(STORE_NAME, key);
}

export async function clear() {
  const db = await getDB();
  return db.clear(STORE_NAME);
}

export async function keys() {
  const db = await getDB();
  return db.getAllKeys(STORE_NAME);
}

// New functions for story queue

export async function addStoryToQueue(story) {
  const db = await getDB();
  return db.add(STORY_QUEUE_STORE, story);
}

export async function getAllQueuedStories() {
  const db = await getDB();
  return db.getAll(STORY_QUEUE_STORE);
}

export async function clearQueuedStories() {
  const db = await getDB();
  return db.clear(STORY_QUEUE_STORE);
}

// Helper function to delete the entire database (use with caution)
export async function deleteDatabase() {
  return indexedDB.deleteDatabase('my-database');
}
