import React from 'react';
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
});
