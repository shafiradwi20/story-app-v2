import { get, set, del, clear, keys } from '../utils/indexeddb.js';

const template = () => `
  <section>
    <h2>IndexedDB Demo</h2>
    <input type="text" id="key" placeholder="Key" />
    <input type="text" id="value" placeholder="Value" />
    <button id="set-btn">Set</button>
    <button id="get-btn">Get</button>
    <button id="delete-btn">Delete</button>
    <button id="clear-btn">Clear All</button>
    <h3>Stored Keys:</h3>
    <ul id="keys-list"></ul>
    <h3>Value:</h3>
    <pre id="value-display"></pre>
  </section>
`;

export default class IndexedDBPage {
  constructor() {}

  async render() {
    return template();
  }

  async afterRender() {
    const keyInput = document.getElementById('key');
    const valueInput = document.getElementById('value');
    const setBtn = document.getElementById('set-btn');
    const getBtn = document.getElementById('get-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const clearBtn = document.getElementById('clear-btn');
    const keysList = document.getElementById('keys-list');
    const valueDisplay = document.getElementById('value-display');

    async function refreshKeys() {
      const allKeys = await keys();
      keysList.innerHTML = allKeys.map(k => `<li>${k}</li>`).join('');
    }

    setBtn.addEventListener('click', async () => {
      const key = keyInput.value.trim();
      const value = valueInput.value.trim();
      if (!key) {
        alert('Please enter a key');
        return;
      }
      await set(key, value);
      await refreshKeys();
      valueInput.value = '';
    });

    getBtn.addEventListener('click', async () => {
      const key = keyInput.value.trim();
      if (!key) {
        alert('Please enter a key');
        return;
      }
      const val = await get(key);
      valueDisplay.textContent = val !== undefined ? val : 'No value found';
    });

    deleteBtn.addEventListener('click', async () => {
      const key = keyInput.value.trim();
      if (!key) {
        alert('Please enter a key');
        return;
      }
      await del(key);
      await refreshKeys();
      valueDisplay.textContent = '';
    });

    clearBtn.addEventListener('click', async () => {
      await clear();
      await refreshKeys();
      valueDisplay.textContent = '';
    });

    await refreshKeys();
  }
}
