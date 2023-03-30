import { createNativeStackNavigator } from "@react-navigation/native-stack";
const { Navigator, Screen } = createNativeStackNavigator();

import { Home } from "../pages/Home/Home";
import { Loading } from "../pages/Loading/Loading";
import { RegisterPark } from "../pages/RegisterPark";
import { Sightings } from "../pages/Sightings/Sightings";
import { RegisterSighting } from "../pages/RegisterSighting";
import { NearestParks } from "../pages/NearestParks/NearestParks";
import SelectParkSpot from "../pages/SelectParkSpot/SelectParkSpot";
import SelectSightingSpot from "../pages/SelectSightingSpot/SelectSightingSpot";

export function AppRoutes() {
  return (
    <Navigator screenOptions={{ headerShown: false }}>
      <Screen name="home" component={Home} />
      <Screen name="loading" component={Loading} />
      <Screen name="sightings" component={Sightings} />
      <Screen name="register_park" component={RegisterPark} />
      <Screen name="nearest_parks" component={NearestParks} />
      <Screen name="select_park_spot" component={SelectParkSpot} />
      <Screen name="register_sighting" component={RegisterSighting} />
      <Screen name="select_sighting_spot" component={SelectSightingSpot} />
    </Navigator>
  );
}
