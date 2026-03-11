interface PropertyMapProps {
  latitude: number;
  longitude: number;
  address: string;
}

export default function PropertyMap({ latitude, longitude, address }: PropertyMapProps) {
  // Using OpenStreetMap embed as fallback (no API key required)
  // Replace with Google Maps when API key is configured
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <div className="h-64">
      <iframe
        src={mapUrl}
        className="w-full h-full border-0"
        loading="lazy"
        title={`Mapa de ${address}`}
      />
      <div className="p-4 bg-gray-50 border-t">
        <p className="text-sm text-gray-600">{address}</p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gold-600 hover:text-navy-900 font-medium"
        >
          Ver en Google Maps →
        </a>
      </div>
    </div>
  );
}
