import { useEffect, useState } from 'react';

const SPLASH_DURATION = 3000;
const FADE_DURATION = 600;

export function useSplashScreen() {
    const [showSplash, setShowSplash] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        setShowSplash(true);
        
        const fadeTimer = setTimeout(
            () => setFadeOut(true),
            SPLASH_DURATION - FADE_DURATION
        );
        
        const hideTimer = setTimeout(
            () => setShowSplash(false),
            SPLASH_DURATION
        );

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(hideTimer);
        };
    }, []);

    return { showSplash, fadeOut };
}
