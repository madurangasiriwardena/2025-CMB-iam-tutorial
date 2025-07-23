import React from 'react';
import { CustomProvider } from 'rsuite';
import { useThemeStore } from './theme-store';

interface Props {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<Props> = ({ children }) => {
  const { primaryColor, secondaryColor } = useThemeStore(state => ({
    primaryColor: state.primaryColor,
    secondaryColor: state.secondaryColor
  }));

  const theme = React.useMemo(
    () => ({ primary: primaryColor, secondary: secondaryColor }),
    [primaryColor, secondaryColor]
  );

  return (
    <CustomProvider theme={theme}>
      {children}
    </CustomProvider>
  );
};

export default ThemeProvider;
