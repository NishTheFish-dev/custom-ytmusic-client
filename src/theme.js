import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF0000',
      light: '#FF4D4D',
      dark: '#CC0000',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF0000',
    },
    error: {
      main: '#FF0000',
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
            backgroundColor: '#CC0000',
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        thumb: {
          '&:hover, &.Mui-focusVisible': {
            boxShadow: '0px 0px 0px 8px rgba(255, 0, 0, 0.16)',
          },
        },
      },
    },
  },
});

export default theme;
