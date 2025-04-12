export function useIsSafari() {
    if (typeof window === 'undefined') return false;
    
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                 ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 1 && 
                  /MacIntel/.test(navigator.userAgent));
    
    return isSafari || isIOS;
} 