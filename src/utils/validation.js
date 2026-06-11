// Email validation (RFC 5322 compliant)
export const isValidEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// Sanitize user input
export const sanitizeInput = (input) => {
  // Remove any HTML/script tags
  return input.replace(/<[^>]*>?/gm, '').trim();
};

// Validate name (no special characters, emojis, etc.)
export const isValidName = (name) => {
  // Only allow letters, spaces, hyphens, and apostrophes
  const re = /^[a-zA-Z\s'-]+$/;
  return re.test(name);
};

