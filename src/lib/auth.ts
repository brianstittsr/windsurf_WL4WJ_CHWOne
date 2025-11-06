import { auth } from './firebase/firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/firebaseConfig';

export interface AuthUser {
  id: string;
  email: string | null;
  name?: string | null;
  role?: string;
  isAdmin?: boolean;
  organizationId?: string;
  chwAssociationId?: string;
}

// Auth options for API routes
export const authOptions = {
  // This is a placeholder - in a real app, configure proper authOptions
  callbacks: {
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.sub;
        
        // If we have additional user data in Firestore, fetch it
        try {
          const userDoc = await getDoc(doc(db, 'users', token.sub));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            session.user.role = userData.role || 'user';
            session.user.isAdmin = userData.role === 'admin';
            session.user.organizationId = userData.organizationId;
            session.user.chwAssociationId = userData.chwAssociationId;
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      return session;
    }
  }
};

// Function to get current user
export const getCurrentUser = (): Promise<AuthUser | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        unsubscribe();
        if (!user) {
          resolve(null);
          return;
        }

        try {
          // Get additional user info from Firestore if available
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            resolve({
              id: user.uid,
              email: user.email,
              name: user.displayName || userData.displayName,
              role: userData.role || 'user',
              isAdmin: userData.role === 'admin',
              organizationId: userData.organizationId,
              chwAssociationId: userData.chwAssociationId,
            });
          } else {
            // Basic user info if no Firestore data
            resolve({
              id: user.uid,
              email: user.email,
              name: user.displayName,
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Return basic user info on error
          resolve({
            id: user.uid,
            email: user.email,
            name: user.displayName,
          });
        }
      },
      reject
    );
  });
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<AuthUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Get additional user info
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  
  if (userDoc.exists()) {
    const userData = userDoc.data();
    return {
      id: user.uid,
      email: user.email,
      name: user.displayName || userData.displayName,
      role: userData.role || 'user',
      isAdmin: userData.role === 'admin',
      organizationId: userData.organizationId,
      chwAssociationId: userData.chwAssociationId,
    };
  }
  
  return {
    id: user.uid,
    email: user.email,
    name: user.displayName,
  };
};

// Sign out
export const signOut = async (): Promise<void> => {
  return firebaseSignOut(auth);
};

// Get server session - simplified version for API routes
export const getServerSession = async () => {
  // In a real app, this would be more complex
  // For now, we'll just check if there's a current user
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  return {
    user
  };
};
