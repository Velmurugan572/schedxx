import React from 'react';
import RootNavigator from './src/navigation/RootNavigator.js';
import { ThemeProvider } from './src/theme/index.js';

export default function App() {
  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}
