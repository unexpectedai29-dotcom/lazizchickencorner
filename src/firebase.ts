import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  setPersistence,
  browserLocalPersistence,
  sendEmailVerification
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  getDocFromServer,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import { Order, OrderStatus } from './types';

// Detect if we have real credentials or the sandbox placeholder
const isPlaceholder = !firebaseConfig.apiKey || firebaseConfig.apiKey.includes('placeholder');

let firebaseApp;
let realDb: any = null;
let realAuth: any = null;

if (!isPlaceholder) {
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    realDb = getFirestore(firebaseApp);
    realAuth = getAuth(firebaseApp);
    // Secure Session Persistence configuration
    setPersistence(realAuth, browserLocalPersistence)
      .catch((err) => {
        console.error("Failed to specify secure browser session persistence:", err);
      });
  } catch (err) {
    console.error("Failed to initialize physical Firebase instance:", err);
  }
}

// Allow force-enabling sandbox on connection or credential auth errors (like unauthorized-domain)
export const isFirebaseSandbox = false;

export function enableSandboxBypass() {
  localStorage.removeItem('laziz_force_sandbox');
  window.location.reload();
}

export function disableSandboxBypass() {
  localStorage.removeItem('laziz_force_sandbox');
  window.location.reload();
}

// --- MANDATORY ERROR HANDLER FOR PROD FIRESTORE ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuth = realAuth || null;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.currentUser?.uid || 'guest_sandbox',
      email: currentAuth?.currentUser?.email || 'guest_sandbox@gmail.com',
      emailVerified: currentAuth?.currentUser?.emailVerified || false,
      isAnonymous: currentAuth?.currentUser?.isAnonymous || false,
      tenantId: currentAuth?.currentUser?.tenantId || null,
      providerInfo: currentAuth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Rule Violation or Storage Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Ensure database connection check
if (realDb) {
  const testConnection = async () => {
    try {
      await getDocFromServer(doc(realDb, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('client is offline')) {
        console.error("Please verify your physical Firestore connection.");
      }
    }
  };
  testConnection();
}

// --- SANDBOX SIMULATED ENGINES ---
// Persists sandbox data locally to ensure the user gets a seamless ordering experience.
const getStoredSandboxOrders = (): Order[] => {
  const stored = localStorage.getItem('laziz_sandbox_orders');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  }
  return [];
};

const setStoredSandboxOrders = (orders: Order[]) => {
  localStorage.setItem('laziz_sandbox_orders', JSON.stringify(orders));
};

// Simulate Auth State for Sandboxed development
interface SandboxUser {
  uid: string;
  email?: string;
  displayName?: string;
  phoneNumber?: string;
  emailVerified: boolean;
}

const getStoredSandboxAuth = (): SandboxUser | null => {
  const stored = localStorage.getItem('laziz_sandbox_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return null;
    }
  }
  return null;
};

// Simple mock account store for Email/Password sandbox simulating signup & signin
interface SandboxAccount {
  uid: string;
  email: string;
  password?: string;
  displayName: string;
  phoneNumber?: string;
  emailVerified?: boolean;
}

const getStoredSandboxAccounts = (): SandboxAccount[] => {
  const stored = localStorage.getItem('laziz_sandbox_accounts');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const adminAcc = parsed.find(acc => acc.email.toLowerCase() === 'lazizchickencorners@gmail.com');
        if (adminAcc) {
          adminAcc.password = 'lazizchicken';
          adminAcc.displayName = 'Laziz Corner Owner';
          adminAcc.emailVerified = true;
          localStorage.setItem('laziz_sandbox_accounts', JSON.stringify(parsed));
          return parsed;
        } else {
          // Official admin doesn't exist yet, insert it
          const defaultAdmin: SandboxAccount = {
            uid: 'sandbox_admin_default',
            email: 'lazizchickencorners@gmail.com',
            password: 'lazizchicken',
            displayName: 'Laziz Corner Owner',
            emailVerified: true
          };
          parsed.push(defaultAdmin);
          localStorage.setItem('laziz_sandbox_accounts', JSON.stringify(parsed));
          return parsed;
        }
      }
    } catch (e) {
      // fallback
    }
  }
  
  const defaultAdmin: SandboxAccount = {
    uid: 'sandbox_admin_default',
    email: 'lazizchickencorners@gmail.com',
    password: 'lazizchicken',
    displayName: 'Laziz Corner Owner',
    emailVerified: true
  };
  localStorage.setItem('laziz_sandbox_accounts', JSON.stringify([defaultAdmin]));
  return [defaultAdmin];
};

