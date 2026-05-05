import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  isAdmin: boolean;
  isSessionAdmin: boolean;
  loginAsAdmin: (username: string, pass: string) => Promise<boolean>;
  logoutAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  isAdmin: false,
  isSessionAdmin: false,
  loginAsAdmin: async () => false,
  logoutAdmin: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSessionAdmin, setIsSessionAdmin] = useState(false);

  useEffect(() => {
    // Restore session admin state if needed, though usually just temporary
    const saved = sessionStorage.getItem('admin_session');
    if (saved === 'true') setIsSessionAdmin(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userPath = `users/${firebaseUser.uid}`;
        try {
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            // Initialize user in Firestore if they don't exist
            const newData = {
              uid: firebaseUser.uid,
              fullName: firebaseUser.displayName || 'Customer',
              email: firebaseUser.email,
              phone: firebaseUser.phoneNumber || '',
              createdAt: serverTimestamp(),
              isAdmin: false,
            };
            await setDoc(userDocRef, newData);
            setUserData(newData);
          }
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, userPath);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAsAdmin = async (username: string, pass: string) => {
    if (username === 'admin' && pass === 'admin123') {
      setIsSessionAdmin(true);
      sessionStorage.setItem('admin_session', 'true');
      
      // If a user is logged in to Firebase, upgrade them in Firestore so rules pass
      if (user) {
        try {
          await setDoc(doc(db, 'users', user.uid), { isAdmin: true }, { merge: true });
        } catch (e) {
          console.error("Failed to sync admin status to Firestore:", e);
        }
      }
      return true;
    }
    return false;
  };

  const logoutAdmin = async () => {
    // If a user is logged in, consider if we should revoke Firestore admin status
    // For this applet, we'll revoke it to return to "normal user view"
    if (user && isSessionAdmin) {
      try {
        await setDoc(doc(db, 'users', user.uid), { isAdmin: false }, { merge: true });
      } catch (e) {
        console.error("Failed to revoke admin status from Firestore:", e);
      }
    }
    setIsSessionAdmin(false);
    sessionStorage.removeItem('admin_session');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      loading, 
      isAdmin: (userData?.isAdmin || isSessionAdmin) || false,
      isSessionAdmin,
      loginAsAdmin,
      logoutAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
