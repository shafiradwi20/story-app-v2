import { getActiveRoute } from '../routes/url-parser';
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generateSubscribeButtonTemplate,
  generateUnsubscribeButtonTemplate,
  generateUnauthenticatedNavigationListTemplate,
} from '../templates';
import { subscribe, isCurrentPushSubscriptionAvailable, unsubscribe } from '../utils/notification-helper';
import { isServiceWorkerAvailable, transitionHelper } from '../utils';
import { getAccessToken, getLogout } from '../utils/auth';
import { routes, defaultRoute } from '../routes/routes';

export default class App {
  #content;
  #drawerButton;
  #drawerNavigation;
  constructor({ content, drawerNavigation, drawerButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#drawerNavigation = drawerNavigation;

    this.#init();
  }

  #init() {
    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#drawerNavigation.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      const isTargetInsideDrawer = this.#drawerNavigation.contains(event.target);
      const isTargetInsideButton = this.#drawerButton.contains(event.target);

      if (!(isTargetInsideDrawer || isTargetInsideButton)) {
        this.#drawerNavigation.classList.remove('open');
      }

      this.#drawerNavigation.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#drawerNavigation.classList.remove('open');
        }
      });
    });
  }

  #setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navListMain = this.#drawerNavigation.children.namedItem('navlist-main');
    const navList = this.#drawerNavigation.children.namedItem('navlist');
  
    // User not log in
    if (!isLogin) {
      navListMain.innerHTML = '';
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }
  
    navListMain.innerHTML = generateMainNavigationListTemplate();
    navList.innerHTML = generateAuthenticatedNavigationListTemplate();
  
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();
  
      if (confirm('Apakah Anda yakin ingin keluar?')) {
        getLogout();
        location.hash = '/login';
      }
    });
  
  }
  
  async #setupPushNotification() {
    const pushNotificationTools = document.getElementById('push-notification-tools');
    const isSubscribed = await isCurrentPushSubscriptionAvailable();
  
    if(pushNotificationTools) {
      if (isSubscribed) {
        pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
      } else {
        pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
      }
    }
  
    const subscribeButton = document.getElementById('subscribe-button');
    if (subscribeButton) {
      subscribeButton.addEventListener('click', () => {
        subscribe().finally(() => {
          this.#setupPushNotification();
        });
      });
    }
  
    const unsubscribeButton = document.getElementById('unsubscribe-button');
    if (unsubscribeButton) {
      unsubscribeButton.addEventListener('click', () => {
        unsubscribe().finally(() => {
          this.#setupPushNotification();
        });
      });
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const route = routes[url];

    let page;
    if (!route) {
      console.warn("Route tidak ditemukan:", url);
      page = defaultRoute();
    } else {
      page = route();
    }

    if (!page) {
      console.error("Page tidak tersedia atau user belum login.");
      return;
    }

    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        page.afterRender();
      },
    });

    transition.ready.catch(async (error) => {
      console.error(error);
      // Fallback: render content directly if view transition unsupported
      this.#content.innerHTML = await page.render();
      page.afterRender();
    });
    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: 'instant' });
      this.#setupNavigationList();
      if (isServiceWorkerAvailable()) {
        this.#setupPushNotification();
      }
    });
}

}