const saveStoredSandboxAccount = (account: SandboxAccount) => {
  const accounts = getStoredSandboxAccounts();
  accounts.push(account);
  localStorage.setItem('laziz_sandbox_accounts', JSON.stringify(accounts));
};

// Register simple whitelisted default admins
const ADMIN_EMAILS = [
  'lazizchickencorners@gmail.com',
  'admin@laziz.com',
  'owner@laziz.com'
];

// --- ADAPTER EXPORTS ---
export const db = realDb;
export const auth = realAuth;

export const authActions = {
  // Signs in with Google
  async loginWithGoogle(
    onSuccess: (user: any) => void, 
    onError: (err: any) => void,
    forceAdmin: boolean = false
  ) {
    if (realAuth && !isFirebaseSandbox) {
      try {
        const provider = new GoogleAuthProvider();
        const res = await signInWithPopup(realAuth, provider);
        onSuccess(res.user);
      } catch (err: any) {
        const code = err?.code || '';
        if (code === 'auth/network-request-failed' || err?.message?.toLowerCase().includes('network') || err?.message?.toLowerCase().includes('block')) {
          console.warn("Firebase authentication blocked or unreachable, fallback to simulation mode.");
          localStorage.setItem('laziz_force_sandbox', 'true');
          const mockMail = forceAdmin ? 'lazizchickencorners@gmail.com' : 'customer@gmail.com';
          const mockUser: SandboxUser = {
            uid: forceAdmin ? 'sandbox_admin_uid' : 'sandbox_user_123',
            email: mockMail,
            displayName: forceAdmin ? 'Laziz Admin' : 'Valued Customer',
            emailVerified: true
          };
          localStorage.setItem('laziz_sandbox_user', JSON.stringify(mockUser));
          onSuccess(mockUser);
          setTimeout(() => {
            window.location.reload();
          }, 300);
          return;
        }
        onError(err);
      }
    } else {
      // Simulate OAuth Login in sandbox using standard window-popup mock
      const mockMail = forceAdmin ? 'lazizchickencorners@gmail.com' : 'customer@gmail.com';
      const mockUser: SandboxUser = {
        uid: forceAdmin ? 'sandbox_admin_uid' : 'sandbox_user_123',
        email: mockMail,
        displayName: forceAdmin ? 'Laziz Admin' : 'Valued Customer',
        emailVerified: true
      };
      localStorage.setItem('laziz_sandbox_user', JSON.stringify(mockUser));
      setTimeout(() => {
        onSuccess(mockUser);
      }, 500);
    }
  },

  // Signs in with Email/Password
  async loginWithEmail(
    email: string,
    password: string,
    onSuccess: (user: any) => void,
    onError: (err: any) => void
  ) {
    const isDefaultAdmin = email.toLowerCase() === 'lazizchickencorners@gmail.com';

    if (realAuth && !isFirebaseSandbox) {
      try {
        const result = await signInWithEmailAndPassword(realAuth, email, password);
        const user = result.user;
        onSuccess(user);
      } catch (err: any) {
        const code = err?.code || '';
        
        // Auto-heal by creating admin account in physical firebase project if missing
        if (isDefaultAdmin && (code === 'auth/user-not-found' || code === 'auth/invalid-credential')) {
          if (password.length >= 6) {
            try {
              console.log("Admin email recognized but not registered yet. Auto-generating secure credential on connected Firebase...");
              const signUpResult = await createUserWithEmailAndPassword(realAuth, email, password);
              const userObj = signUpResult.user;
              try {
                await updateProfile(userObj, { displayName: 'Laziz Corner Owner' });
              } catch (profileErr) {
                console.warn("Could not update displayName for auto-created admin:", profileErr);
              }
              onSuccess(userObj);
              return;
            } catch (signUpErr: any) {
              const signUpCode = signUpErr?.code || '';
              if (signUpCode === 'auth/email-already-in-use') {
                onError({ code: 'auth/wrong-password', message: 'Email or password is incorrect' });
                return;
              }
            }
          }
        }

        if (code === 'auth/network-request-failed' || err?.message?.toLowerCase().includes('network') || err?.message?.toLowerCase().includes('block') || err?.message?.toLowerCase().includes('unreachable')) {
          console.warn("Firebase authentication failed on connection. Self-healing to Offline Simulation Mode.");
          localStorage.setItem('laziz_force_sandbox', 'true');
          
          const accounts = getStoredSandboxAccounts();
          const match = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
          if (match) {
            if (match.password === password) {
              const sandboxUser: SandboxUser = {
                uid: match.uid,
                email: match.email,
                displayName: match.displayName,
                emailVerified: true
              };
              localStorage.setItem('laziz_sandbox_user', JSON.stringify(sandboxUser));
              window.dispatchEvent(new Event('sandbox-auth-change'));
              onSuccess(sandboxUser);
              setTimeout(() => {
                window.location.reload();
              }, 300);
              return;
            } else {
              onError({ code: 'auth/wrong-password', message: 'Email or password is incorrect' });
              return;
            }
          } else {
            onError({ code: 'auth/user-not-found', message: 'Email or password is incorrect' });
            return;
          }
        }
        
        // Map any credential issue to "Email or password is incorrect"
        if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/invalid-email') {
          onError({ code, message: 'Email or password is incorrect' });
        } else {
          onError(err);
        }
      }
    } else {
      const accounts = getStoredSandboxAccounts();
      const match = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
      if (match) {
        if (match.password === password) {
          if (match.emailVerified === false) {
            setTimeout(() => {
              onError({ code: 'auth/unverified-email', message: 'verification-pending', email: match.email });
            }, 500);
          } else {
            const user: SandboxUser = {
              uid: match.uid,
              email: match.email,
              displayName: match.displayName,
              emailVerified: true
            };
            localStorage.setItem('laziz_sandbox_user', JSON.stringify(user));
            // Trigger customized event for immediate sync
            window.dispatchEvent(new Event('sandbox-auth-change'));
            setTimeout(() => onSuccess(user), 500);
          }
        } else {
          setTimeout(() => onError({ code: 'auth/wrong-password', message: 'Email or password is incorrect' }), 500);
        }
      } else {
        setTimeout(() => onError({ code: 'auth/user-not-found', message: 'Email or password is incorrect' }), 500);
      }
    }
  },

  // Register user with Email/Password
  async signUpWithEmail(
    email: string,
    password: string,
    displayName: string,
    onSuccess: (user: any) => void,
    onError: (err: any) => void,
    phoneNumber?: string
  ) {
    if (realAuth && !isFirebaseSandbox) {
      try {
        const result = await createUserWithEmailAndPassword(realAuth, email, password);
        const user = result.user;
        if (displayName) {
          try {
            await updateProfile(user, { displayName });
          } catch (profileErr) {
            console.warn("Could not update displayName profile:", profileErr);
          }
        }
        // Save phoneNumber temporarily or custom attribute if simulated
        const augmentedUser = {
          ...user,
          phoneNumber: phoneNumber || user.phoneNumber || undefined,
          displayName: displayName || user.displayName || undefined
        };
        onSuccess(augmentedUser);
      } catch (err: any) {
        const code = err?.code || '';
        if (code === 'auth/network-request-failed' || err?.message?.toLowerCase().includes('network') || err?.message?.toLowerCase().includes('block') || err?.message?.toLowerCase().includes('unreachable')) {
          console.warn("Firebase authentication failure. Fast switching to local simulated accounts.");
          localStorage.setItem('laziz_force_sandbox', 'true');
          
          const accounts = getStoredSandboxAccounts();
          const exists = accounts.some(a => a.email.toLowerCase() === email.toLowerCase());
          if (exists) {
            onError({ code: 'auth/email-already-in-use', message: 'User already exists. Please sign in' });
          } else {
            const newUid = 'sandbox_user_' + Math.floor(Math.random() * 100000);
            const newAccount: SandboxAccount = {
              uid: newUid,
              email,
              password,
              displayName,
              phoneNumber,
              emailVerified: true
            };
            saveStoredSandboxAccount(newAccount);
            
            const userObj: SandboxUser = {
              uid: newUid,
              email: newAccount.email,
              displayName: newAccount.displayName,
              phoneNumber: newAccount.phoneNumber,
              emailVerified: true
            };
            localStorage.setItem('laziz_sandbox_user', JSON.stringify(userObj));
            window.dispatchEvent(new Event('sandbox-auth-change'));
            onSuccess(userObj);
            setTimeout(() => {
              window.location.reload();
            }, 300);
          }
          return;
        }
        if (code === 'auth/email-already-in-use') {
          onError({ code, message: 'User already exists. Please sign in' });
        } else {
          onError(err);
        }
      }
    } else {
      const accounts = getStoredSandboxAccounts();
      const exists = accounts.some(a => a.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        setTimeout(() => onError({ code: 'auth/email-already-in-use', message: 'User already exists. Please sign in' }), 500);
      } else {
        const newUid = 'sandbox_user_' + Math.floor(Math.random() * 100000);
        const newAccount: SandboxAccount = {
          uid: newUid,
          email,
          password,
          displayName,
          phoneNumber,
          emailVerified: true // auto verified
        };
        saveStoredSandboxAccount(newAccount);
        
        const user: SandboxUser = {
          uid: newUid,
          email: newAccount.email,
          displayName: newAccount.displayName,
          phoneNumber: newAccount.phoneNumber,
          emailVerified: true
        };
        localStorage.setItem('laziz_sandbox_user', JSON.stringify(user));
        window.dispatchEvent(new Event('sandbox-auth-change'));
        setTimeout(() => onSuccess(user), 500);
      }
    }
  },

  // Simulate verifying a sandbox email
  simulateVerifySandboxEmail(email: string) {
    const accounts = getStoredSandboxAccounts();
    const index = accounts.findIndex(a => a.email.toLowerCase() === email.toLowerCase());
    if (index !== -1) {
      accounts[index].emailVerified = true;
      localStorage.setItem('laziz_sandbox_accounts', JSON.stringify(accounts));
      // Dispatch event to refresh auth listening state if needed
      window.dispatchEvent(new Event('sandbox-auth-change'));
    }
  },

  // Recaptcha + SMS Sending
  async sendSmsCode(
    phoneNumber: string,
    containerId: string,
    onSuccess: (confirmationResult: any) => void,
    onError: (err: any) => void
  ) {
    if (realAuth && !isFirebaseSandbox) {
      try {
        const container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = ''; // Clear container to avoid re-render errors
        }
        const appVerifier = new RecaptchaVerifier(realAuth, containerId, {
          size: 'invisible',
          callback: () => {}
        });
        const confirmationResult = await signInWithPhoneNumber(realAuth, phoneNumber, appVerifier);
        onSuccess(confirmationResult);
      } catch (err) {
        onError(err);
      }
    } else {
      // Simulation of SMS
      const mockResult = {
        confirm: async (code: string) => {
          if (code === '123456' || code === '000000' || code.length === 6) {
            const phoneUser: SandboxUser = {
              uid: 'sandbox_phone_' + Math.floor(Math.random() * 100000),
              phoneNumber,
              displayName: phoneNumber,
              emailVerified: true
            };
            localStorage.setItem('laziz_sandbox_user', JSON.stringify(phoneUser));
            return { user: phoneUser };
          } else {
            throw { code: 'auth/invalid-verification-code', message: 'Incorrect 6-digit verification code.' };
          }
        }
      };
      setTimeout(() => onSuccess(mockResult), 600);
    }
  },

  async logout(onSuccess: () => void) {
    if (realAuth && !isFirebaseSandbox) {
      await signOut(realAuth);
      onSuccess();
    } else {
      localStorage.removeItem('laziz_sandbox_user');
      onSuccess();
    }
  },

  subscribeToAuth(callback: (user: any | null) => void) {
    if (realAuth && !isFirebaseSandbox) {
      return onAuthStateChanged(realAuth, callback);
    } else {
      // Initial trigger
      const u = getStoredSandboxAuth();
      callback(u);

      // Simple emitter for responsive logins
      const handler = () => {
        callback(getStoredSandboxAuth());
      };
      window.addEventListener('sandbox-auth-change', handler);
      return () => {
        window.removeEventListener('sandbox-auth-change', handler);
      };
    }
  }
};

