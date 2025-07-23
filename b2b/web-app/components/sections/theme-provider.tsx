import React from 'react';
import { CustomProvider } from 'rsuite';
import { useThemeStore } from './theme-store';
import chroma from 'chroma-js';

interface Props {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<Props> = ({ children }) => {
  const primaryColor = useThemeStore(state => state.primaryColor);
  const secondaryColor = useThemeStore(state => state.secondaryColor);

  React.useEffect(() => {
    // Generate 9 shades for primary color
    const scale = chroma.scale([chroma(primaryColor).brighten(2), primaryColor, chroma(primaryColor).darken(2)])
      .mode('lab')
      .colors(9);
    for (let i = 0; i < 9; i++) {
      document.documentElement.style.setProperty(`--rs-primary-${(i+1)*100}`, scale[i]);
    }
    // Set secondary color as button default background
    document.documentElement.style.setProperty('--rs-btn-default-bg', secondaryColor);
    // Generate a contrasting color for button text
    const contrastText = chroma.contrast(secondaryColor, '#000') > chroma.contrast(secondaryColor, '#fff') ? '#000' : '#fff';
    document.documentElement.style.setProperty('--rs-btn-default-text', contrastText);
    // Generate a lighter color for button hover background
    const hoverBg = chroma(secondaryColor).brighten(0.5).hex();
    document.documentElement.style.setProperty('--rs-btn-default-hover-bg', hoverBg);
  }, [primaryColor, secondaryColor]);

  return (
    <CustomProvider theme="default">
      {children}
    </CustomProvider>
  );
};

export default ThemeProvider;
