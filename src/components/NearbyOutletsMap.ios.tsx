import MapView, { Marker } from "react-native-maps";
import { StyleSheet } from "react-native";

import type { NearbyOutlet, UserCoordinates } from "../services/nearbyOutlets";
import { radius } from "../theme/radius";

type Props = {
  userLocation: UserCoordinates;
  outlets: readonly NearbyOutlet[];
  fallbackText: string;
  onSelect: (outlet: NearbyOutlet) => void;
};

export function NearbyOutletsMap({ userLocation, outlets, onSelect }: Props) {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 2.5,
        longitudeDelta: 2.5,
      }}
      showsUserLocation
      showsMyLocationButton
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
