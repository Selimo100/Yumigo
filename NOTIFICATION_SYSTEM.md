# Yumigo Notification System - Dokumentation

## Übersicht
Das Notification-System der Yumigo-App ermöglicht es Benutzern, In-App-Benachrichtigungen zu erhalten und zu verwalten. Das System besteht aus mehreren zusammenhängenden Komponenten, die eine nahtlose Benutzererfahrung bieten.

## 📁 Architektur & Dateien

### 1. Context & State Management
**📍 Datei:** `contexts/NotificationContext.js`
**🎯 Zweck:** Zentrale Verwaltung des Notification-States über die gesamte App

#### Was passiert hier:
```javascript
export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
```

**🔧 Funktionalitäten:**
- **Real-time Listener:** Überwacht Firebase Firestore für neue Notifications
- **Benutzer-spezifische Filterung:** Zeigt nur Notifications für den aktuell eingeloggten User
- **Automatische Sortierung:** Neueste Notifications zuerst
- **Unread Counter:** Zählt automatisch ungelesene Benachrichtigungen

#### Wichtige Methoden:

**markAsRead(notificationId)**
```javascript
const markAsRead = async (notificationId) => {
  // Optimistic Update (UI sofort aktualisieren)
  setNotifications(prevNotifications =>
    prevNotifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    )
  );
  
  // Firebase Update
  const notificationRef = doc(db, 'notifications', notificationId);
  await updateDoc(notificationRef, { read: true });
};
```
**Wo verwendet:** Wenn User auf eine Notification klickt
**Was passiert:** Markiert einzelne Notification als gelesen

**markAllAsRead()**
```javascript
const markAllAsRead = async () => {
  // Batch-Write für Performance
  const batch = writeBatch(db);
  unreadNotifications.forEach(notification => {
    const notificationRef = doc(db, 'notifications', notification.id);
    batch.update(notificationRef, { read: true });
  });
  await batch.commit(); // Alle Updates in einem Batch
};
```
**Wo verwendet:** "Mark all read" Button im NotificationModal
**Was passiert:** Markiert alle ungelesenen Notifications auf einmal

### 2. Service Layer - Notification Creation
**📍 Datei:** `services/inAppNotificationService.js`
**🎯 Zweck:** Erstellt und sendet verschiedene Arten von Notifications

#### Duplicate Prevention System:
```javascript
const activeNotifications = new Set();

export const createInAppNotification = async (notificationData) => {
  // Erstelle einen eindeutigen Schlüssel für diese Notification
  const notificationKey = `${notificationData.recipientId}-${notificationData.type}-${notificationData.recipeId || notificationData.metadata?.followerId || 'general'}-${Date.now()}`;
  
  // Verhindere doppelte Notifications innerhalb von 1 Sekunde
  const baseKey = notificationKey.substring(0, notificationKey.lastIndexOf('-'));
  const existingKey = Array.from(activeNotifications).find(key => key.startsWith(baseKey));
  
  if (existingKey) {
    return null; // Notification bereits im Prozess
  }
```
**Was passiert:** Verhindert doppelte Notifications durch temporäre Schlüssel-Speicherung

#### Notification Types:

**1. Recipe Like Notifications**
```javascript
export const notifyRecipeLike = async (recipeId, recipeTitle, likerName, recipeAuthorId) => {
  await createInAppNotification({
    recipientId: recipeAuthorId,
    type: 'like',
    title: 'Recipe Liked! ❤️',
    message: `${likerName} liked your recipe "${recipeTitle}"`,
    recipeId: recipeId,
    actionUrl: `/recipe/${recipeId}`,
    metadata: {
      likerName,
      recipeTitle
    }
  });
};
```
**Wo aufgerufen:** In `services/recipeService.js` beim Liken eines Rezepts
**Was passiert:** Benachrichtigt Rezept-Autor über neuen Like

**2. Follow Notifications**
```javascript
export const notifyUserFollow = async (followedUserId, followerName, followerId) => {
  await createInAppNotification({
    recipientId: followedUserId,
    type: 'follow',
    title: 'New Follower! 👥',
    message: `${followerName} started following you`,
    actionUrl: `/profile/user-profile?userId=${followerId}`,
    metadata: {
      followerName,
      followerId
    }
  });
};
```
**Wo aufgerufen:** Bei Follow-Aktionen
**Was passiert:** Benachrichtigt User über neuen Follower

**3. Rating Notifications**
```javascript
export const notifyRecipeRating = async (recipeId, recipeTitle, raterName, rating, recipeAuthorId) => {
  await createInAppNotification({
    recipientId: recipeAuthorId,
    type: 'rating',
    title: 'Recipe Rated! ⭐',
    message: `${raterName} gave your recipe "${recipeTitle}" ${rating} star${rating !== 1 ? 's' : ''}`,
    // ...
  });
};
```
**Wo aufgerufen:** Nach Rezept-Bewertung
**Was passiert:** Benachrichtigt Rezept-Autor über neue Bewertung

