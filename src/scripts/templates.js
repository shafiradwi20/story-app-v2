import { showFormattedDate } from './utils';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';  
import { isNotificationAvailable, isNotificationGranted } from './utils/notification-helper.js';
export function generateLoaderTemplate() {
  return `
    <div class="loader"></div>
  `;
}

export function generateLoaderAbsoluteTemplate() {
  return `
    <div class="loader loader-absolute"></div>
  `;
}

export function generateMainNavigationListTemplate() {
  return `
    <li><a id="story-list-button" class="story-list-button" href="#/">Daftar Cerita</a></li>
  `;
}

export function generateUnauthenticatedNavigationListTemplate() {
  return `
    <li><a id="login-button" href="#/login">Login</a></li>
    <li><a id="register-button" href="#/register">Register</a></li>
  `;
}

export function generateAuthenticatedNavigationListTemplate() {
  return `
    <li id="push-notification-tools"></li>
    <li><a id="new-story-button" class="btn new-story-button" href="#/new">Buat Cerita <i class="fas fa-plus"></i></a></li>
    <li><a id="logout-button" class="logout-button" href="#/logout"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
  `;
}

export function generateStoriesListEmptyTemplate() {
  return `
    <div id="stories-list-empty" class="stories-list__empty">
      <h2>Tidak ada cerita yang tersedia</h2>
      <p>Saat ini, tidak ada cerita yang dapat ditampilkan.</p>
    </div>
  `;
}

export function generateStoriesListErrorTemplate(message) {
  return `
    <div id="stories-list-error" class="stories-list__error">
      <h2>Terjadi kesalahan pengambilan daftar cerita</h2>
      <p>${message ? message : 'Gunakan jaringan lain atau laporkan error ini.'}</p>
    </div>
  `;
}

export function generateStoryDetailErrorTemplate(message) {
  return `
    <div id="stories-detail-error" class="stories-detail__error">
      <h2>Terjadi kesalahan pengambilan detail cerita</h2>
      <p>${message ? message : 'Gunakan jaringan lain atau laporkan error ini.'}</p>
    </div>
  `;
}

export function generateStoryItemTemplate({
  id,
  name,
  description,
  photoUrl,
  createdAt,
  lat,
  lon,
}) {
  return `
    <div tabindex="0" class="story-item" data-storyid="${id}">
      <img class="story-item__image" src="${photoUrl}" alt="${description}">
      <div class="story-item__body">
        <div class="story-item__main">
          <h2 id="story-title" class="story-item__title">${description}</h2>
          <div class="story-item__more-info">
            <div class="story-item__createdat">
              <i class="fas fa-calendar-alt"></i> ${showFormattedDate(createdAt, 'id-ID')}
            </div>
            <div class="story-item__location">
              <i class="fas fa-map"></i> ${lat}, ${lon}
            </div>
          </div>
        </div>
        <div id="story-description" class="story-item__description">
          ${name}
        </div>
        <a class="btn story-item__read-more" href="#/stories/${id}">
          Selengkapnya <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </div>
  `;
}

export function generateStoryDetailImageTemplate(imageUrl = "", alt = '') {
  if (!imageUrl) {
    return `
      <img class="story-detail__image" src="images/placeholder-image.jpg" alt="Placeholder Image">
    `;
  }

  return `
    <img class="story-detail__image" src="${imageUrl}" alt="${alt}">
  `;
}

export function generateStoryDetailTemplate({
  name,
  description,
  photoUrl,
  lat,
  lon,
  createdAt,
}) {
  const createdAtFormatted = showFormattedDate(createdAt, 'id-ID');
  return `
    <div class="story-detail-wrapper">
    <div class="story-detail-container">
    <div class="story-detail__header">
      <h1 id="title" class="story-detail__title">${description}</h1>
      <div class="story-detail__more-info">
        <div class="story-detail__more-info__inline">
          <div id="createdat" class="story-detail__createdat" data-value="${createdAt}">Dibuat pada: ${createdAtFormatted}</div>
        </div>
        <div class="story-detail__more-info__inline">
          <div id="location-latitude" class="story-detail__location__latitude" data-value="${lat}">Latitude: ${Number(lat).toFixed(6)}</div>
          <div id="location-longitude" class="story-detail__location__longitude" data-value="${lon}">Longitude: ${Number(lon).toFixed(6)}</div>
        </div>
        <div id="author" class="story-detail__author" data-value="${name}">Dibuat oleh: ${name}</div>
      </div>
    </div>

      <div class="story-detail__images__container">
        <div id="images" class="story-detail__images">
          ${generateStoryDetailImageTemplate(photoUrl, description)}
        </div>
      </div>
  </div>
      <div class="story-detail__body">
        <div class="story-detail__body__map__container">
          <h2 class="story-detail__map__title">Peta Lokasi</h2>
          <div class="story-detail__map__container">
            <div id="map-detail-story" class="story-detail__map">
            </div>
            <div id="map-loading-container"></div>
          </div>
      </div>
    </div>
    </div>
  `;
}

export function generateSubscribeButtonTemplate  () {
  return `
    <button id="subscribe-button" class="btn subscribe-button">
      <i class="fas fa-bell"></i> Aktifkan Notifikasi
    </button>
  ` 
}

export function generateUnsubscribeButtonTemplate  () {
  return `
    <button id="unsubscribe-button" class="btn unsubscribe-button">
      <i class="fas fa-bell-slash"></i> Nonaktifkan Notifikasi
    </button>
  ` 
}