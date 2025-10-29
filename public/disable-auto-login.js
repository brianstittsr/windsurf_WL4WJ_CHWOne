
// Script to disable auto-login
(function() {
  console.log('Disabling auto-login...');
  
  // Clear localStorage
  localStorage.removeItem('BYPASS_AUTH');
  
  // Override any auto-login functions
  if (window.enableAutoLogin) {
    window.enableAutoLogin = function() {
      console.log('Auto-login has been disabled');
      return false;
    };
  }
  
  console.log('Auto-login disabled successfully');
})();
