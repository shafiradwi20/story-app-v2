import { set, get, addStoryToQueue } from '../../utils/indexeddb.js';

export default class NewPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showNewFormMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      // console.error('showNewFormMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async postNewStory(storyData) {
    this.#view.showSubmitLoadingButton();
    try {
      // If offline, save story to IndexedDB queue and return offline result
        if (!navigator.onLine) {
          console.log('Offline detected, saving story to IndexedDB queue...');
          // Extract serializable data from FormData
          const storyObj = {
            description: storyData.get('description'),
            lat: storyData.get('lat'),
            lon: storyData.get('lon'),
            photo: null,
          };

          const photoFile = storyData.get('photo');
          if (photoFile) {
            console.log('Converting photo to base64 for offline storage...');
            // Convert photo Blob/File to base64 string for storage
            storyObj.photo = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(photoFile);
            });
          }

          console.log('Adding story to IndexedDB queue:', storyObj);
          await addStoryToQueue(storyObj);
          this.#view.storeSuccessfully('Story saved locally and will sync when online.');
          return { ok: true, offline: true };
        }

      // Online: proceed with normal fetch
      const response = await this.#view.storeNewStory(storyData);
      console.log("postNewStory response:", response);
      if (!response) {
        this.#view.storeFailed('No response from storeNewStory.');
        return { ok: false, message: 'No response from storeNewStory.' };
      }
      if (response.error || response.ok === false) {
        // If offline error detected, save story to queue
        if (response.offline) {
          // Extract serializable data from FormData
          const storyObj = {
            description: storyData.get('description'),
            lat: storyData.get('lat'),
            lon: storyData.get('lon'),
            photo: null,
          };

          const photoFile = storyData.get('photo');
          if (photoFile) {
            // Convert photo Blob/File to base64 string for storage
            storyObj.photo = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(photoFile);
            });
          }

          await addStoryToQueue(storyObj);
          this.#view.storeSuccessfully('Story saved locally and will sync when online.');
          return { ok: true, offline: true };
        }
        this.#view.storeFailed(response.message || 'Unknown error occurred.');
        return { ok: false, message: response.message || 'Unknown error occurred.' };
      }

      // Append new story to IndexedDB without deleting existing data
      const existingStories = (await get('stories')) || [];

      // Extract serializable data from FormData
      const storyObj = {
        description: storyData.get('description'),
        lat: storyData.get('lat'),
        lon: storyData.get('lon'),
        photo: null,
      };

      const photoFile = storyData.get('photo');
      if (photoFile) {
        // Convert photo Blob/File to base64 string for storage
        storyObj.photo = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(photoFile);
        });
      }

      existingStories.push(storyObj);
      await set('stories', existingStories);

      // this.#notifyToAllUser(response.id);
      this.#view.storeSuccessfully(response.message || 'Story created successfully.');
      return { ok: true };
    } catch (error) {
      console.error('ERROR in postNewStory:', error);

      // If fetch failed due to network, save story offline
      if (!navigator.onLine) {
        // Extract serializable data from FormData
        const storyObj = {
          description: storyData.get('description'),
          lat: storyData.get('lat'),
          lon: storyData.get('lon'),
          photo: null,
        };

        const photoFile = storyData.get('photo');
        if (photoFile) {
          // Convert photo Blob/File to base64 string for storage
          storyObj.photo = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(photoFile);
          });
        }

        await addStoryToQueue(storyObj);
        this.#view.storeSuccessfully('Story saved locally and will sync when online.');
        return { ok: true, offline: true };
      }

      this.#view.storeFailed(`Failed to create story: ${error.message}`);
      return { ok: false, message: `Failed to create story: ${error.message}` };
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
