import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

let googleMapsPromise;

export function loadGoogleMaps() {
  if (!googleMapsPromise) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    setOptions({ key: apiKey, v: 'weekly' });
    googleMapsPromise = Promise.all([
      importLibrary('maps'),
      importLibrary('marker'),
    ]).then(() => globalThis.google);
  }

  return googleMapsPromise;
}