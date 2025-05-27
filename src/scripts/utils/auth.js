import { getActiveRoute } from '../routes/url-parser';
import { set, del, get } from '../utils/indexeddb';

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

export async function putAccessToken(token) {
  try {
    localStorage.setItem("ACCESS_TOKEN_KEY", token);
    await set("ACCESS_TOKEN_KEY", token);
    console.log('Token berhasil disimpan ke localStorage dan IndexedDB');
    return true;
  } catch (error) {
    console.error("putAccessToken: error:", error);
    return false;
  }
}

export async function removeAccessToken() {
  try {
    // Hapus dari localStorage
    localStorage.removeItem("ACCESS_TOKEN_KEY");
    
    // Hapus dari IndexedDB
    await del("ACCESS_TOKEN_KEY");
    
    // Verifikasi bahwa data benar-benar terhapus dari IndexedDB
    const checkToken = await get("ACCESS_TOKEN_KEY");
    if (checkToken !== undefined) {
      console.error('Token masih ada di IndexedDB setelah dihapus');
      throw new Error('Gagal menghapus token dari IndexedDB');
    }
    
    console.log('Token berhasil dihapus dari localStorage dan IndexedDB');
    return true;
  } catch (error) {
    console.error("removeAccessToken: error:", error);
    return false;
  }
}

const unauthenticatedRoutesOnly = ['/login', '/register'];

export function checkUnauthenticatedRouteOnly(page) {
  const url = getActiveRoute();
  const isLogin = !!getAccessToken();
  
  if (unauthenticatedRoutesOnly.includes(url) && isLogin) {
    location.hash = '/';
    return null;
  }
  
  return page;
}

export function checkAuthenticatedRoute(page) {
  const isLogin = !!getAccessToken();
  if (!isLogin) {
    location.hash = '/login';
    return null
  }
  return page;
}

export async function getLogout() {
  try {
    // Pastikan token benar-benar terhapus
    const isRemoved = await removeAccessToken();
    
    if (!isRemoved) {
      throw new Error('Gagal menghapus token');
    }
    
    // Verifikasi sekali lagi bahwa token sudah terhapus
    const remainingToken = await get("ACCESS_TOKEN_KEY");
    if (remainingToken !== undefined) {
      console.error('Token masih ada setelah logout');
      // Coba hapus lagi
      await del("ACCESS_TOKEN_KEY");
    }
    
    console.log('Logout berhasil, semua data telah dihapus');
    location.hash = '/login';
  } catch (error) {
    console.error('Error during logout:', error);
    // Tetap redirect ke login meskipun ada error
    location.hash = '/login';
  }
}