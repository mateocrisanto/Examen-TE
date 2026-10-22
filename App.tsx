import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View, ActivityIndicator } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { EquipoProvider, useEquipo } from './src/context/EquipoContext'
import LoginScreen from './src/screens/LoginScreen'
import ExplorarScreen from './src/screens/ExplorarScreen'
import EquipoScreen from './src/screens/EquipoScreen'
import DetalleScreen from './src/screens/DetalleScreen'
import type { RootStackParamList, TabsParamList } from './src/types'
import { C } from './src/tema'

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<TabsParamList>()

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.acento,
        tabBarInactiveTintColor: C.suave,
        tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: C.tarjeta },
      }}
    >
      <Tab.Screen name="Explorar" component={ExplorarScreen} />
      <Tab.Screen name="Equipo" component={EquipoScreen} options={{ title: 'Mi equipo' }} />
    </Tab.Navigator>
  )
}

function Navegador() {
  const { usuario, cargandoAuth } = useEquipo()
  if (cargandoAuth) {
    return (
      <View style={{ flex: 1, backgroundColor: C.fondo, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={C.acento} />
      </View>
    )
  }
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {usuario ? (
          <>
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen name="Detalle" component={DetalleScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <EquipoProvider>
      <Navegador />
    </EquipoProvider>
  )
}
