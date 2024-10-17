import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Main from './Page/Main';
import ShowMap from './Page/ShowMap';
import SearchCanteen from './Page/SearchCanteen';
import PickLocation from './Page/PickLocation';
import OrderTrackingMapBeforeConfirm from './Page/OrderTrackingMapBeforeConfirm';
import OrderTrackingMapToCanteen from './Page/OrderTrackingMapToCanteen';
import OrderTrackingMapToDestination from './Page/OrderTrackingMapToDestination';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        <Stack.Screen name="Main" component={Main} />
        <Stack.Screen name="SearchCanteen" component={SearchCanteen} />
        {/* <Stack.Screen name="SearchCanteen" component={SearchCanteen} /> */}
        <Stack.Screen name="ShowMap" component={ShowMap} />
        <Stack.Screen name="PickLocation" component={PickLocation} />
        <Stack.Screen name="OrderTrackingMapBeforeConfirm" component={OrderTrackingMapBeforeConfirm} />
        <Stack.Screen name="OrderTrackingMapToCanteen" component={OrderTrackingMapToCanteen} />
        <Stack.Screen name="OrderTrackingMapToDestination" component={OrderTrackingMapToDestination} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
