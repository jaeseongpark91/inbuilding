import React from 'react';
import { Prisma } from "@prisma/client";

interface MapProps {
  latitude: Prisma.Decimal | null;
  longitude: Prisma.Decimal | null;
}

const width: number = 450
const height: number = 400

const Map: React.FC<MapProps> = ({ latitude, longitude }) => {
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("Mapbox access token is not set. Please add it to your .env file.");
      return null;
    }
    const mapImageSrc = `https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/pin-s+17202A(${longitude},${latitude})/${longitude},${latitude},14/${width}x${height}@2x?access_token=${accessToken}`;
    
    return (
    <div style={{ display: 'flex', justifyContent: 'center'}}>
        <img
        src={mapImageSrc}
        alt={`Static map image at latitude ${latitude}, longitude ${longitude}`}
        style={{ width: width/1.5, height: height/1.5 }}
        />
    </div>
    
  );
};

export default Map;