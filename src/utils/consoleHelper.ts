// Console helper for backend startup instructions

export function logBackendInstructions() {
  const styles = {
    title: 'color: #f59e0b; font-size: 18px; font-weight: bold;',
    subtitle: 'color: #3b82f6; font-size: 14px; font-weight: bold;',
    text: 'color: #6b7280; font-size: 12px;',
    success: 'color: #10b981; font-size: 12px; font-weight: bold;',
    code: 'background: #1f2937; color: #10b981; padding: 2px 6px; border-radius: 3px; font-family: monospace;',
    warning: 'color: #f59e0b; font-size: 13px; font-weight: bold;',
  };

  console.log('%c🐬 DORPHIN - Backend Not Running', styles.title);
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles.text);
  console.log('');
  
  console.log('%c⚠️  VIDEO UPLOADS DISABLED', styles.warning);
  console.log('%cThe local backend server is not running yet.', styles.text);
  console.log('');
  
  console.log('%c🚀 START THE BACKEND (Choose one method):', styles.subtitle);
  console.log('');
  
  console.log('%c📦 Method 1: One-Click (Windows)', styles.text);
  console.log('%c   Double-click: start-backend.bat', styles.code);
  console.log('');
  
  console.log('%c📦 Method 2: Terminal (All Platforms)', styles.text);
  console.log('%c   cd local-backend', styles.code);
  console.log('%c   npm install', styles.code);
  console.log('%c   npm start', styles.code);
  console.log('');
  
  console.log('%c✅ You\'ll know it\'s working when:', styles.success);
  console.log('%c   • Terminal shows: "Server running on: http://localhost:5000"', styles.text);
  console.log('%c   • Yellow banner disappears from the app', styles.text);
  console.log('%c   • Upload button becomes functional', styles.text);
  console.log('');
  
  console.log('%c🔗 Quick Test:', styles.subtitle);
  console.log('%c   Open: http://localhost:5000/health', styles.text);
  console.log('');
  
  console.log('%c📚 Need more help?', styles.subtitle);
  console.log('%c   • Quick Fix Guide: QUICK_FIX.md', styles.text);
  console.log('%c   • Full Setup: BACKEND_SETUP_INSTRUCTIONS.md', styles.text);
  console.log('');
  
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles.text);
}

export function logBackendConnected() {
  const styles = {
    success: 'color: #10b981; font-size: 16px; font-weight: bold;',
    text: 'color: #6b7280; font-size: 12px;',
  };

  console.log('%c✅ BACKEND CONNECTED!', styles.success);
  console.log('%c🎬 Video uploads are now enabled', styles.text);
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles.text);
}
