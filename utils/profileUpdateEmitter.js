// Simple event emitter for profile updates
class ProfileUpdateEmitter {
  constructor() {
    this.listeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  emit() {
    this.listeners.forEach(callback => callback());
  }
}

export const profileUpdateEmitter = new ProfileUpdateEmitter();
