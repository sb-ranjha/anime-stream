import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User, signOut, browserSessionPersistence } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  isAdmin: false,
  logout: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const navigate = useNavigate();
  const db = getFirestore();

  // Session timeout duration (15 minutes)
  const SESSION_TIMEOUT = 15 * 60 * 1000;

  // Update last activity timestamp
  const updateLastActivity = () => {
    setLastActivity(Date.now());
  };

  // Check for session timeout
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUser && Date.now() - lastActivity > SESSION_TIMEOUT) {
        console.log('Session timeout - logging out');
        logout();
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [currentUser, lastActivity]);

  // Track user activity
  useEffect(() => {
    if (currentUser) {
      // Update last activity on user interactions
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      const handleActivity = () => updateLastActivity();

      events.forEach(event => {
        window.addEventListener(event, handleActivity);
      });

      return () => {
        events.forEach(event => {
          window.removeEventListener(event, handleActivity);
        });
      };
    }
  }, [currentUser]);

  // Handle window/tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear any sensitive data from localStorage/sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Force logout on window close
      const auth = getAuth();
      auth.signOut();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Check if user has admin role
  const checkAdminRole = async (user: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'admins', user.uid));
      const isValidAdmin = userDoc.exists() && userDoc.data()?.role === 'admin';
      
      if (!isValidAdmin) {
        console.warn('Invalid admin access attempt:', user.email);
      }
      
      return isValidAdmin;
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  };

  // Secure logout function
  const logout = async () => {
    const auth = getAuth();
    try {
      // Clear all local storage and session data
      localStorage.clear();
      sessionStorage.clear();
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Reset state
      setCurrentUser(null);
      setIsAdmin(false);
      
      // Redirect to login
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Authentication state observer
  useEffect(() => {
    const auth = getAuth();
    
    // Configure session persistence to browser session only
    auth.setPersistence(browserSessionPersistence);
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Verify admin status on each auth state change
          const adminStatus = await checkAdminRole(user);
          if (!adminStatus) {
            await logout();
            return;
          }
          
          setCurrentUser(user);
          setIsAdmin(true);
          updateLastActivity();
        } catch (error) {
          console.error('Auth state change error:', error);
          await logout();
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
        if (window.location.pathname === '/admin') {
          navigate('/login');
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [navigate]);

  const value = {
    currentUser,
    loading,
    isAdmin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 