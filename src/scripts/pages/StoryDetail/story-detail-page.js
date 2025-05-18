import * as DicodingStoriesAPI from '../../data/api.js';
import { parseActivePathname } from '../../routes/url-parser.js';
import StoryDetailPresenter from './story-detail-presenter.js';
import { generateStoryDetailErrorTemplate, generateStoryDetailTemplate, generateLoaderAbsoluteTemplate } from '../../templates.js';
export default class storydetailpage {
    #presenter = null;
    #map = null; // Tambahkan properti untuk menyimpan instance peta Leaflet

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
    console.log("story detail data",storyData)
    document.getElementById('story-detail-data').innerHTML = generateStoryDetailTemplate({...storyData});
    this.initialMap(storyData);
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

  async  getLocationName(lat, lon) {
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


  showLoading() {
    document.getElementById('stories-list-loading-container').innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    document.getElementById('stories-list-loading-container').innerHTML = '';
  }
}