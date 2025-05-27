import * as DicodingStoriesAPI from '../../data/api.js';
import { parseActivePathname } from '../../routes/url-parser.js';
import StoryDetailPresenter from './story-detail-presenter.js';
import { generateStoryDetailErrorTemplate, generateStoryDetailTemplate, generateLoaderAbsoluteTemplate } from '../../templates.js';
import { addToFavorites, removeFromFavorites, isStoryFavorited } from '../../utils/indexeddb.js';

export default class storydetailpage {
    #presenter = null;
    #map = null; // Tambahkan properti untuk menyimpan instance peta Leaflet
    #currentStory = null; // Simpan data story saat ini

  async render() {
    return `
      <section class="story-detail-page">
        <h1 class="section-title">Story Detail</h1>
        <div id="stories-list-loading-container"></div>
        <div id="story-detail-data"></div>
      </section>
    `;
  }

  async afterRender() {
    const {id} = parseActivePathname();
    this.#presenter = new StoryDetailPresenter({
      view: this,
      model: DicodingStoriesAPI,
    });

    await this.#presenter.initialStoryDetails(id);
  }

  StoryDetail(storyData) {
    console.log("story detail data", storyData);
    this.#currentStory = storyData; // Simpan data story
    
    document.getElementById('story-detail-data').innerHTML = generateStoryDetailTemplate({ ...storyData });
    
    this.initialMap(storyData);
    this._initFavoriteButton(storyData); // Tambahkan button favorite
  }

  StoryDetailError() {
    const html = generateStoryDetailErrorTemplate();
    document.getElementById('stories-list-loading-container').innerHTML = html;
  }

  async initialMap(storyData) {
    if (!storyData || !storyData.lat || !storyData.lon) {
      return; // Jangan inisialisasi peta jika tidak ada cerita
    }

    const lat = storyData.lat;
    const lng = storyData.lon;

    this.#map = L.map('map-detail-story').setView([lat, lng], 13);

    // Tambahkan tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Buat ikon custom
    const customIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.#map);
    try {
        const locationInfo = await this.getLocationName(lat, lng);
        marker.bindPopup(locationInfo).openPopup();
    } catch (error) {
        marker.bindPopup("Lokasi tidak ditemukan").openPopup();
    }
  }

  async getLocationName(lat, lon) {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    const data = await response.json();

    if (data.address) {
        let address = data.address;
        let city = address.city || address.town || address.village || address.hamlet || address.county || address.state || "Lokasi tidak diketahui";
        let country = address.country || "Negara tidak diketahui";
        return `📍 ${city}, ${country}`;
    } else {
        return "Lokasi tidak ditemukan";
    }
  }

  // ======== FAVORITE BUTTON FUNCTIONS ========
  
  async _initFavoriteButton(storyData) {
    // Tambahkan button favorite di bawah peta
    const mapContainer = document.getElementById('map-detail-story');
    if (mapContainer) {
      const favoriteButtonHtml = `
        <div class="favorite-button-container" style="margin-top: 15px; text-align: center;">
          <button 
            id="favorite-btn" 
            class="favorite-btn" 
            data-story-id="${storyData.id}"
            style="
              padding: 10px 20px;
              border: none;
              border-radius: 5px;
              font-size: 14px;
              cursor: pointer;
              transition: all 0.3s ease;
            "
          >
            <i class="fas fa-spinner fa-spin"></i> Memuat...
          </button>
        </div>
      `;
      
      mapContainer.insertAdjacentHTML('afterend', favoriteButtonHtml);
      
      // Update status button
      await this._updateFavoriteButtonStatus(storyData.id);
      
      // Add event listener
      document.getElementById('favorite-btn').addEventListener('click', () => {
        this._handleFavoriteClick(storyData.id);
      });
    }
  }

  async _handleFavoriteClick(storyId) {
    const button = document.getElementById('favorite-btn');
    const originalContent = button.innerHTML;
    
    try {
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
      button.disabled = true;

      const isFavorited = await isStoryFavorited(storyId);
      
      if (isFavorited) {
        await removeFromFavorites(storyId);
        this._showNotification('Dihapus dari favorit');
      } else {
        await addToFavorites(this.#currentStory);
        this._showNotification('Ditambahkan ke favorit');
      }
      
      await this._updateFavoriteButtonStatus(storyId);
      
    } catch (error) {
      console.error('Error handling favorite:', error);
      button.innerHTML = originalContent;
      button.disabled = false;
      alert('Gagal mengubah status favorit');
    }
  }

  async _updateFavoriteButtonStatus(storyId) {
    const button = document.getElementById('favorite-btn');
    if (!button) return;

    try {
      const isFavorited = await isStoryFavorited(storyId);
      button.disabled = false;
      
      if (isFavorited) {
        button.innerHTML = '<i class="fas fa-heart"></i> Tersimpan';
        button.style.backgroundColor = '#e74c3c';
        button.style.color = 'white';
      } else {
        button.innerHTML = '<i class="far fa-heart"></i> Tambah ke Favorit';
        button.style.backgroundColor = '#3498db';
        button.style.color = 'white';
      }
    } catch (error) {
      button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
      button.disabled = true;
    }
  }

  _showNotification(message) {
    // Simple notification - bisa disesuaikan dengan style yang sudah ada
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #27ae60;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 10000;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }

  showLoading() {
    document.getElementById('stories-list-loading-container').innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    document.getElementById('stories-list-loading-container').innerHTML = '';
  }
}