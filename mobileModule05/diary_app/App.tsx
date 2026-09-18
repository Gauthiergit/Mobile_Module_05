import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import { useFonts, Caveat_400Regular, Caveat_700Bold } from '@expo-google-fonts/caveat';
import { ActivityIndicator, View } from 'react-native';

import HomePage from './src/pages/HomePage';
import LoginPage from './src/pages/LoginPage';
import ProfilPage from './src/pages/ProfilPage';
import { SafeAreaProvider } from 'react-native-safe-area-context';

WebBrowser.maybeCompleteAuthSession(); 

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({ Caveat_400Regular, Caveat_700Bold });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F4EA' }}>
        <ActivityIndicator color="#2F5D50" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Home"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Home" component={HomePage} />
          <Stack.Screen name="Login" component={LoginPage} />
          <Stack.Screen name="Profile" component={ProfilPage} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>  
  );
}