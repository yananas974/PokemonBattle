import { useState, useEffect } from 'react';

export function useScrollNavigation() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Toujours visible si on est en haut de la page
      if (currentScrollY < 10) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Calculer la direction du scroll
      const scrollingDown = currentScrollY > lastScrollY;
      const scrollingUp = currentScrollY < lastScrollY;
      
      // Minimum de déplacement pour déclencher le changement (évite les micro-mouvements)
      const scrollDelta = Math.abs(currentScrollY - lastScrollY);
      
      if (scrollDelta > 5) {
        if (scrollingDown && currentScrollY > 100) {
          // Scroll vers le bas et on est assez bas dans la page
          setIsVisible(false);
        } else if (scrollingUp) {
          // Scroll vers le haut
          setIsVisible(true);
        }
        
        setLastScrollY(currentScrollY);
      }
    };

    // Throttle pour optimiser les performances
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [lastScrollY]);

  return { isVisible };
} 