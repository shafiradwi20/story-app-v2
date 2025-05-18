import { convertBase64ToUint8Array } from './index';
import { VAPID_PUBLIC_KEY } from '../config';
import { subscribePushNotification, unsubscribePushNotification } from '../data/api';
export function isNotificationAvailable() {
    return 'Notification' in window;
  }
   
  export function isNotificationGranted() {
    return Notification.permission === 'granted';
  }
  export function generateSubscribeOptions() {
    return {
      userVisibleOnly: true,
      applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
    };  
  }
  export async function requestNotificationPermission() {
    if (!isNotificationAvailable()) {
      console.error('Notification API unsupported.');
      return false;
    }
   
    if (isNotificationGranted()) {
      return true;
    }
   
    const status = await Notification.requestPermission();
   
    if (status === 'denied') {
      alert('Izin notifikasi ditolak.');
      return false;
    }
   
    if (status === 'default') {
      alert('Izin notifikasi ditutup atau diabaikan.');
      return false;
    }
   
    return true;
  }

  export async function getPushSubscription() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration) {
        return await registration.pushManager.getSubscription();
      } else {
        console.warn('Tidak ada pendaftaran Service Worker yang aktif.');
        return null;
      }
    } else {
      console.warn('Service Workers tidak didukung di browser ini.');
      return null;
    }
  }
  
  export async function isCurrentPushSubscriptionAvailable() {
    return !!(await getPushSubscription());
  }
  
  export async function unsubscribe() {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration.pushManager.getSubscription();
  
    if (!subscription) {
      alert('Tidak ada langganan yang aktif.');
      return;
    }
  
    try {
      const { endpoint } = subscription.toJSON();
      
      // Panggil API dulu untuk hapus subscription dari server
      console.log('Menghapus langganan push notification...');
      const response = await unsubscribePushNotification({ endpoint });
  
      if (!response.ok) {
        alert('Gagal menonaktifkan langganan dari server.');
        return;
      }
  
      // Jika sukses di server, baru unsubscribe di browser
      const success = await subscription.unsubscribe();
      if (success) {
        alert('Langganan push notification telah dinonaktifkan.');
      } else {
        alert('Gagal menonaktifkan langganan di browser.');
      }
  
    } catch (error) {
      console.error('unsubscribe: error:', error);
      alert('Terjadi kesalahan saat mencoba menonaktifkan langganan.');
    }
  }
  

  
  export async function subscribe() {
    if (!(await requestNotificationPermission())) {
      return;
    }
   
    if (await isCurrentPushSubscriptionAvailable()) {
      alert('Sudah berlangganan push notification.');
      return;
    }
   
    console.log('Mulai berlangganan push notification...');
    const failureSubscribeMessage = 'Langganan push notification gagal diaktifkan.';
    const successSubscribeMessage = 'Langganan push notification berhasil diaktifkan.';
    let pushSubscription;
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());
      const { endpoint, keys } = pushSubscription.toJSON();
      const response = await subscribePushNotification({ endpoint, keys });
      if (!response.ok) {
        console.error('subscribe: response:', response);
        alert(failureSubscribeMessage);
        // Undo subscribe to push notification
        await pushSubscription.unsubscribe();
        return;
      }
      alert(successSubscribeMessage);
    } catch (error) {
      console.error('subscribe: error:', error);
      alert(failureSubscribeMessage);
      await pushSubscription.unsubscribe();
    }
  }