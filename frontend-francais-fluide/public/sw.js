// Service Worker pour FrançaisFluide
// Gestion du cache et synchronisation en arrière-plan

const CACHE_NAME = 'francais-fluide-v1';
const STATIC_CACHE = 'francais-fluide-static-v1';
const API_CACHE = 'francais-fluide-api-v1';

// Assets statiques à mettre en cache
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/editor',
  '/exercises',
  '/profile',
  '/collaborative-editor',
  '/manifest.json',
  '/favicon.ico',
];

// URLs d'API à mettre en cache
const API_ENDPOINTS = ['/api/grammar', '/api/progress', '/api/exercises'];

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installation');

  event.waitUntil(
    Promise.all([
      // Cache des assets statiques
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Service Worker: Mise en cache des assets statiques');
        return cache.addAll(STATIC_ASSETS);
      }),

      // Cache des endpoints API
      caches.open(API_CACHE).then(cache => {
        console.log('Service Worker: Préparation du cache API');
        return Promise.resolve();
      }),
    ]).then(() => {
      console.log('Service Worker: Installation terminée');
      return self.skipWaiting();
    })
  );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activation');

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Supprimer les anciens caches
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
              console.log("Service Worker: Suppression de l'ancien cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation terminée');
        return self.clients.claim();
      })
  );
});

// Gestion des requêtes
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }

  // Stratégie pour les assets statiques (Cache First)
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Stratégie pour les API (Network First)
  if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Stratégie par défaut (Stale While Revalidate)
  event.respondWith(handleDefaultRequest(request));
});

// Vérifier si c'est un asset statique
function isStaticAsset(request) {
  const url = new URL(request.url);

  return (
    request.method === 'GET' &&
    (url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.jpeg') ||
      url.pathname.endsWith('.gif') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.woff') ||
      url.pathname.endsWith('.woff2') ||
      url.pathname.endsWith('.ttf') ||
      url.pathname.endsWith('.eot') ||
      url.pathname === '/' ||
      STATIC_ASSETS.includes(url.pathname))
  );
}

// Vérifier si c'est une requête API
function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
}

// Gérer les assets statiques (Cache First)
async function handleStaticAsset(request) {
  try {
    // Essayer le cache d'abord
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Service Worker: Asset statique servi depuis le cache:', request.url);
      return cachedResponse;
    }

    // Si pas en cache, récupérer depuis le réseau
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Mettre en cache pour la prochaine fois
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('Service Worker: Asset statique mis en cache:', request.url);
    }

    return networkResponse;
  } catch (error) {
    console.error("Service Worker: Erreur lors de la récupération de l'asset statique:", error);

    // Retourner une page d'erreur ou une réponse par défaut
    return new Response('Asset non disponible', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// Gérer les requêtes API (Network First)
async function handleAPIRequest(request) {
  try {
    // Essayer le réseau d'abord
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Mettre en cache la réponse
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('Service Worker: Réponse API mise en cache:', request.url);
    }

    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Réseau indisponible, tentative depuis le cache:', request.url);

    // Si le réseau échoue, essayer le cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Service Worker: Réponse API servie depuis le cache:', request.url);
      return cachedResponse;
    }

    // Si pas en cache non plus, retourner une erreur
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Service indisponible hors ligne',
        offline: true,
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// Gérer les requêtes par défaut (Stale While Revalidate)
async function handleDefaultRequest(request) {
  try {
    // Essayer le cache d'abord
    const cachedResponse = await caches.match(request);

    // Récupérer depuis le réseau en arrière-plan
    const networkPromise = fetch(request)
      .then(response => {
        if (response.ok) {
          const cache = caches.open(CACHE_NAME);
          cache.then(c => c.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => null);

    // Retourner la réponse du cache si disponible, sinon attendre le réseau
    return cachedResponse || (await networkPromise);
  } catch (error) {
    console.error('Service Worker: Erreur lors de la gestion de la requête:', error);
    return new Response('Erreur de service', {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}

// Gestion des messages du client
self.addEventListener('message', event => {
  const { type, data } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CACHE_URLS':
      // Mettre en cache des URLs spécifiques
      event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
          return cache.addAll(data.urls);
        })
      );
      break;

    case 'CLEAR_CACHE':
      // Vider le cache
      event.waitUntil(
        caches.keys().then(cacheNames => {
          return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
        })
      );
      break;

    case 'GET_CACHE_SIZE':
      // Obtenir la taille du cache
      event.waitUntil(
        caches
          .keys()
          .then(cacheNames => {
            return Promise.all(
              cacheNames.map(cacheName => caches.open(cacheName).then(cache => cache.keys()))
            );
          })
          .then(cacheKeys => {
            const totalSize = cacheKeys.flat().length;
            event.ports[0].postMessage({ type: 'CACHE_SIZE', size: totalSize });
          })
      );
      break;

    default:
      console.log('Service Worker: Message non reconnu:', type);
  }
});

// Synchronisation en arrière-plan
self.addEventListener('sync', event => {
  console.log('Service Worker: Synchronisation en arrière-plan:', event.tag);

  switch (event.tag) {
    case 'background-sync':
      event.waitUntil(handleBackgroundSync());
      break;

    case 'sync-documents':
      event.waitUntil(handleDocumentSync());
      break;

    default:
      console.log('Service Worker: Tag de synchronisation non reconnu:', event.tag);
  }
});

// Gérer la synchronisation en arrière-plan
async function handleBackgroundSync() {
  try {
    console.log('Service Worker: Début de la synchronisation en arrière-plan');

    // Récupérer les données en attente depuis IndexedDB
    const pendingData = await getPendingSyncData();

    if (pendingData.length === 0) {
      console.log('Service Worker: Aucune donnée à synchroniser');
      return;
    }

    // Synchroniser chaque élément
    for (const item of pendingData) {
      try {
        await syncItem(item);
        await markItemAsSynced(item.id);
      } catch (error) {
        console.error("Service Worker: Erreur lors de la synchronisation de l'élément:", error);
      }
    }

    console.log('Service Worker: Synchronisation en arrière-plan terminée');
  } catch (error) {
    console.error('Service Worker: Erreur lors de la synchronisation en arrière-plan:', error);
  }
}

// Gérer la synchronisation des documents
async function handleDocumentSync() {
  try {
    console.log('Service Worker: Synchronisation des documents');

    // Logique de synchronisation des documents
    // À implémenter selon les besoins spécifiques
  } catch (error) {
    console.error('Service Worker: Erreur lors de la synchronisation des documents:', error);
  }
}

// Récupérer les données en attente de synchronisation
async function getPendingSyncData() {
  // Simulation - en production, récupérer depuis IndexedDB
  return [];
}

// Synchroniser un élément
async function syncItem(item) {
  // Simulation - en production, envoyer vers l'API
  console.log("Service Worker: Synchronisation de l'élément:", item);
}

// Marquer un élément comme synchronisé
async function markItemAsSynced(itemId) {
  // Simulation - en production, mettre à jour IndexedDB
  console.log('Service Worker: Élément marqué comme synchronisé:', itemId);
}

// Gestion des notifications push (optionnel)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'francais-fluide-notification',
      data: data.data,
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(clients.openWindow('/'));
});

console.log('Service Worker: Script chargé');
