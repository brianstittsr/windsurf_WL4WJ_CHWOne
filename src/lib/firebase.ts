/**
 * Firebase Re-export
 * 
 * This file re-exports Firebase services from the consolidated configuration.
 * It exists for backward compatibility with existing code.
 * 
 * IMPORTANT: New code should import directly from '@/lib/firebase/firebaseConfig'
 */

import { app, auth, db, storage, handleFirebaseError } from '@/lib/firebase/firebaseConfig';

// Re-export Firebase services
export { auth, db, storage, handleFirebaseError };

// Export the app instance
export default app;