**4. Comment Notifications**
```javascript
export const notifyRecipeComment = async (recipeId, recipeTitle, commenterName, commentText, recipeAuthorId) => {
  await createInAppNotification({
    recipientId: recipeAuthorId,
    type: 'comment',
    title: 'New Comment! 💬',
    message: `${commenterName} commented on your recipe "${recipeTitle}": "${commentText.length > 50 ? commentText.substring(0, 50) + '...' : commentText}"`,
    actionUrl: `/recipe/${recipeId}?scrollToComments=true`,
    // ...
  });
};
```
**Wo aufgerufen:** Bei neuen Kommentaren
**Was passiert:** Benachrichtigt Rezept-Autor über neuen Kommentar

### 3. UI Component - Notification Display
**📍 Datei:** `components/NotificationModal.js`
**🎯 Zweck:** Zeigt alle Notifications in einem Modal an

#### Modal Structure:
```javascript
const NotificationModal = ({visible, onClose}) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    getNotificationIcon,
    getNotificationColor,
  } = useNotifications();
```

#### Header Section:
```javascript
<View style={styles.header}>
  <Text style={styles.headerTitle}>Notifications</Text>
  <View style={styles.headerActions}>
    {unreadCount > 0 && (
      <TouchableOpacity
        style={styles.markAllButton}
        onPress={handleMarkAllAsRead}
      >
        <Text style={styles.markAllText}>
          {isMarkingAllAsRead ? 'Marking...' : 'Mark all read'}
        </Text>
      </TouchableOpacity>
    )}
    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
      <Ionicons name="close" size={24} color={theme.colors.text}/>
    </TouchableOpacity>
  </View>
</View>
```
**Was zu sehen:** Titel, "Mark all read" Button (nur bei ungelesenen), Close Button

#### Notification Item Rendering:
```javascript
const renderNotificationItem = (notification) => {
  const iconColor = getNotificationColor(notification.type);
  return (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationItem,
        !notification.read && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(notification)}
    >
      <View style={styles.avatarContainer}>
        {notification.senderAvatar ? (
          <Image source={{uri: notification.senderAvatar}} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, {backgroundColor: iconColor + '20'}]}>
            <Ionicons name="person" size={20} color={iconColor} />
          </View>
        )}
        <View style={[styles.notificationIcon, {backgroundColor: iconColor}]}>
          <Ionicons name={getNotificationIcon(notification.type)} size={12} color="#FFFFFF" />
        </View>
      </View>
      // ...
    </TouchableOpacity>
  );
};
```

**Visual Elements:**
- **Avatar:** Sender-Profilbild oder Placeholder
- **Notification Icon:** Type-spezifisches Icon (❤️ für Likes, 👥 für Follows, etc.)
- **Text:** Titel und Nachricht
- **Unread Indicator:** Roter Punkt für ungelesene Notifications
- **Time Stamp:** "x minutes ago" Format

#### Empty State:
```javascript
{notifications.length === 0 ? (
  <View style={styles.emptyContainer}>
    <Ionicons name="notifications-outline" size={64} color={theme.colors.textSecondary} />
    <Text style={styles.emptyTitle}>No notifications yet</Text>
    <Text style={styles.emptySubtitle}>
      You'll see notifications when someone likes, comments, or follows you!
    </Text>
  </View>
) : (
  // Notification Liste
)}
```
**Was zu sehen:** Informative Nachricht wenn noch keine Notifications vorhanden

### 4. Integration in Home Screen
**📍 Datei:** `app/(tabs)/home.js`
**🎯 Zweck:** Notification Button und Modal Integration

#### Notification Button:
```javascript
const { notifications, unreadCount } = useNotifications();
const [showNotificationModal, setShowNotificationModal] = useState(false);

const handleNotificationPress = () => {
  setShowNotificationModal(true);
};
```

**Wo zu finden:** Im Header der Home-Screen
**Was passiert:** Zeigt Badge mit ungelesenen Notifications, öffnet Modal bei Klick

#### Modal Integration:
```javascript
<NotificationModal
  visible={showNotificationModal}
  onClose={() => setShowNotificationModal(false)}
/>
```
**Was passiert:** Modal wird angezeigt/versteckt basierend auf State

## 🔄 Datenfluss

### 1. Notification Creation Flow:
```
User Action (Like/Follow/Comment) 
→ Service Function (notifyRecipeLike/notifyUserFollow/etc.)
→ createInAppNotification()
→ Firebase Firestore Write
→ Real-time Listener erkennt neue Notification
→ NotificationContext State Update
→ UI Update (Badge, Modal)
```

### 2. Notification Reading Flow:
```
User klickt auf Notification
→ handleNotificationPress()
→ markAsRead() wenn ungelesen
→ Optimistic UI Update
→ Firebase Update
→ Navigation zu actionUrl
→ Modal schließt sich
```

### 3. Mark All Read Flow:
```
User klickt "Mark all read"
→ markAllAsRead()
→ Batch-Update für alle ungelesenen
→ UI State Update
→ Firebase Batch Commit
```

