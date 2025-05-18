import RegisterPage from '../pages/auth/register/register-page';
import LoginPage from '../pages/auth/login/login-page';
import HomePage from '../pages/home/home-page';
import NewPage from '../pages/new/new-page';
import StoryDetailPage from '../pages/StoryDetail/story-detail-page';
import NotFoundPage from '../pages/notfound/notfound-page';
import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from '../utils/auth';

export const routes = {
  '/login': () => checkUnauthenticatedRouteOnly(new LoginPage()),
  '/register': () => checkUnauthenticatedRouteOnly(new RegisterPage()),

  '/': () => checkAuthenticatedRoute(new HomePage()),
  '/new': () => checkAuthenticatedRoute(new NewPage()),
  '/stories/:id': () => checkAuthenticatedRoute(new StoryDetailPage()),
  '/indexeddb': () => checkAuthenticatedRoute(import('../pages/indexeddb-page').then(m => new m.default())),
};

export const defaultRoute = () => new NotFoundPage();
