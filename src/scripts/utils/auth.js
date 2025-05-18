import { getActiveRoute } from '../routes/url-parser';


export function getAccessToken() {
  try {
    const accessToken = localStorage.getItem("ACCESS_TOKEN_KEY");

    if (accessToken === 'null' || accessToken === 'undefined') {
      throw new Error('Invalid token');
    }

    return accessToken;
  } catch (error) {
    console.error('getAccessToken: error:', error);
    return null;
  }
}

export function putAccessToken(token) {
  try {
    localStorage.setItem("ACCESS_TOKEN_KEY", token);
    return true;
  } catch (error) {
    console.error('putAccessToken: error:', error);
    return false;
  }
}

export function removeAccessToken() {
  try {
    localStorage.removeItem("ACCESS_TOKEN_KEY");
    return true;
  } catch (error) {
    console.error('getLogout: error:', error);
    return false;
  }
}

const unauthenticatedRoutesOnly = ['/login', '/register']; // Sesuaikan rute

export function checkUnauthenticatedRouteOnly(page) {
  const url = getActiveRoute();
  const isLogin = !!getAccessToken();

  if (unauthenticatedRoutesOnly.includes(url) && isLogin) {
    location.hash = '/'; // Atau rute lain yang sesuai
    return null;
  }

  return page;
}

export function checkAuthenticatedRoute(page) {
  const isLogin = !!getAccessToken();
  if (!isLogin) {
    location.hash = '/login'; // Atau rute login yang sesuai
    return null
  }
  return page;
}

export function getLogout() {
  removeAccessToken();
  location.hash = '/login'; // Redirect setelah logout
}