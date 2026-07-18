import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

const RootComponent =
  Platform.OS === 'web' && process.env.EXPO_PUBLIC_USE_WEB_POC === '1'
  ? require('./src/web-poc/WebPocApp').default
  : require('./App').default;

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(RootComponent);
