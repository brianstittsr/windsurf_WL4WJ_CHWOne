// Use dynamic imports to make Cognito optional
// This prevents build errors when the package is not installed
let CognitoUserPool: any;
let CognitoUser: any;
let AuthenticationDetails: any;
let CognitoUserAttribute: any;

// Flag to track if Cognito is available
let _isCognitoAvailable = false;

// Function to check if Cognito is available
export const checkCognitoAvailability = async (): Promise<boolean> => {
  try {
    await loadCognito();
    return _isCognitoAvailable;
  } catch (error) {
    console.warn('Error checking Cognito availability:', error);
    return false;
  }
};

// Try to load Cognito dynamically
const loadCognito = async () => {
  try {
    const cognito = await import('amazon-cognito-identity-js');
    CognitoUserPool = cognito.CognitoUserPool;
    CognitoUser = cognito.CognitoUser;
    AuthenticationDetails = cognito.AuthenticationDetails;
    CognitoUserAttribute = cognito.CognitoUserAttribute;
    _isCognitoAvailable = true;
    return true;
  } catch (error) {
    console.warn('Amazon Cognito Identity JS not available:', error);
    _isCognitoAvailable = false;
    return false;
  }
};

export interface CognitoUser {
  username: string;
  email: string;
  emailVerified: boolean;
  givenName?: string;
  familyName?: string;
  phoneNumber?: string;
  customAttributes?: Record<string, any>;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: CognitoUser | null;
  loading: boolean;
  error: string | null;
}

class CognitoAuthService {
  private userPool: any;
  private currentUser: CognitoUser | null = null;
  private isAvailable = false;

  constructor() {
    // We'll initialize the user pool asynchronously when needed
    this.init();
  }

  private async init() {
    // Try to load Cognito
    this.isAvailable = await loadCognito();
    
    if (this.isAvailable) {
      // Get Cognito credentials from environment variables
      const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID || '';
      const clientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || '';
      
      // Check if both required credentials are available
      if (userPoolId && clientId) {
        // Initialize Cognito User Pool
        const poolData = {
          UserPoolId: userPoolId,
          ClientId: clientId
        };

        try {
          this.userPool = new CognitoUserPool(poolData);
        } catch (error) {
          console.error('Failed to initialize Cognito User Pool:', error);
          this.isAvailable = false;
        }
      } else {
        // Mark Cognito as unavailable if credentials are missing
        console.warn('Cognito credentials missing. UserPoolId and ClientId are required.');
        this.isAvailable = false;
      }
    }
  }

