import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import './gesture-handler';
import NavigationStack from './src/navigation';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { AutocompleteDropdownContextProvider } from 'react-native-autocomplete-dropdown';

function App() {
  return (
    <GestureHandlerRootView>
      <Provider store={store}>
        <AutocompleteDropdownContextProvider>
          <NavigationStack />
        </AutocompleteDropdownContextProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;
