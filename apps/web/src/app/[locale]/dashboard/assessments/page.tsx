// Add this at the very top of the file, before any imports
// This will catch any errors during module initialization
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('130')) {
      console.error('[CRITICAL] React error #130 detected:', event.error);
      console.error('[CRITICAL] Error details:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    }
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && String(event.reason).includes('130')) {
      console.error('[CRITICAL] Unhandled promise rejection with React error #130:', event.reason);
    }
  });
}
