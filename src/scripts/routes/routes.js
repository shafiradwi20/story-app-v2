import RegisterPage from '../pages/auth/register/register-page';
import LoginPage from '../pages/auth/login/login-page';
import HomePage from '../pages/home/home-page';
import NewPage from '../pages/new/new-page';
import StoryDetailPage from '../pages/StoryDetail/story-detail-page';
import IndexedDBPage from '../pages/indexeddb-page';
import NotFoundPage from '../pages/notfound/notfound-page';
import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from '../utils/auth';
import FavoritesPage from '../pages/favorites/favorites-page.js';

export const routes = {
  '/login': () => checkUnauthenticatedRouteOnly(new LoginPage()),
  '/register': () => checkUnauthenticatedRouteOnly(new RegisterPage()),
  
  '/': () => checkAuthenticatedRoute(new HomePage()),
  '/new': () => checkAuthenticatedRoute(new NewPage()),
  '/stories/:id': () => checkAuthenticatedRoute(new StoryDetailPage()),
  
  '/saved-stories': () => checkAuthenticatedRoute(new IndexedDBPage()),
  '/favorites': () => checkAuthenticatedRoute(new FavoritesPage()), // Perbaikan di sini
};

export const defaultRoute = () => new NotFoundPage();