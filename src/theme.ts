import { theme as defaultTheme } from '@chakra-ui/react';

// Define the theme
const theme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    brand: {
      50: '#e6fffa',
      100: '#b2f5ea',
      500: '#319795',
      900: '#1a202c',
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
};

export default theme;
