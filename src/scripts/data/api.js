import { getAccessToken } from '../utils/auth';

const BASE_URL = 'https://story-api.dicoding.dev/v1';

const ENDPOINTS = {
  // Auth
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,
  SUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  // Stories
  STORIES: `${BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${BASE_URL}/stories/${id}`,
};
export async function subscribePushNotification({ endpoint, keys: { p256dh, auth } }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({
    endpoint,
    keys: { p256dh, auth },
  });
 
  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();
 
  return {
    ...json,
    ok: fetchResponse.ok,
  };
}
 
export async function unsubscribePushNotification({ endpoint }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({ endpoint });
 
  const fetchResponse = await fetch(ENDPOINTS.UNSUBSCRIBE, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();
  
  return {
    ...json,
    ok: fetchResponse.ok,
  };
}
export async function getRegistered({ name, email, password }) {
  const data = JSON.stringify({ name, email, password });

  try {
    const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data,
    });
    const json = await fetchResponse.json();

    return {
      ...json,
      ok: fetchResponse.ok,
    };
  } catch (error) {
    console.error('getRegistered: error:', error);
    return {
      ok: false,
      message: 'Failed to register. Please try again.',
    };
  }
}

export async function getLogin({ email, password }) {
  const data = JSON.stringify({ email, password });

  try {
    const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data,
    });
    const json = await fetchResponse.json();

    return {
      ...json,
      ok: fetchResponse.ok,
    };
  } catch (error) {
    console.error('getLogin: error:', error);
    return {
      ok: false,
      message: 'Failed to login. Please try again.',
    };
  }
}

export async function getAllStories() {
  const accessToken = getAccessToken();

  try {
    const fetchResponse = await fetch(ENDPOINTS.STORIES, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = await fetchResponse.json();

    return {
      ...json,
      ok: fetchResponse.ok,
      listStory: json.listStory,
    };
  } catch (error) {
    console.error('getAllStories: error:', error);
    return {
      ok: false,
      message: 'Failed to fetch stories. Please try again.',
    };
  }
}

export async function getStoryById(id) {
  const accessToken = getAccessToken();
  console.log("API", id)
  try {
    const fetchResponse = await fetch(ENDPOINTS.STORY_DETAIL(id), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!fetchResponse.ok) {
      const errorJson = await fetchResponse.json();
      console.error('getStoryById: API error:', errorJson);
      return {
        ok: false,
        message: errorJson.message || 'Failed to fetch story. Server error.',
      };
    }
    const json = await fetchResponse.json();

    return {
      ...json,
      ok: true,
      story: json.story,
    };
  } catch (error) {
    console.error('getStoryById: fetch error:', error);
    return {
      ok: false,
      message: 'Failed to fetch story. Network error.',
    };
  }
}

import { addStoryToQueue } from '../utils/indexeddb';

export async function AddNewStory(storyData) {
  const accessToken = getAccessToken();

  if (!navigator.onLine) {
    // Offline: save story to queue in IndexedDB
    try {
      await addStoryToQueue(storyData);
      return {
        ok: true,
        offline: true,
        message: 'Story saved locally and will be synced when online.',
      };
    } catch (error) {
      console.error('AddNewStory: failed to save story offline:', error);
      return {
        ok: false,
        message: 'Failed to save story offline.',
      };
    }
  }

  try {
    const fetchResponse = await fetch(ENDPOINTS.STORIES, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: storyData,
    });
    // Periksa status respons HTTP
    const json = await fetchResponse.json();
    if (json.error) {
      // Tangani respons error dari API
      throw new Error(json.message || 'Failed to add new story. Server error.');
    }
    return {
      ...json,
      ok: true,
    };
  } catch (error) {
    console.error('AddNewStory: fetch error:', error);
    return {
      ok: false,
      message: error.message,
    };
  }
}
