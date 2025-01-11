import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './gesture-handler';
import NavigationStack from './src/navigation';
import { Provider } from 'react-redux';
import { store } from './src/store';



function App() {
  return (
    <GestureHandlerRootView>
      <Provider store={store}>
        <NavigationStack />
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;