import { set } from '../../../utils/indexeddb.js';

export default class LoginPresenter {
  #view;
  #model;
  #authModel;

  constructor({ view, model, authModel }) {
    this.#view = view;
    this.#model = model;
    this.#authModel = authModel;
  }

  async getLogin({ email, password }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#model.getLogin({ email, password });

      if (!response.ok) {
        console.error('getLogin: response:', response);
        this.#view.loginFailed(response.message);
        return;
      }

      // Sesuaikan penanganan token
      console.log('getLogin: response:', response);
      this.#authModel.putAccessToken(response.loginResult.token);

      // Save login result to IndexedDB
      await set('loginResult', response.loginResult);

      // Sesuaikan penanganan sukses
      this.#view.loginSuccessfully(response.message, response.loginResult);
    } catch (error) {
      console.error('getLogin: error:', error);
      this.#view.loginFailed('Login failed. Please try again.'); // Pesan error umum
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
