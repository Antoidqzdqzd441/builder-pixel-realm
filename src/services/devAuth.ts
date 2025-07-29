import { UserRole } from '../hooks/useAuth';

// Development authentication system for when Firebase domains are not configured
export class DevAuth {
  private static instance: DevAuth;
  private currentUser: any = null;
  private currentUserRole: UserRole | null = null;
  private listeners: ((user: any) => void)[] = [];

  private constructor() {}

  public static getInstance(): DevAuth {
    if (!DevAuth.instance) {
      DevAuth.instance = new DevAuth();
    }
    return DevAuth.instance;
  }

  // Mock user creation for development
  private createMockUser(email: string, displayName: string, isGoogle = false) {
    return {
      uid: `dev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email,
      displayName,
      photoURL: isGoogle ? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff` : null,
      emailVerified: true,
      isAnonymous: false,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString()
      },
      providerData: isGoogle ? [{
        providerId: 'google.com',
        uid: email,
        displayName,
        email,
        photoURL: null
      }] : [{
        providerId: 'password',
        uid: email,
        displayName,
        email,
        photoURL: null
      }]
    };
  }

  private createMockUserRole(displayName: string): UserRole {
    return {
      role: 'member',
      points: 25,
      credits: 0,
      displayName,
      description: '',
      photoURL: '',
      createdAt: new Date()
    };
  }

  public async signInWithEmail(email: string, password: string) {
    // Simple validation for demo
    if (!email || !password || password.length < 6) {
      throw new Error('Email et mot de passe requis (minimum 6 caractères)');
    }

    const user = this.createMockUser(email, email.split('@')[0]);
    const userRole = this.createMockUserRole(user.displayName);

    this.currentUser = user;
    this.currentUserRole = userRole;

    // Notify listeners
    this.listeners.forEach(listener => listener(user));

    return { user };
  }

  public async signInWithGoogle() {
    // Create a mock Google user
    const googleUser = this.createMockUser(
      'demo@gmail.com', 
      'Utilisateur Demo', 
      true
    );
    const userRole = this.createMockUserRole(googleUser.displayName);

    this.currentUser = googleUser;
    this.currentUserRole = userRole;

    // Notify listeners
    this.listeners.forEach(listener => listener(googleUser));

    return { user: googleUser };
  }

  public async createUserWithEmail(email: string, password: string, displayName: string) {
    if (!email || !password || password.length < 6 || !displayName) {
      throw new Error('Tous les champs sont requis (mot de passe minimum 6 caractères)');
    }

    const user = this.createMockUser(email, displayName);
    const userRole = this.createMockUserRole(displayName);

    this.currentUser = user;
    this.currentUserRole = userRole;

    // Notify listeners
    this.listeners.forEach(listener => listener(user));

    return { user };
  }

  public async signOut() {
    this.currentUser = null;
    this.currentUserRole = null;

    // Notify listeners
    this.listeners.forEach(listener => listener(null));
  }

  public getCurrentUser() {
    return this.currentUser;
  }

  public getCurrentUserRole() {
    return this.currentUserRole;
  }

  public onAuthStateChanged(callback: (user: any) => void) {
    this.listeners.push(callback);
    
    // Immediately call with current user
    callback(this.currentUser);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }
}

export const devAuth = DevAuth.getInstance();