  // Helper to check if Cognito is available
  private checkAvailability(): boolean {
    if (!this.isAvailable || !_isCognitoAvailable) {
      console.warn('Cognito authentication is not available');
      return false;
    }
    return true;
  }

  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, attributes: Record<string, string> = {}): Promise<any> {
    // Make sure Cognito is available
    if (!this.checkAvailability()) {
      return Promise.reject(new Error('Cognito authentication is not available'));
    }
    
    // Wait for initialization if needed
    if (!this.userPool) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const attributeList: any[] = [];

      // Add email attribute
      const emailAttribute = new CognitoUserAttribute({
        Name: 'email',
        Value: email
      });
      attributeList.push(emailAttribute);

      // Add custom attributes
      Object.entries(attributes).forEach(([key, value]) => {
        const attr = new CognitoUserAttribute({
          Name: key.startsWith('custom:') ? key : `custom:${key}`,
          Value: value
        });
        attributeList.push(attr);
      });

      this.userPool.signUp(email, password, attributeList, [], (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Confirm user account with verification code
   */
  async confirmSignUp(email: string, code: string): Promise<any> {
    // Make sure Cognito is available
    if (!this.checkAvailability()) {
      return Promise.reject(new Error('Cognito authentication is not available'));
    }
    
    // Wait for initialization if needed
    if (!this.userPool) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const userData = {
        Username: email,
        Pool: this.userPool
      };

      const cognitoUser = new CognitoUser(userData);
      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Sign in user
   */
  async signIn(email: string, password: string): Promise<CognitoUser> {
    // Make sure Cognito is available
    if (!this.checkAvailability()) {
      return Promise.reject(new Error('Cognito authentication is not available'));
    }
    
    // Wait for initialization if needed
    if (!this.userPool) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const authenticationData = {
        Username: email,
        Password: password
      };
      const authenticationDetails = new AuthenticationDetails(authenticationData);

      const userData = {
        Username: email,
        Pool: this.userPool
      };
      const cognitoUser = new CognitoUser(userData);

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          // Get user attributes
          cognitoUser.getUserAttributes((err, attributes) => {
            if (err) {
              reject(err);
              return;
            }

            const user = this.parseUserAttributes(attributes || []);
            this.currentUser = user;
            resolve(user);
          });
        },
        onFailure: (err) => {
          reject(err);
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          // Handle new password required (admin created user)
          reject(new Error('New password required'));
        }
      });
    });
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    // Make sure Cognito is available
    if (!this.checkAvailability()) {
      return Promise.resolve(); // Just resolve if Cognito is not available
    }
    
    // Wait for initialization if needed
    if (!this.userPool) {
      await this.init();
    }

    return new Promise((resolve) => {
      if (this.currentUser) {
        const userData = {
          Username: this.currentUser.username,
          Pool: this.userPool
        };
        const cognitoUser = new CognitoUser(userData);
        cognitoUser.signOut();
        this.currentUser = null;
      }
      resolve();
    });
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<CognitoUser | null> {
    // Make sure Cognito is available
    if (!this.checkAvailability()) {
      return Promise.resolve(null); // Return null if Cognito is not available
    }
    
    // Wait for initialization if needed
    if (!this.userPool) {
      await this.init();
      // If still not available after init, return null
      if (!this.isAvailable) {
        return null;
      }
    }

    return new Promise((resolve) => {
      const cognitoUser = this.userPool.getCurrentUser();

      if (!cognitoUser) {
        this.currentUser = null;
        resolve(null);
        return;
      }

      cognitoUser.getSession((err: any, session: any) => {
        if (err || !session.isValid()) {
          this.currentUser = null;
          resolve(null);
          return;
        }

        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            this.currentUser = null;
            resolve(null);
            return;
          }

          const user = this.parseUserAttributes(attributes || []);
          this.currentUser = user;
          resolve(user);
        });
      });
    });
  }

  /**
   * Reset password
   */
  async forgotPassword(email: string): Promise<void> {
    // Make sure Cognito is available
    if (!this.checkAvailability()) {
      return Promise.reject(new Error('Cognito authentication is not available'));
    }
    
    // Wait for initialization if needed
    if (!this.userPool) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const userData = {
        Username: email,
        Pool: this.userPool
      };
      const cognitoUser = new CognitoUser(userData);

      cognitoUser.forgotPassword({
        onSuccess: () => {
          resolve();
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  }

  /**
   * Confirm new password after forgot password
   */
  async confirmPassword(email: string, code: string, newPassword: string): Promise<void> {
    // Make sure Cognito is available
    if (!this.checkAvailability()) {
      return Promise.reject(new Error('Cognito authentication is not available'));
    }
    
    // Wait for initialization if needed
    if (!this.userPool) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const userData = {
        Username: email,
        Pool: this.userPool
      };
      const cognitoUser = new CognitoUser(userData);

      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => {
          resolve();
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  }

  /**
   * Update user attributes
   */
  async updateUserAttributes(attributes: Record<string, string>): Promise<void> {
    // Make sure Cognito is available
    if (!this.checkAvailability()) {
      return Promise.reject(new Error('Cognito authentication is not available'));
    }
    
    // Wait for initialization if needed
    if (!this.userPool) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.currentUser) {
        reject(new Error('No authenticated user'));
        return;
      }

      const userData = {
        Username: this.currentUser.username,
        Pool: this.userPool
      };
      const cognitoUser = new CognitoUser(userData);

      const attributeList = Object.entries(attributes).map(([key, value]) => {
        return new CognitoUserAttribute({
          Name: key.startsWith('custom:') ? key : `custom:${key}`,
          Value: value
        });
      });

      cognitoUser.updateAttributes(attributeList, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Parse Cognito user attributes into user object
   */
  private parseUserAttributes(attributes: any[]): CognitoUser {
    const user: CognitoUser = {
      username: '',
      email: '',
      emailVerified: false,
      customAttributes: {}
    };

    attributes.forEach(attr => {
      const { Name, Value } = attr;
      switch (Name) {
        case 'sub':
          user.username = Value;
          break;
        case 'email':
          user.email = Value;
          break;
        case 'email_verified':
          user.emailVerified = Value === 'true';
          break;
        case 'given_name':
          user.givenName = Value;
          break;
        case 'family_name':
          user.familyName = Value;
          break;
        case 'phone_number':
          user.phoneNumber = Value;
          break;
        default:
          if (Name.startsWith('custom:')) {
            user.customAttributes![Name.substring(7)] = Value;
          }
          break;
      }
    });

    return user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    // If Cognito is not available, always return false
    if (!this.isAvailable) {
      return false;
    }
    return this.currentUser !== null;
  }

  /**
   * Get current user
   */
  getUser(): CognitoUser | null {
    return this.currentUser;
  }

  /**
   * Resend confirmation code
   */
  async resendConfirmationCode(email: string): Promise<void> {
    // Make sure Cognito is available
    if (!this.checkAvailability()) {
      return Promise.reject(new Error('Cognito authentication is not available'));
    }
    
    // Wait for initialization if needed
    if (!this.userPool) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const userData = {
        Username: email,
        Pool: this.userPool
      };
      const cognitoUser = new CognitoUser(userData);

      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

// Create the service instance but don't force initialization until needed
export const cognitoAuth = new CognitoAuthService();

// checkCognitoAvailability is already exported at the top of the file
