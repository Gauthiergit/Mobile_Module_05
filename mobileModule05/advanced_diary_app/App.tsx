import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import { useFonts, Caveat_400Regular, Caveat_700Bold } from '@expo-google-fonts/caveat';
import { ActivityIndicator, View } from 'react-native';

import HomePage from './src/pages/HomePage';
import LoginPage from './src/pages/LoginPage';
import ProfilPage from './src/pages/ProfilPage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfilePage from './src/pages/ProfilPage';
import { AntDesign } from '@expo/vector-icons';
import CalendarPage from './src/pages/CalendarPage';

WebBrowser.maybeCompleteAuthSession(); 

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
// 4. Création du groupe d'onglets (Zone connectée)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { 
          backgroundColor: '#2F5D50',
          borderTopColor: '#FFFFFF', 
        },
        tabBarActiveTintColor: '#DDE9D7',
        tabBarInactiveTintColor: '#A8C3A0',
      }}
    >
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfilePage} 
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <AntDesign name="user" size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="CalendarTab" 
        component={CalendarPage} 
        options={{
          tabBarLabel: 'Calendar',
          tabBarIcon: ({ color, size }) => <AntDesign name="calendar" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

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
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>  
  );
}