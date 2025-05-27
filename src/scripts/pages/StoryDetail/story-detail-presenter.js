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
        const response = await this.#model.getStoryById(id);
        
        if (!response.ok) {
          console.error('initialStoryDetails: response:', response);
          this.#view.StoryDetailError(response.message);
          return;
        }
        
        // Hide loading and show story detail
        this.#view.StoryDetail(response.story);
        
      } catch (error) {
        console.error('initialStoryDetails: error:', error);
        this.#view.StoryDetailError('Failed to fetch stories.');
      } finally {
        this.#view.hideLoading();
      }
    }
}