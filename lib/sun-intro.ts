/** sessionStorage key: the hero intro plays once per browser session. */
export const SUN_INTRO_KEY = 'ds:sun-intro'

/**
 * Inline <head> script, runs before the page paints: on a full reload within the same session the intro is skipped
 * (html[data-sun-intro="skip"]), so the real sun is there from the first frame. Never throws.
 */
export const SUN_INTRO_SCRIPT = `try{if(sessionStorage.getItem('${SUN_INTRO_KEY}'))document.documentElement.setAttribute('data-sun-intro','skip')}catch(e){}`
