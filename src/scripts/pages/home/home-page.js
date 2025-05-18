import {
  generateLoaderAbsoluteTemplate,
  generateStoryItemTemplate,
  generateStoriesListEmptyTemplate,
  generateStoriesListErrorTemplate,
} from '../../templates';
import HomePresenter from './home-presenter';
import * as DicodingStoriesAPI from '../../data/api';

export default class HomePage {
  #presenter = null;
  #map = null; // Tambahkan properti untuk menyimpan instance peta Leaflet
  async render() {
    return `
      <section class="container">
        <h1 class="section-title">Daftar Cerita</h1>
        <div class="stories-list__container">
          <div id="stories-list"></div>
          <div id="stories-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: DicodingStoriesAPI,
    });

    await this.#presenter.initialGalleryAndMap();
  }

  populateStoriesList(message, stories) {
    if (stories.length <= 0) {
      this.populateStoriesListEmpty();
      return;
    }

    const html = stories.map((story) => generateStoryItemTemplate(story)).join('');

    document.getElementById('stories-list').innerHTML = `
      ${html}
    `;

    // Inisialisasi peta setelah daftar cerita dimuat
    this.initialMap(stories);
  }

  populateStoriesListEmpty() {
    document.getElementById('stories-list').innerHTML = generateStoriesListEmptyTemplate();
  }

  populateStoriesListError(message) {
    document.getElementById('stories-list').innerHTML = generateStoriesListErrorTemplate(message);
  }

  async initialMap(stories) {
    if (!stories || stories.length === 0) {
      return; // Jangan inisialisasi peta jika tidak ada cerita
    }
  }


  showLoading() {
    document.getElementById('stories-list-loading-container').innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    document.getElementById('stories-list-loading-container').innerHTML = '';
  }
}