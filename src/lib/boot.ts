/**
 * Inline, pre-paint: decides whether the genesis sequence plays, so the
 * first frame is already correct (no flash of the final composition).
 * Skipped for reduced motion, deep links and return visits in the session.
 */
export const genesisBootScript = `(function(){try{var d=document.documentElement;var m=window.matchMedia('(prefers-reduced-motion: reduce)').matches;var h=location.hash&&location.hash!=='#genesis';var s=false;try{s=sessionStorage.getItem('ha:entered')==='1'}catch(e){}d.dataset.genesis=(m||h||s)?'entered':'playing';}catch(e){}})();`;
