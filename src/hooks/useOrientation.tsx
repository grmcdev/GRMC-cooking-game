import { useState, useEffect } from 'react';

type LayoutMode = 'landscape' | 'portrait' | 'auto';
type DeviceType = 'desktop' | 'tablet' | 'phone';

export const useOrientation = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    return (localStorage.getItem('layout_mode') as LayoutMode) || 'auto';
  });

  useEffect(() => {
    const checkOrientation = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const portrait = window.matchMedia('(orientation: portrait)').matches;
      
      setIsMobile(mobile);
      
      // Determine device type
      if (width < 768) {
        setDeviceType('phone');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
      
      // Apply layout mode preference
      if (layoutMode === 'auto') {
        setIsPortrait(portrait);
      } else {
        setIsPortrait(layoutMode === 'portrait');
      }
    };

    checkOrientation();

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [layoutMode]);

  const toggleLayoutMode = () => {
    const newMode: LayoutMode = layoutMode === 'auto' 
      ? 'portrait' 
      : layoutMode === 'portrait' 
      ? 'landscape' 
      : 'auto';
    
    setLayoutMode(newMode);
    localStorage.setItem('layout_mode', newMode);
  };

  return {
    isMobile,
    isPortrait,
    isLandscape: !isPortrait,
    deviceType,
    layoutMode,
    toggleLayoutMode,
  };
};
