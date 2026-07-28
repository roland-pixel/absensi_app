// src/components/MapPicker.tsx
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function MapPicker({ latitude, longitude, onLocationSelect }: MapPickerProps) {
  const currentLat = latitude || -3.318606;
  const currentLng = longitude || 114.594378;

  // HTML Template Leaflet Map (Free OpenStreetMap)
  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { width: 100vw; height: 100vh; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${currentLat}, ${currentLng}], 15);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          var marker = L.marker([${currentLat}, ${currentLng}], { draggable: true }).addTo(map);

          function sendLocation(lat, lng) {
            var data = JSON.stringify({ lat: lat, lng: lng });
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(data);
            } else if (window.parent) {
              window.parent.postMessage(data, '*');
            }
          }

          // Event saat pin di-drag
          marker.on('dragend', function (e) {
            var coord = marker.getLatLng();
            sendLocation(coord.lat, coord.lng);
          });

          // Event saat Peta di-klik
          map.on('click', function (e) {
            marker.setLatLng(e.latlng);
            sendLocation(e.latlng.lat, e.latlng.lng);
          });
        </script>
      </body>
    </html>
  `;

  // Handler pesan koordinat dari Leaflet
  const handleMessage = (event: any) => {
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.nativeEvent ? JSON.parse(event.nativeEvent.data) : event.data;
      if (data && data.lat && data.lng) {
        onLocationSelect(data.lat, data.lng);
      }
    } catch (e) {
      // Ignore parse error non-JSON
    }
  };

  // Support Web & Mobile Native
  if (Platform.OS === 'web') {
    React.useEffect(() => {
      const onWebMessage = (e: MessageEvent) => handleMessage(e);
      window.addEventListener('message', onWebMessage);
      return () => window.removeEventListener('message', onWebMessage);
    }, []);

    return (
      <View style={styles.container}>
        <iframe
          srcDoc={mapHtml}
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8 }}
          title="Map Picker"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        onMessage={handleMessage}
        style={{ flex: 1, borderRadius: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 220,
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 14,
  },
});