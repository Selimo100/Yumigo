class ProfileUpdateEmitter {
    constructor() {
        this.listeners = [];
        this.followListeners = [];
    }

    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(listener => listener !== callback);
        };
    }

    subscribeToFollowChanges(callback) {
        this.followListeners.push(callback);
        return () => {
            this.followListeners = this.followListeners.filter(listener => listener !== callback);
        };
    }

    emit() {
        this.listeners.forEach(callback => callback());
    }

    emitFollowChange(userId, isFollowing) {
        this.followListeners.forEach(callback => callback(userId, isFollowing));
        this.emit();
    }
}

export const profileUpdateEmitter = new ProfileUpdateEmitter();
