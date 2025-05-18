export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async initialGalleryAndMap() {
    this.#view.showLoading();
    try {
      const response = await this.#model.getAllStories(); // Panggil getAllStories

      if (!response.ok) {
        console.error('initialGalleryAndMap: response:', response);
        this.#view.populateStoriesListError(response.message); // Panggil populateStoriesListError
        return;
      }

      // Pastikan data lokasi tersedia
      const stories = response.listStory; // Sesuaikan dengan struktur respons API

      if (!stories || stories.length === 0) {
        this.#view.populateStoriesListError('No stories available.'); // Pesan jika tidak ada cerita
        return;
      }
      this.#view.populateStoriesList(response.message, stories); // Panggil populateStoriesList
    } catch (error) {
      console.error('initialGalleryAndMap: error:', error);
      this.#view.populateStoriesListError('Failed to fetch stories.'); // Pesan error umum
    } finally {
      this.#view.hideLoading();
    }
  }
}