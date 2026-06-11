/**
 * redirectUtility.js
 * Helpers to save and restore user intent before/after auth and onboarding.
 */

const INTENT_KEY = 'datalis_redirect_intent';

/**
 * Saves the intended destination URL to localStorage.
 * @param {string} path - The absolute path to redirect to (e.g. '/templates/invoice')
 */
export const saveRedirectIntent = (path) => {
    if (!path) return;
    localStorage.setItem(INTENT_KEY, path);
};

/**
 * Retrieves the saved intent and clears it from storage.
 * @returns {string|null} - The saved path or null.
 */
export const consumeRedirectIntent = () => {
    const path = localStorage.getItem(INTENT_KEY);
    localStorage.removeItem(INTENT_KEY);
    return path;
};

/**
 * Checks if there is a saved intent.
 */
export const hasRedirectIntent = () => {
    return !!localStorage.getItem(INTENT_KEY);
};
