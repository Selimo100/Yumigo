# Yumigo Frontend Tests

## Test-Setup

Dieses Projekt verwendet Jest und React Native Testing Library für automatisierte Tests.

## Test-Arten

### 1. Component Tests
- `RecipeCard.test.js` - Testet die Rezept-Karten-Komponente
- `SearchBar.test.js` - Testet die Suchfunktion
- `FollowButton.test.js` - Testet Follow/Unfollow Funktionalität

### 2. Hook Tests
- `useFavorites.test.js` - Testet die Favoriten-Logik

### 3. Utility Tests
- `validation.test.js` - Testet Validierungsfunktionen

### 4. Screen Tests
- `login.test.js` - Testet den Login-Screen

## Tests ausführen

```bash
# Alle Tests ausführen
npm test

# Tests im Watch-Modus
npm run test:watch

# Test-Coverage anzeigen
npm run test:coverage
```

## Test-Struktur

```
__tests__/
├── RecipeCard.test.js      # Component Tests
├── SearchBar.test.js       # Component Tests
├── FollowButton.test.js    # Component Tests
├── useFavorites.test.js    # Hook Tests
├── validation.test.js      # Utility Tests
└── login.test.js          # Screen Tests
```

## Wichtige Test-Patterns

### Component Testing
```javascript
test('zeigt Komponente korrekt an', () => {
  const { getByText } = render(<Component />);
  expect(getByText('Expected Text')).toBeTruthy();
});
```

### User Interaction Testing
```javascript
test('reagiert auf Button-Klick', () => {
  const mockFunction = jest.fn();
  const { getByText } = render(<Button onPress={mockFunction} />);
  
  fireEvent.press(getByText('Click me'));
  expect(mockFunction).toHaveBeenCalled();
});
```

### Hook Testing
```javascript
test('Hook funktioniert korrekt', () => {
  const { result } = renderHook(() => useCustomHook());
  expect(result.current.value).toBe(expectedValue);
});
```

## Mocking

Die Tests verwenden Mocks für:
- Firebase/Firestore
- Expo Router
- AsyncStorage
- Externe Libraries
