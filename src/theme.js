import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#CD201F',
      light: '#e75654',
      dark: '#9e1917',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#CD201F',
    },
    error: {
      main: '#CD201F',
    },
    background: {
      default: '#0F0F0F',
      paper: '#212121',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#9e1917',
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        thumb: {
          '&:hover, &.Mui-focusVisible': {
            boxShadow: '0px 0px 0px 8px rgba(205, 32, 31, 0.16)',
          },
        },
      },
    },
  },
});

export default theme;
