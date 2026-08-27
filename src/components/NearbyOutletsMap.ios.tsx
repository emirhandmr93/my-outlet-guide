import MapView, { Marker } from "react-native-maps";
import { StyleSheet } from "react-native";
import { useCallback, useEffect, useMemo, useRef } from "react";

import type { NearbyOutlet, UserCoordinates } from "../services/nearbyOutlets";
import { radius } from "../theme/radius";

type Props = {
  userLocation: UserCoordinates;
  outlets: readonly NearbyOutlet[];
  fallbackText: string;
  onSelect: (outlet: NearbyOutlet) => void;
};

export function NearbyOutletsMap({ userLocation, outlets, onSelect }: Props) {
  const mapRef = useRef<MapView | null>(null);
  const coordinates = useMemo(() => [
    { latitude: userLocation.latitude, longitude: userLocation.longitude },
    ...outlets.map((outlet) => ({
      latitude: outlet.latitude,
      longitude: outlet.longitude,
    })),
  ], [outlets, userLocation.latitude, userLocation.longitude]);

  const fitCoordinates = useCallback((animated: boolean) => {
    if (coordinates.length < 2) return;
    mapRef.current?.fitToCoordinates(coordinates, {
      animated,
      edgePadding: { top: 52, right: 44, bottom: 52, left: 44 },
    });
  }, [coordinates]);

  useEffect(() => {
    fitCoordinates(false);
  }, [fitCoordinates]);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={{
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 2.5,
        longitudeDelta: 2.5,
      }}
      showsUserLocation
      showsMyLocationButton
      onMapReady={() => fitCoordinates(false)}
    >
      {outlets.map((outlet) => (
        <Marker
          key={outlet.outletId}
          coordinate={{ latitude: outlet.latitude, longitude: outlet.longitude }}
          title={outlet.name}
          description={`${outlet.distanceKm.toFixed(1)} km`}
          onCalloutPress={() => onSelect(outlet)}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { width: "100%", height: 280, borderRadius: radius.xl },
});
