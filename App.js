import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Main from './Requester/Main';
import ShowMap from './Requester/ShowMap';
import SearchCanteen from './Requester/SearchCanteen';
import PickLocation from './Requester/PickLocation';
import OrderTrackingMapBeforeConfirm from './Walker/OrderTrackingMapBeforeConfirm';
import OrderTrackingMapToCanteen from './Walker/OrderTrackingMapToCanteen';
import OrderTrackingMapToDestination from './Walker/OrderTrackingMapToDestination';
import ChatWith_Admin from './Walker/ChatWith_Admin';
import ChatWith_Requester from './Walker/ChatWith_Requester';

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
        <Stack.Screen name="ChatWith_Admin" component={ChatWith_Admin} />
        <Stack.Screen name="ChatWith_Requester" component={ChatWith_Requester} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
