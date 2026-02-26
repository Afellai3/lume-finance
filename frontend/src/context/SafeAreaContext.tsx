import { createContext, useContext, ReactNode } from 'react';
import { SafeArea } from '@capacitor-community/safe-area';
import { useEffect, useState } from 'react';

interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const SafeAreaContext = createContext<SafeAreaInsets>({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});

export const useSafeArea = () => useContext(SafeAreaContext);

export const SafeAreaProvider = ({ children }: { children: ReactNode }) => {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const getInsets = async () => {
      try {
        const safeAreaData = await SafeArea.getSafeAreaInsets();
        setInsets(safeAreaData.insets);
        console.log('✅ Safe area insets:', safeAreaData.insets);
      } catch (error) {
        console.warn('⚠️ Could not get safe area insets:', error);
      }
    };

    getInsets();
  }, []);

  return (
    <SafeAreaContext.Provider value={insets}>
      {children}
    </SafeAreaContext.Provider>
  );
};
