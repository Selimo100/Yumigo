import { render, fireEvent } from '@testing-library/react-native';
import SearchBar from '../components/SearchBar';

describe('SearchBar', () => {
  test('rendert korrekt mit placeholder', () => {
    const { getByPlaceholderText } = render(
      <SearchBar placeholder="Suche nach Rezepten..." />
    );
    
    expect(getByPlaceholderText('Suche nach Rezepten...')).toBeTruthy();
  });

  test('ruft onSearch bei Texteingabe auf', () => {
    const mockOnSearch = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar placeholder="Suche..." onSearch={mockOnSearch} />
    );
    
    const input = getByPlaceholderText('Suche...');
    fireEvent.changeText(input, 'Pasta');
    
    expect(mockOnSearch).toHaveBeenCalledWith('Pasta');
  });

  test('zeigt Standard-Styling an', () => {
    const { getByPlaceholderText } = render(
      <SearchBar placeholder="Test" />
    );
    
    const input = getByPlaceholderText('Test');
    expect(input.props.style).toBeDefined();
  });

  test('akzeptiert leeren Search-Text', () => {
    const mockOnSearch = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar placeholder="Suche..." onSearch={mockOnSearch} />
    );
    
    const input = getByPlaceholderText('Suche...');
    fireEvent.changeText(input, '');
    
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  test('funktioniert ohne onSearch Callback', () => {
    const { getByPlaceholderText } = render(
      <SearchBar placeholder="Test ohne Callback" />
    );
    
    const input = getByPlaceholderText('Test ohne Callback');
    
    expect(() => {
      fireEvent.changeText(input, 'test');
    }).not.toThrow();
  });

  test('behält Focus-Verhalten bei', () => {
    const { getByPlaceholderText } = render(
      <SearchBar placeholder="Focus Test" />
    );
    
    const input = getByPlaceholderText('Focus Test');
    
    expect(() => {
      fireEvent(input, 'focus');
      fireEvent(input, 'blur');
    }).not.toThrow();
  });

  test('verarbeitet Sonderzeichen korrekt', () => {
    const mockOnSearch = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar placeholder="Sonderzeichen" onSearch={mockOnSearch} />
    );
    
    const input = getByPlaceholderText('Sonderzeichen');
    const specialChars = 'äöü!@#$%^&*()';
    
    fireEvent.changeText(input, specialChars);
    expect(mockOnSearch).toHaveBeenCalledWith(specialChars);
  });
});
