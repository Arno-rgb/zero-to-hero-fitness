import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import { store } from './store'; // Assuming './store' exports your Redux store
import App from './App';
import './index.css';
// import theme from './theme'; // Keep theme import commented out or remove for testing

// Get the root element from the HTML
const rootElement = document.getElementById('root') as HTMLElement;

// Create a React root
const root = ReactDOM.createRoot(rootElement);

// Render the application
root.render(
  <React.StrictMode>
    {/* Redux Provider wraps everything that needs access to the store */}
    <Provider store={store}>
      {/* Chakra Provider wraps everything that needs Chakra UI context */}
      {/* The theme prop is removed here to test with Chakra's default theme */}
      <ChakraProvider>
        {/* Your main App component */}
        <App />
      </ChakraProvider>
    </Provider>
  </React.StrictMode>
);
