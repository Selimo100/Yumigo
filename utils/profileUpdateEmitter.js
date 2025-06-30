// Simple event emitter for profile updates
class ProfileUpdateEmitter {
  constructor() {
    this.listeners = [];
    this.followListeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  subscribeToFollowChanges(callback) {
    this.followListeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.followListeners = this.followListeners.filter(listener => listener !== callback);
    };
  }

  emit() {
    this.listeners.forEach(callback => callback());
  }

  emitFollowChange(userId, isFollowing) {
    this.followListeners.forEach(callback => callback(userId, isFollowing));
    // Also emit general profile update
    this.emit();
  }
}

export const profileUpdateEmitter = new ProfileUpdateEmitter();