## 📊 Firebase Structure

### Collection: `notifications`
```javascript
{
  id: "auto-generated-id",
  recipientId: "user-uid",           // Empfänger
  type: "like|comment|follow|rating", // Notification Type
  title: "Recipe Liked! ❤️",         // Anzeige-Titel
  message: "John liked your recipe...", // Nachricht
  read: false,                       // Gelesen-Status
  createdAt: serverTimestamp(),      // Erstellungszeit
  actionUrl: "/recipe/123",          // Navigation-Ziel
  recipeId: "recipe-id",            // Referenz (optional)
  metadata: {                        // Zusätzliche Daten
    likerName: "John",
    recipeTitle: "Pasta Carbonara"
  }
}
```

## 🎨 Visual Design

### Notification Types & Icons:
- **Like:** ❤️ (heart) - Rot (#FF6B6B)
- **Comment:** 💬 (chatbubble) - Türkis (#4ECDC4)
- **Follow:** 👥 (person-add) - Blau (#45B7D1)
- **Rating:** ⭐ (restaurant) - Orange (#FFA726)
- **Default:** 🔔 (notifications) - Lila (#6C5CE7)

### Styling Features:
- **Unread Highlighting:** Leichte Hintergrundfarbe + Border
- **Smart Shadows:** Plattform-spezifische Schatten
- **Avatar System:** Profilbilder oder farbige Placeholder
- **Responsive Design:** Anpassung an verschiedene Bildschirmgrößen

## 🔧 Performance Optimizations

### 1. Real-time Efficiency:
```javascript
// Query: Nur Notifications für aktuellen User
const q = query(
  notificationsRef,
  where('recipientId', '==', user.uid)
);
```
**Vorteil:** Minimiert Datenübertragung

### 2. Batch Operations:
```javascript
// Batch-Write für Performance
const batch = writeBatch(db);
unreadNotifications.forEach(notification => {
  const notificationRef = doc(db, 'notifications', notification.id);
  batch.update(notificationRef, { read: true });
});
await batch.commit();
```
**Vorteil:** Reduziert Firebase-Aufrufe

### 3. Optimistic Updates:
```javascript
// UI sofort aktualisieren, dann Firebase
setNotifications(prevNotifications =>
  prevNotifications.map(notification =>
    notification.id === notificationId
      ? { ...notification, read: true }
      : notification
  )
);
```
**Vorteil:** Bessere User Experience durch sofortige UI-Änderungen

### 4. Duplicate Prevention:
```javascript
const activeNotifications = new Set();
// Verhindert doppelte Notifications innerhalb von 1 Sekunde
```
**Vorteil:** Verhindert Spam bei schnellen User-Aktionen

## 🚀 Usage Examples

### Hook Usage:
```javascript
import { useNotifications } from '../contexts/NotificationContext';

function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  return (
    <View>
      <Text>You have {unreadCount} unread notifications</Text>
      {/* ... */}
    </View>
  );
}
```

### Service Usage:
```javascript
import { notifyRecipeLike } from '../services/inAppNotificationService';

// Bei Recipe Like:
await notifyRecipeLike(recipeId, recipeTitle, likerName, recipeAuthorId);
```

### Navigation Integration:
```javascript
const handleNotificationPress = async (notification) => {
  if (!notification.read) {
    await markAsRead(notification.id);
  }
  if (notification.actionUrl) {
    onClose();
    router.push(notification.actionUrl); // Expo Router Navigation
  }
};
```

## 🔍 Error Handling

### Context Error Protection:
```javascript
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
```

### Service Error Handling:
```javascript
try {
  await createInAppNotification(notificationData);
} catch (error) {
  // Silent failure - Notifications sind nicht kritisch
  console.log('Notification creation failed:', error);
  return null;
}
```

## 🧪 Testing

### Relevante Test-Dateien:
- `__tests__/authService.test.js` - Authentifizierung Tests
- Weitere Notification-spezifische Tests können hinzugefügt werden

## 🔮 Future Enhancements

### Mögliche Erweiterungen:
1. **Push Notifications:** Expo Notifications für Background-Alerts
2. **Notification Preferences:** User-Settings für Notification-Types
3. **Rich Notifications:** Bilder und erweiterte Inhalte
4. **Notification History:** Archivierung alter Notifications
5. **Real-time Indicators:** Live-Updates ohne Refresh

## 📝 Zusammenfassung

Das Yumigo Notification-System bietet:
- **Real-time Updates** durch Firebase Firestore
- **Type-sichere Notifications** mit verschiedenen Kategorien
- **Performance-optimiert** durch Batch-Operations und Optimistic Updates
- **User-freundliche UI** mit modernem Design
- **Robust** durch Error Handling und Duplicate Prevention
- **Erweiterbar** für zukünftige Features

Das System ist vollständig integriert in die App-Architektur und bietet eine nahtlose Benutzererfahrung für soziale Interaktionen in der Yumigo-App.
