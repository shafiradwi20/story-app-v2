import { set, get } from '../../../utils/indexeddb.js';

export default class RegisterPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async getRegistered({ name, email, password }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#model.getRegistered({ name, email, password });

      if (!response.ok) {
        console.error('getRegistered: response:', response);
        // Tangani error secara spesifik berdasarkan respons API
        this.#view.registeredFailed(response.message || 'Registration failed.');
        return;
      }

      // Append registration data to IndexedDB without deleting existing data
      const existingUsers = (await get('registeredUsers')) || [];
      existingUsers.push({ name, email });
      await set('registeredUsers', existingUsers);

      // Sesuaikan penanganan sukses
      this.#view.registeredSuccessfully(response.message, response.message); // Atau respons lain yang sesuai

    } catch (error) {
      console.error('getRegistered: error:', error);
      this.#view.registeredFailed('Registration failed. Please try again.'); // Pesan error umum
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
