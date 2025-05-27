import { getAllFavorites } from '../../utils/indexeddb.js';
import { generateStoryItemTemplate, generateStoriesListEmptyTemplate } from '../../templates.js';

export default class FavoritesPage {
  constructor() {
    this.favoriteStories = [];
  }

  async render() {
    return `
      <section class="container">
        <h1 class="section-title">
          <i class="fas fa-heart"></i> 
          Cerita Favorit
        </h1>
        <div class="stories-list__container">
          <div id="favorites-list"></div>
          <div id="favorites-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this.loadFavorites();
    this._initializeFavoriteButtons();
  }

  async loadFavorites() {
    try {
      // Show loading
      document.getElementById('favorites-loading-container').innerHTML = 
        '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Memuat favorit...</div>';

      // Get favorite stories from IndexedDB
      this.favoriteStories = await getAllFavorites();
      
      // Hide loading
      document.getElementById('favorites-loading-container').innerHTML = '';
      
      // Populate favorites list
      this.populateFavoritesList();
      
    } catch (error) {
      console.error('Error loading favorites:', error);
      document.getElementById('favorites-loading-container').innerHTML = '';
      this.populateFavoritesError('Gagal memuat cerita favorit');
    }
  }

  populateFavoritesList() {
    if (this.favoriteStories.length <= 0) {
      this.populateFavoritesEmpty();
      return;
    }

    const html = this.favoriteStories.map((story) => 
      generateStoryItemTemplate(story, true) // true indicates it's from favorites page
    ).join('');

    document.getElementById('favorites-list').innerHTML = html;
    
    // Update favorite button status (all should be favorited)
    this._updateFavoriteButtonsStatus();
  }

  populateFavoritesEmpty() {
    document.getElementById('favorites-list').innerHTML = `
      <div class="stories-list__empty">
        <div class="empty-state">
          <i class="fas fa-heart-broken"></i>
          <h3>Belum Ada Cerita Favorit</h3>
          <p>Cerita yang Anda tandai sebagai favorit akan muncul di sini</p>
          <a href="#/" class="btn btn-primary">
            <i class="fas fa-home"></i>
            Kembali ke Beranda
          </a>
        </div>
      </div>
    `;
  }

  populateFavoritesError(message) {
    document.getElementById('favorites-list').innerHTML = `
      <div class="stories-list__error">
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Gagal Memuat Favorit</h3>
          <p>${message}</p>
          <button onclick="location.reload()" class="btn btn-primary">
            <i class="fas fa-redo"></i>
            Coba Lagi
          </button>
        </div>
      </div>
    `;
  }

  _initializeFavoriteButtons() {
    // Event listener untuk tombol favorite (sama seperti di home-page.js)
    document.addEventListener('click', async (event) => {
      if (event.target.matches('.story-item__favorite') || 
          event.target.closest('.story-item__favorite')) {
        
        const button = event.target.matches('.story-item__favorite') 
          ? event.target 
          : event.target.closest('.story-item__favorite');
        
        await this._handleFavoriteClick(button);
      }
    });
  }

  async _handleFavoriteClick(button) {
    try {
      const storyId = button.getAttribute('data-story-id');
      
      // Import functions from indexeddb.js
      const { removeFromFavorites, isStoryFavorited } = await import('../../utils/indexeddb.js');
      
      // Check current favorite status
      const isFavorited = await isStoryFavorited(storyId);
      
      // Show loading state
      const originalContent = button.innerHTML;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      button.disabled = true;

      if (isFavorited) {
        // Remove from favorites
        await removeFromFavorites(storyId);
        
        // Remove story card from display
        const storyCard = button.closest('.story-item');
        if (storyCard) {
          storyCard.remove();
        }
        
        // Update favorites array
        this.favoriteStories = this.favoriteStories.filter(story => story.id !== storyId);
        
        // Show empty state if no more favorites
        if (this.favoriteStories.length === 0) {
          this.populateFavoritesEmpty();
        }
        
        this._showNotification('Cerita dihapus dari favorit', 'info');
      }
      
    } catch (error) {
      console.error('Error handling favorite click:', error);
      button.innerHTML = originalContent;
      button.disabled = false;
      this._showNotification('Gagal mengubah status favorit', 'error');
    }
  }

  _updateFavoriteButtonsStatus() {
    // Set all favorite buttons to favorited state since this is favorites page
    const favoriteButtons = document.querySelectorAll('.story-item__favorite');
    favoriteButtons.forEach(button => {
      button.innerHTML = '<i class="fas fa-heart"></i> Tersimpan';
      button.classList.add('favorited');
    });
  }

  _showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'notification';
      notification.className = 'notification';
      document.body.appendChild(notification);
    }

    // Set notification content and type
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    // Hide notification after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }
}