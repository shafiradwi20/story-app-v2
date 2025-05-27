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
    <li><a id="favorites-button" class="favorites-button" href="#/favorites">
      <i class="fas fa-heart"></i> Favorit
    </a></li>
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
}, isFromFavorites = false) {
  return `
    <div tabindex="0" class="story-item ${isFromFavorites ? 'favorite-story-item' : ''}" data-storyid="${id}">
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
        <div class="story-item__actions">
          <a class="btn story-item__read-more" href="#/stories/${id}">
            Selengkapnya <i class="fas fa-arrow-right"></i>
          </a>
          <button class="story-item__favorite" data-story-id="${id}">
            <i class="far fa-heart"></i> Simpan ke Favorit
          </button>
        </div>
      </div>
    </div>
  `;
}

// Template khusus untuk favorites page
export function generateFavoriteStoryItemTemplate({
  id,
  name,
  description,
  photoUrl,
  createdAt,
  lat,
  lon,
}) {
  return `
    <div tabindex="0" class="story-item favorite-story-item" data-storyid="${id}">
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
        <div class="story-item__actions">
          <a class="btn story-item__read-more" href="#/stories/${id}">
            Selengkapnya <i class="fas fa-arrow-right"></i>
          </a>
          <button class="btn btn-danger story-item__remove-favorite" data-story-id="${id}">
            <i class="fas fa-trash"></i> Hapus dari Favorit
          </button>
        </div>
      </div>
    </div>
  `;
}

export function generateFavoritesEmptyTemplate() {
  return `
    <div id="favorites-list-empty" class="stories-list__empty">
      <div class="empty-state">
        <i class="fas fa-heart-broken"></i>
        <h2>Belum Ada Cerita Favorit</h2>
        <p>Anda belum menyimpan cerita apapun sebagai favorit.</p>
        <a href="#/" class="btn btn-primary">
          <i class="fas fa-home"></i>
          Kembali ke Beranda
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
  id,
}) {
  const createdAtFormatted = showFormattedDate(createdAt, 'id-ID');
  return `
    <div class="story-detail-wrapper" style="padding: 20px; display: flex; justify-content: center;">
      <div class="story-detail-container" style="max-width: 800px; width: 100%; display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Header Info -->
        <div class="story-detail__info" style="font-size: 14px;">
          <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">${description}</h1>
          <div><i class="fas fa-calendar-alt"></i> ${createdAtFormatted}</div>
          <div><i class="fas fa-map-marker-alt"></i> ${Number(lat).toFixed(6)}, ${Number(lon).toFixed(6)}</div>
          <div><i class="fas fa-user"></i> ${name}</div>
        </div>

        <!-- Gambar -->
        <div class="story-detail__image" style="text-align: center;">
          ${generateStoryDetailImageTemplate(photoUrl, description)}
        </div>

        <!-- Peta -->
        ${lat && lon ? `
          <div class="story-detail__map-section">
            <h2 style="font-size: 18px; margin-bottom: 10px;">
              <i class="fas fa-map-marker-alt"></i> Lokasi Cerita
            </h2>
            <div id="map-detail-story" style="width: 100%; height: 300px;"></div>
          </div>
        ` : ''}

        <!-- Tombol Aksi -->
        <div class="story-detail__actions" style="display: flex; justify-content: center; gap: 12px;">
          <a href="#/" style="padding: 10px 16px; background-color: #e83e8c; color: white; border-radius: 6px; text-decoration: none;">
            <i class="fas fa-arrow-left"></i> Kembali ke Beranda
          </a>
          <a href="#/favorites" style="padding: 10px 16px; background-color: #d63384; color: white; border-radius: 6px; text-decoration: none;">
            <i class="fas fa-heart"></i> Lihat Favorit
          </a>
          <button class="btn-favorite" style="padding: 10px 16px; background-color: #dc3545; color: white; border: none; border-radius: 6px;">
            <i class="fas fa-heart"></i> Tersimpan
          </button>
        </div>

      </div>
    </div>
  `;
}


export function generateSubscribeButtonTemplate() {
  return `
    <button id="subscribe-button" class="btn subscribe-button">
      <i class="fas fa-bell"></i> Aktifkan Notifikasi
    </button>
  `;
}

export function generateUnsubscribeButtonTemplate() {
  return `
    <button id="unsubscribe-button" class="btn unsubscribe-button">
      <i class="fas fa-bell-slash"></i> Nonaktifkan Notifikasi
    </button>
  `;
}

// Template untuk notifikasi
export function generateNotificationTemplate(message, type = 'info') {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle',
    warning: 'fas fa-exclamation-triangle'
  };

  return `
    <div class="notification notification-${type}">
      <i class="${icons[type]}"></i>
      <span>${message}</span>
    </div>
  `;
}