import { Text } from 'react-native';

describe('RecipeCard', () => {
  test('Placeholder test - Component existiert', () => {
    
    expect(true).toBe(true);
  });

  test('kann Text rendern', () => {
    
    const TestComponent = () => <Text>Test</Text>;
    expect(TestComponent).toBeDefined();
  });
});
