"use client";

import { useState } from "react";

export type BrowserLocation = {
  latitude: number;
  longitude: number;
};

export function useBrowserLocation() {
  const [location, setLocation] = useState<BrowserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function requestLocation() {
    setError(null);

    if (!navigator.geolocation) {
      setError("Browser tidak mendukung Geolocation API.");
      return null;
    }

    setIsLoading(true);

    return new Promise<BrowserLocation | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setLocation(nextLocation);
          setIsLoading(false);
          resolve(nextLocation);
        },
        (geolocationError) => {
          // Permission denied harus ditangani jelas supaya user tahu perlu mengaktifkan akses lokasi browser.
          const message =
            geolocationError.code === geolocationError.PERMISSION_DENIED
              ? "Akses lokasi ditolak. Aktifkan permission lokasi di browser untuk clock in/out."
              : "Gagal mengambil lokasi. Pastikan GPS atau layanan lokasi aktif.";
          setError(message);
          setIsLoading(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 12_000, maximumAge: 0 }
      );
    });
  }

  return { location, error, isLoading, requestLocation };
}
