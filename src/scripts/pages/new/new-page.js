import NewPresenter from './new-presenter';
import { convertBase64ToBlob } from '../../utils';
import * as DicodingStoriesAPI from '../../data/api';
import { generateLoaderAbsoluteTemplate } from '../../templates';
import Camera from '../../utils/camera';
import { AddNewStory } from '../../data/api';
export default class NewPage {
  #presenter;
  #form;
  #camera;
  #isCameraOpen = false;
  #takenDocumentations = [];

  async render() {
    let latitude = -6.175389; // Default: Monas
    let longitude = 106.827139;

    return `
      <section>
        <div class="new-story__header">
          <div class="container">
            <h1 class="new-story__header__title">Buat Cerita Baru</h1>
            <p class="new-story__header__description">
              Silakan lengkapi formulir di bawah untuk membuat cerita baru.
            </p>
          </div>
        </div>
      </section>i
  
      <section class="container">
        <div class="new-form__container">
          <form id="new-form" class="new-form">
            <div class="form-control">
              <label for="description-input" class="new-form__description__title">Deskripsi</label>
              <div class="new-form__description__container">
                <textarea
                  id="description-input"
                  name="description"
                  placeholder="Masukkan deskripsi cerita."
                ></textarea>
              </div>
            </div>
            <div class="form-control">
              <label for="documentations-input" class="new-form__documentations__title">Foto</label>
              <div id="documentations-more-info">Anda dapat menyertakan foto sebagai dokumentasi.</div>
  
              <div class="new-form__documentations__container">
                <div class="new-form__documentations__buttons">
                  <input
                    id="documentations-input"
                    name="documentations"
                    type="file"
                    accept="image/*"
                    multiple
                    hidden="hidden"
                    aria-multiline="true"
                    aria-describedby="documentations-more-info"
                  />
                  <button id="documentations-input-button" class="btn btn-outline" type="button">Pilih File</button>
                  <button id="open-documentations-camera-button" class="btn btn-outline" type="button">Buka Kamera</button>
                </div>
                <ul id="documentations-taken-list" class="new-form__documentations__outputs"></ul>
                <div id="camera-container" class="new-form__camera__container">
                  <video id="camera-video" class="new-form__camera__video" autoplay></video>
                  <canvas id="camera-canvas"></canvas>
                  <select id="camera-select" class="new-tools"></select>
                  <button id="camera-take-button" type="button">Ambil Foto</button>
                </div>
              </div>
            </div>
            <div class="form-control">
              <div class="new-form__location__title">Lokasi</div>
              <div class="new-form__location__container">
                <div class="new-form__location__map__container">
                  <div id='map'></div>
                  <div id="map-loading-container"></div>
                </div>
                <div class="new-form__location__lat-lng">
                  <input type="number" name="lat" step="any" value="${latitude.toFixed(6)}">
                  <input type="number" name="lon" step="any" value="${longitude.toFixed(6)}">
                </div>
              </div>
            </div>
            <div class="form-buttons">
              <span id="submit-button-container">
                <button class="btn" type="submit">Buat Cerita</button>
              </span>
              <a class="btn btn-outline" href="#/">Batal</a>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new NewPresenter({
      view: this,
      model: DicodingStoriesAPI,
    });
    this.#takenDocumentations = [];

    this.#presenter.showNewFormMap();
    this.#setupForm();
    this.#setupCamera();
  }
  async #LoadMap() {
    var map = L.map('map', {
      center: [51.505, -0.09],
      zoom: 13,
    });
  }
  #setupForm() {
    this.#form = document.getElementById('new-form');
    this.#form.addEventListener('submit', async (event) => {
      event.preventDefault();
      console.log('submit', typeof this.#takenDocumentations[0]?.image);

      // Validate photo size before submission
      if (this.#takenDocumentations.length > 0) {
        const documentation = this.#takenDocumentations[0];
        const maxSize = 1000000; // 1MB
        if (documentation.blob.size > maxSize) {
          alert('Foto terlalu besar. Maksimal ukuran foto adalah 1MB.');
          return;
        }
      }

      // If offline, save story directly to IndexedDB queue and skip API call
      if (!navigator.onLine) {
        console.log('Offline detected in form submit, saving story locally...');
        const data = new FormData();
        data.append('description', this.#form.elements.namedItem('description').value);
        data.append('lat', this.#form.elements.namedItem('lat').value);
        data.append('lon', this.#form.elements.namedItem('lon').value);

        if (this.#takenDocumentations.length > 0) {
          const documentation = this.#takenDocumentations[0];
          data.append('photo', documentation.image);
        }

        // Call presenter's offline save method directly
        const result = await this.#presenter.postNewStory(data);
        if (result.ok && result.offline) {
          alert('Story saved locally and will sync when online.');
          if ('serviceWorker' in navigator && 'SyncManager' in window) {
            const registration = await navigator.serviceWorker.ready;
            try {
              await registration.sync.register('sync-new-stories');
              console.log('Background sync registered');
            } catch (error) {
              console.error('Background sync registration failed', error);
            }
          }
          return;
        } else {
          alert(result.message || 'Failed to save story locally.');
          return;
        }
      }

      // Online submission
      const data = new FormData();
      data.append('description', this.#form.elements.namedItem('description').value);
      data.append('lat', this.#form.elements.namedItem('lat').value);
      data.append('lon', this.#form.elements.namedItem('lon').value);

      if (this.#takenDocumentations.length > 0) {
        const documentation = this.#takenDocumentations[0];
        data.append('photo', documentation.image);
      }
      const result = await this.#presenter.postNewStory(data);
      if (result.ok) {
        alert(result.offline ? 'Story saved locally and will sync when online.' : 'Story added successfully!');
        if (result.offline && 'serviceWorker' in navigator && 'SyncManager' in window) {
          const registration = await navigator.serviceWorker.ready;
          try {
            await registration.sync.register('sync-new-stories');
            console.log('Background sync registered');
          } catch (error) {
            console.error('Background sync registration failed', error);
          }
        }
      } else {
        alert(result.message || 'Failed to add story.');
      }
    });

    document.getElementById('documentations-input').addEventListener('change', async (event) => {
      const files = event.target.files; // Mengambil daftar file
      if (!files.length) return; // Jika tidak ada file yang dipilih, hentikan eksekusi

      const insertingPicturesPromises = Array.from(files).map(async (file) => {
        return this.#addTakenPicture(file); // Langsung masukkan sebagai File tanpa konversi objek
      });

      await Promise.all(insertingPicturesPromises);
      await this.#populateTakenPictures();
    });

    document.getElementById('documentations-input-button').addEventListener('click', () => {
      this.#form.elements.namedItem('documentations-input').click();
    });

    const cameraContainer = document.getElementById('camera-container');
    document
      .getElementById('open-documentations-camera-button')
      .addEventListener('click', async (event) => {
        cameraContainer.classList.toggle('open');
        this.#isCameraOpen = cameraContainer.classList.contains('open');

        if (this.#isCameraOpen) {
          event.currentTarget.textContent = 'Tutup Kamera';
          await this.#camera.launch();
          return;
        }
        event.currentTarget.textContent = 'Buka Kamera';
        this.#camera.stop();
      });

      var map = L.map('map').setView([-6.175389, 106.827139], 13);
      const customIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    
    const marker = L.marker([-6.175389, 106.827139], { icon: customIcon }).addTo(map);
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map);
    updatePopup(-6.175389, 106.827139); // Panggil fungsi untuk pertama kali
    map.on('click', function (e) {
      marker.setLatLng(e.latlng);
      updatePopup(e.latlng.lat, e.latlng.lng); // Panggil fungsi untuk mendapatkan nama kota & negara
      document.querySelector("input[name='lat']").value = e.latlng.lat;
      document.querySelector("input[name='lon']").value = e.latlng.lng;
    });

    document.querySelectorAll("input[name='lat'], input[name='lon']").forEach((input) => {
      input.addEventListener('change', () => {
        const lat = parseFloat(document.querySelector("input[name='lat']").value);
        const lon = parseFloat(document.querySelector("input[name='lon']").value);

        marker.setLatLng([lat, lon]);
        updatePopup(lat, lon); // Panggil fungsi saat input berubah

        map.setView([lat, lon], 13);
      });
    });

    // Fungsi untuk mendapatkan kota & negara dari koordinat
    function updatePopup(lat, lon) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then((response) => response.json())
        .then((data) => {
          let address = data.address;

          // Cari lokasi yang tersedia dalam urutan prioritas
          let city =
            address.city ||
            address.town ||
            address.village ||
            address.hamlet ||
            address.county ||
            address.state ||
            'Lokasi tidak diketahui';
          let country = address.country || 'Negara tidak diketahui';

          let popupContent = `📍 ${city}, ${country}`;
          marker.bindPopup(popupContent).openPopup(); // Tampilkan popup
        })
        .catch(() => {
          marker.bindPopup('Lokasi tidak ditemukan').openPopup();
        });
    }
  }

  #setupCamera() {
    if (!this.#camera) {
      this.#camera = new Camera({
        video: document.getElementById('camera-video'),
        cameraSelect: document.getElementById('camera-select'),
        canvas: document.getElementById('camera-canvas'),
      });
    }

    this.#camera.addCheeseButtonListener('#camera-take-button', async () => {
      const image = await this.#camera.takePicture();
      await this.#addTakenPicture(image);
      await this.#populateTakenPictures();
    });
  }

  async #addTakenPicture(image) {
    let blob = image;
    this.#camera.stop();
    if (image instanceof String) {
      blob = convertBase64ToBlob(image, 'image/png');
    }

    const newDocumentation = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      blob: blob,
      image,
    };
    this.#takenDocumentations = [...this.#takenDocumentations, newDocumentation];
  }

  async #populateTakenPictures() {
    const html = this.#takenDocumentations.reduce((accumulator, picture, currentIndex) => {
      const imageUrl = URL.createObjectURL(picture.blob);
      return accumulator.concat(`
        <li class="new-form__documentations__outputs-item">
          <button type="button" data-deletepictureid="${
            picture.id
          }" class="new-form__documentations__outputs-item__delete-btn">
            <img src="${imageUrl}" alt="Dokumentasi ke-${currentIndex + 1}">
          </button>
        </li>
      `);
    }, '');

    document.getElementById('documentations-taken-list').innerHTML = html;

    document.querySelectorAll('button[data-deletepictureid]').forEach((button) =>
      button.addEventListener('click', (event) => {
        const pictureId = event.currentTarget.dataset.deletepictureid;

        const deleted = this.#removePicture(pictureId);
        if (!deleted) {
          console.log(`Picture with id ${pictureId} was not found`);
        }

        this.#populateTakenPictures();
      }),
    );
  }

  #removePicture(id) {
    const selectedPicture = this.#takenDocumentations.find((picture) => {
      return picture.id == id;
    });

    if (!selectedPicture) {
      return null;
    }

    this.#takenDocumentations = this.#takenDocumentations.filter((picture) => {
      return picture.id != selectedPicture.id;
    });

    return selectedPicture;
  }

  async storeNewStory(story) {
    try {
      const dicodingResponse = await AddNewStory(story);
      if (dicodingResponse.error) {
        this.storeFailed(dicodingResponse.message);
        throw new Error(dicodingResponse.message);
      }
      return dicodingResponse;
    } catch (error) {
      console.error('storeNewStory', error);
      // Detect fetch failure and return offline error message
      if (error.message === 'Failed to fetch' || error.message === 'NetworkError when attempting to fetch resource.') {
        return {
          ok: false,
          error: true,
          message: 'Offline: Failed to fetch',
          offline: true,
        };
      }
      return {
        ok: false,
        error: true,
        message: error.message || 'Unknown error in storeNewStory',
      };
    }
  }
  storeSuccessfully(message) {
    console.log(message);
    this.clearForm();
    location.hash = '/';
  }

  storeFailed(message) {
    alert(message);
  }

  clearForm() {
    this.#form.reset();
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  showSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Buat Cerita
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit">Buat Cerita</button>
    `;
  }
}
