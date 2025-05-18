
import { get } from '../../utils/indexeddb.js';

export default class StoryDetailPresenter {
    #view;
    #model;
  
    constructor({ view, model }) {
      this.#view = view;
      this.#model = model;
    }
  
    async initialStoryDetails(id) {
      this.#view.showLoading();
      try {
        // Try to get story from IndexedDB first
        const localStories = await get('stories') || [];
        const localStory = localStories.find(story => story.id === id);
        if (localStory) {
          console.log('Story found in IndexedDB:', localStory);
          this.#view.StoryDetail(localStory);
          return;
        }
        
        // Fallback to API fetch
        const response = await this.#model.getStoryById(id); // Panggil getStoryById
        
        if (!response.ok) {
          console.error('initialStoryDetails: response:', response);
          this.#view.StoryDetailError(response.message); // Panggil StoryDetailError
          return;
        }
        
        document.getElementById("stories-list-loading-container").style.display = "none"; // Sembunyikan loading
        this.#view.StoryDetail(response.story); // Panggil StoryDetail
      } catch (error) {
        console.error('initialStoryDetails: error:', error);
        this.#view.StoryDetailError('Failed to fetch stories.'); // Pesan error umum
      } finally {
        this.#view.hideLoading();
      }
    }

  }
