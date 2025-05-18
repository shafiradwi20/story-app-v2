export default class NotFoundPage {
  async render() {
    return `
      <section style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 70vh; text-align: center; padding: 20px;">
        <h1 style="font-size: 4rem; margin-bottom: 1rem; color: #ff5722;">404</h1>
        <h2 style="font-size: 2rem; margin-bottom: 1rem;">Page Not Found</h2>
        <p style="font-size: 1.2rem; margin-bottom: 2rem; color: #666;">The page you are looking for does not exist.</p>
        <button id="home-button" style="background-color: #ff5722; color: white; border: none; padding: 10px 20px; font-size: 1rem; border-radius: 5px; cursor: pointer;">
          Go to Home
        </button>
      </section>
    `;
  }

  async afterRender() {
    const homeButton = document.getElementById('home-button');
    homeButton.addEventListener('click', () => {
      window.location.hash = '/';
    });
  }
}
