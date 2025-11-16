import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      primary: '#0D3B66',
      secondary: '#D7D9EC',
      background: '#FFFFFF',
      accentNatural: '#E3FDE1',
      accentWarm: '#FED3D3',
      text: '#222222',
    },
  },
  fonts: {
    heading: '"Helvetica Neue", Arial, sans-serif',
    body: '"Helvetica Neue", Arial, sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: 'brand.background',
        color: 'brand.text',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'md',
        fontWeight: '600',
      },
      variants: {
        solid: {
          bg: 'brand.primary',
          color: 'white',
          _hover: { bg: '#0b3155' },
        },
        outline: {
          borderColor: 'brand.primary',
          color: 'brand.primary',
        },
      },
    },
    Table: {
      baseStyle: {
        th: {
          bg: 'brand.secondary',
          color: 'brand.text',
          fontWeight: '600',
        },
      },
    },
  },
});

export default theme;
