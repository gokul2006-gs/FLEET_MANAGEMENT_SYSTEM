import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon missing in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to re-center map when vehicles change
const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
};

const MapComponent = ({ vehicles, selectedVehicle, height = "400px" }) => {
    // Default center: Tamil Nadu, India
    const defaultCenter = [11.1271, 78.6569];

    // Prioritize selected vehicle, then first vehicle, then default
    const center = selectedVehicle?.location
        ? [selectedVehicle.location.lat, selectedVehicle.location.lng]
        : (vehicles.length > 0 && vehicles[0].location
            ? [vehicles[0].location.lat, vehicles[0].location.lng]
            : defaultCenter);

    // Zoom level appropriate for Tamil Nadu state view
    // If a specific vehicle is selected, zoom in closer!
    const defaultZoom = selectedVehicle ? 15 : (vehicles.length > 0 ? 13 : 7);

    return (
        <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200" style={{ height: height }}>
            <MapContainer center={center} zoom={defaultZoom} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {vehicles.map((vehicle) => (
                    vehicle.location && (
                        <Marker key={vehicle._id} position={[vehicle.location.lat, vehicle.location.lng]}>
                            <Popup>
                                <div className="p-1">
                                    <h3 className="font-bold text-slate-800">{vehicle.make} {vehicle.model}</h3>
                                    <p className="text-xs text-slate-500">Status: {vehicle.status}</p>
                                    <p className="text-xs text-slate-500">Fuel: {vehicle.currentFuelLevel}%</p>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}

                <RecenterAutomatically lat={center[0]} lng={center[1]} />
            </MapContainer>
        </div>
    );
};

export default MapComponent;