// Listeners for checkout flow and dashboard updates
export const dbService = {
  // Places a customer order
  async placeOrder(order: Omit<Order, 'createdAt' | 'updatedAt'>): Promise<string> {
    const timestamp = new Date().toISOString();
    const preparedOrder = {
      ...order,
      createdAt: isFirebaseSandbox ? timestamp : serverTimestamp(),
      updatedAt: isFirebaseSandbox ? timestamp : serverTimestamp()
    };

    if (!isFirebaseSandbox) {
      const path = 'orders';
      try {
        const docRef = await addDoc(collection(realDb, path), preparedOrder);
        window.dispatchEvent(new CustomEvent('orders-db-change'));
        return docRef.id;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
        return '';
      }
    } else {
      // Sandbox Store
      const orders = getStoredSandboxOrders();
      const generatedId = 'order_' + Math.floor(Math.random() * 100000);
      const newOrder: Order = {
        ...preparedOrder,
        id: generatedId
      };
      orders.unshift(newOrder);
      setStoredSandboxOrders(orders);
      window.dispatchEvent(new CustomEvent('sandbox-orders-update'));
      return generatedId;
    }
  },

  // Updates order status (Admin operation)
  async updateOrderStatus(orderId: string, status: OrderStatus, extraFields?: Record<string, any>): Promise<void> {
    if (!isFirebaseSandbox) {
      const path = `orders/${orderId}`;
      try {
        const docRef = doc(realDb, 'orders', orderId);
        await updateDoc(docRef, { 
          orderStatus: status,
          updatedAt: serverTimestamp(),
          ...extraFields
        });
        window.dispatchEvent(new CustomEvent('orders-db-change'));
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } else {
      // Sandbox Edit
      const orders = getStoredSandboxOrders();
      const index = orders.findIndex(o => o.id === orderId);
      if (index !== -1) {
        orders[index].orderStatus = status;
        orders[index].updatedAt = new Date().toISOString();
        if (extraFields) {
          Object.assign(orders[index], extraFields);
        }
        setStoredSandboxOrders(orders);
        window.dispatchEvent(new CustomEvent('sandbox-orders-update'));
      }
    }
  },

  // Deletes an order
  async deleteOrder(orderId: string): Promise<void> {
    if (!isFirebaseSandbox) {
      const path = `orders/${orderId}`;
      try {
        await deleteDoc(doc(realDb, 'orders', orderId));
        window.dispatchEvent(new CustomEvent('orders-db-change'));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      // Sandbox Delete
      const orders = getStoredSandboxOrders();
      const filtered = orders.filter(o => o.id !== orderId);
      setStoredSandboxOrders(filtered);
      window.dispatchEvent(new CustomEvent('sandbox-orders-update'));
    }
  },

  // Subscribe to user specific orders or all orders (if admin)
  subscribeOrders(userId: string | null, isAdminUser: boolean, callback: (orders: Order[]) => void) {
    let lastDataHash = '';
    
    // Helper to prevent redundant UI state triggers while evaluating actual data changes
    const safeCallback = (orderList: Order[]) => {
      const currentHash = JSON.stringify(orderList.map(o => ({
        id: o.id,
        status: o.orderStatus,
        updated: o.updatedAt,
        prep: o.estimatedPrepTime
      })));
      if (currentHash !== lastDataHash) {
        lastDataHash = currentHash;
        callback(orderList);
      }
    };

    if (!isFirebaseSandbox) {
      const ordersRef = collection(realDb, 'orders');
      let q;
      
      if (isAdminUser) {
        // Admins see all orders sorted by creation time
        q = query(ordersRef, orderBy('createdAt', 'desc'));
      } else if (userId) {
        // Normal users only see their own orders
        q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
      } else {
        safeCallback([]);
        return () => {};
      }

            // 1. Setup real-time event socket listener
      let unsubscribeSnapshot: () => void = () => {};
      try {
        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const orderList: Order[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as any;
            orderList.push({
              id: d.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
            } as Order);
          });
          safeCallback(orderList);
        }, (err) => {
          console.warn('Real-time push listener experienced a temporary socket drop in iframe sandbox container:', err);
        });
      } catch (e) {
        console.error('Failed to attach physical onSnapshot stream listener:', e);
      }

      // 2. Setup active background automatic polling (every 4 seconds) to guarantee updates
      // without needing page reloads even if the sandbox / iframe restricts socket connections.
      const fetchDataManual = async () => {
        try {
          const snapshot = await getDocs(q);
          const orderList: Order[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as any;
            orderList.push({
              id: d.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
            } as Order);
          });
          safeCallback(orderList);
        } catch (err) {
          console.warn('Quiet background fallback query update omitted:', err);
        }
      };

      const pollInterval = setInterval(fetchDataManual, 4000);

      // Listen for window-level database events from local trigger endpoints to speed up updates
      const handleLocalUpdate = () => {
        fetchDataManual();
      };
      window.addEventListener('orders-db-change', handleLocalUpdate);

      return () => {
        unsubscribeSnapshot();
        clearInterval(pollInterval);
        window.removeEventListener('orders-db-change', handleLocalUpdate);
      };
    } else {
      // Sandbox real-time local persistence updates
      const runFilter = () => {
        const allOrders = getStoredSandboxOrders();
        if (isAdminUser) {
          safeCallback(allOrders);
        } else if (userId) {
          safeCallback(allOrders.filter(o => o.userId === userId));
        } else {
          safeCallback([]);
        }
      };

      runFilter();
      const handler = () => {
        runFilter();
      };
      window.addEventListener('sandbox-orders-update', handler);

      // Periodic check inside sandbox for multi-window synchronization
      const sandboxInterval = setInterval(runFilter, 4000);

      return () => {
        window.removeEventListener('sandbox-orders-update', handler);
        clearInterval(sandboxInterval);
      };
    }
  },

  // Check if an email is an admin
  isAdminEmail(email: string | null): boolean {
    if (!email) return false;
    const lowerEmail = email.toLowerCase();
    return lowerEmail === 'lazizchickencorners@gmail.com';
  },

  // Subscribe to menu items availability overrides
  subscribeMenuItems(callback: (availabilityMap: Record<string, boolean>) => void): () => void {
    if (!isFirebaseSandbox) {
      const collectionRef = collection(realDb, 'menuItems');
      
      const processSnapshot = (snapshot: any) => {
        const result: Record<string, boolean> = {};
        snapshot.forEach((d: any) => {
          const data = d.data();
          if (typeof data.isAvailable === 'boolean') {
            result[d.id] = data.isAvailable;
          }
        });
        callback(result);
      };

      // 1. Snapshot dynamic syncing
      let unsubscribeSnapshot: () => void = () => {};
      try {
        unsubscribeSnapshot = onSnapshot(collectionRef, (snapshot) => {
          processSnapshot(snapshot);
        }, (err) => {
          console.warn('Silent menu items collection fetch error:', err);
        });
      } catch (e) {
        console.error('Failed to attach menuItems onSnapshot listener:', e);
      }

      // 2. Active background fallback polling (every 6 seconds)
      const fetchManual = async () => {
        try {
          const snapshot = await getDocs(collectionRef);
          processSnapshot(snapshot);
        } catch (e) {
          console.warn('Quiet menu items background query omitted:', e);
        }
      };

      const pollInterval = setInterval(fetchManual, 6000);

      const handleLocalMenuChange = () => {
        fetchManual();
      };
      window.addEventListener('menu-db-change', handleLocalMenuChange);

      return () => {
        unsubscribeSnapshot();
        clearInterval(pollInterval);
        window.removeEventListener('menu-db-change', handleLocalMenuChange);
      };
    } else {
      // Sandbox Mode Menu Item updates
      const runGet = () => {
        const stored = localStorage.getItem('laziz_sandbox_menu_availability');
        if (stored) {
          try {
            callback(JSON.parse(stored));
          } catch (e) {
            callback({});
          }
        } else {
          callback({});
        }
      };

      runGet();

      const handler = () => {
        runGet();
      };
      window.addEventListener('sandbox-menu-update', handler);

      const interval = setInterval(runGet, 4000);

      return () => {
        window.removeEventListener('sandbox-menu-update', handler);
        clearInterval(interval);
      };
    }
  },

  // Update a single menu item availability
  async updateMenuItemAvailability(item: any, isAvailable: boolean): Promise<void> {
    if (!isFirebaseSandbox) {
      const path = `menuItems/${item.id}`;
      try {
        const docRef = doc(realDb, 'menuItems', item.id);
        const payload = {
          name: item.name,
          price: Number(item.price),
          category: item.category,
          description: item.description,
          image: item.image,
          isAvailable: Boolean(isAvailable),
          isFeatured: typeof item.isFeatured === 'boolean' ? item.isFeatured : false
        };
        await setDoc(docRef, payload);
        window.dispatchEvent(new CustomEvent('menu-db-change'));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      // Sandbox update overrides
      const stored = localStorage.getItem('laziz_sandbox_menu_availability');
      let currentMap: Record<string, boolean> = {};
      if (stored) {
        try {
          currentMap = JSON.parse(stored);
        } catch (e) {
          currentMap = {};
        }
      }
      currentMap[item.id] = isAvailable;
      localStorage.setItem('laziz_sandbox_menu_availability', JSON.stringify(currentMap));
      window.dispatchEvent(new CustomEvent('sandbox-menu-update'));
    }
  },

  // Ensure user profile document exists in Firestore or local storage simulation
  async ensureUserProfile(uid: string, email: string, displayName?: string | null): Promise<void> {
    if (!isFirebaseSandbox) {
      const path = `users/${uid}`;
      try {
        const docRef = doc(realDb, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          // Determine registration date anchor
          await setDoc(docRef, {
            email,
            displayName: displayName || email.split('@')[0],
            createdAt: serverTimestamp()
          });
          window.dispatchEvent(new CustomEvent('users-db-change'));
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      // Sandbox User Profile Insertion
      const stored = localStorage.getItem('laziz_sandbox_users');
      let usersList: any[] = [];
      if (stored) {
        try {
          usersList = JSON.parse(stored);
        } catch (e) {
          usersList = [];
        }
      }
      
      const exists = usersList.find((u: any) => u.uid === uid);
      if (!exists) {
        usersList.push({
          uid,
          email,
          displayName: displayName || email.split('@')[0],
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('laziz_sandbox_users', JSON.stringify(usersList));
        window.dispatchEvent(new CustomEvent('sandbox-users-update'));
      }
    }
  },

  // Upload user file tracking metadata
  async uploadUserFile(userId: string, fileName: string, fileSize: number, fileType: string, fileUrl: string): Promise<void> {
    if (!isFirebaseSandbox) {
      const path = `files`;
      try {
        await addDoc(collection(realDb, 'files'), {
          userId,
          fileName,
          fileSize,
          fileType,
          fileUrl,
          uploadedAt: serverTimestamp()
        });
        window.dispatchEvent(new CustomEvent('files-db-change'));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      // Sandbox File Upload Simulation
      const stored = localStorage.getItem('laziz_sandbox_files');
      let filesList: any[] = [];
      if (stored) {
        try {
          filesList = JSON.parse(stored);
        } catch (e) {
          filesList = [];
        }
      }

      filesList.push({
        id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        userId,
        fileName,
        fileSize,
        fileType,
        fileUrl,
        uploadedAt: new Date().toISOString()
      });
      localStorage.setItem('laziz_sandbox_files', JSON.stringify(filesList));
      window.dispatchEvent(new CustomEvent('sandbox-files-update'));
    }
  },

  // Delete an uploaded file
  async deleteUserFile(fileId: string): Promise<void> {
    if (!isFirebaseSandbox) {
      const path = `files/${fileId}`;
      try {
        const docRef = doc(realDb, 'files', fileId);
        await deleteDoc(docRef);
        window.dispatchEvent(new CustomEvent('files-db-change'));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      // Sandbox File Delete Simulation
      const stored = localStorage.getItem('laziz_sandbox_files');
      let filesList: any[] = [];
      if (stored) {
        try {
          filesList = JSON.parse(stored);
        } catch (e) {
          filesList = [];
        }
      }

      const updated = filesList.filter((f: any) => f.id !== fileId);
      localStorage.setItem('laziz_sandbox_files', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('sandbox-files-update'));
    }
  },

  // Subscribe to files owned by a specific user
  subscribeUserFiles(userId: string, callback: (files: any[]) => void): () => void {
    if (!isFirebaseSandbox) {
      const q = query(
        collection(realDb, 'files'),
        where('userId', '==', userId)
      );
      return onSnapshot(q, (snapshot) => {
        const files = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          let uploadedAtDateStr = new Date().toISOString();
          if (data.uploadedAt) {
            try {
              uploadedAtDateStr = data.uploadedAt.toDate ? data.uploadedAt.toDate().toISOString() : data.uploadedAt;
            } catch (e) {}
          }
          return {
            id: docSnap.id,
            ...data,
            uploadedAt: uploadedAtDateStr
          };
        });
        callback(files);
      }, (error) => {
        console.error("Error subscribing to users files in Firestore:", error);
      });
    } else {
      const runGet = () => {
        const stored = localStorage.getItem('laziz_sandbox_files');
        if (stored) {
          try {
            const allFiles = JSON.parse(stored);
            callback(allFiles.filter((f: any) => f.userId === userId));
          } catch (e) {
            callback([]);
          }
        } else {
          callback([]);
        }
      };

      runGet();

      const handler = () => {
        runGet();
      };
      window.addEventListener('sandbox-files-update', handler);

      return () => {
        window.removeEventListener('sandbox-files-update', handler);
      };
    }
  },

  // Subscribe to all users (for Admin Dashboard)
  subscribeAllUsers(callback: (users: any[]) => void): () => void {
    if (!isFirebaseSandbox) {
      return onSnapshot(collection(realDb, 'users'), (snapshot) => {
        const users = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          let createdAtDateStr = new Date().toISOString();
          if (data.createdAt) {
            try {
              createdAtDateStr = data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt;
            } catch (e) {}
          }
          return {
            id: docSnap.id,
            ...data,
            createdAt: createdAtDateStr
          };
        });
        callback(users);
      }, (error) => {
        console.error("Error subscribing to all users in Firestore:", error);
      });
    } else {
      const runGet = () => {
        const stored = localStorage.getItem('laziz_sandbox_users');
        if (stored) {
          try {
            callback(JSON.parse(stored));
          } catch (e) {
            callback([]);
          }
        } else {
          callback([]);
        }
      };

      runGet();

      const handler = () => {
        runGet();
      };
      window.addEventListener('sandbox-users-update', handler);

      return () => {
        window.removeEventListener('sandbox-users-update', handler);
      };
    }
  },

  // Subscribe to all files (for Admin uploaded files count calculation)
  subscribeAllFiles(callback: (files: any[]) => void): () => void {
    if (!isFirebaseSandbox) {
      return onSnapshot(collection(realDb, 'files'), (snapshot) => {
        const files = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          let uploadedAtDateStr = new Date().toISOString();
          if (data.uploadedAt) {
            try {
              uploadedAtDateStr = data.uploadedAt.toDate ? data.uploadedAt.toDate().toISOString() : data.uploadedAt;
            } catch (e) {}
          }
          return {
            id: docSnap.id,
            ...data,
            uploadedAt: uploadedAtDateStr
          };
        });
        callback(files);
      }, (error) => {
        console.error("Error subscribing to all files in Firestore:", error);
      });
    } else {
      const runGet = () => {
        const stored = localStorage.getItem('laziz_sandbox_files');
        if (stored) {
          try {
            callback(JSON.parse(stored));
          } catch (e) {
            callback([]);
          }
        } else {
          callback([]);
        }
      };

      runGet();

      const handler = () => {
        runGet();
      };
      window.addEventListener('sandbox-files-update', handler);

      return () => {
        window.removeEventListener('sandbox-files-update', handler);
      };
    }
  }
};
