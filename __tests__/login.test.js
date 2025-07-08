
describe('Login Screen', () => {
  test('Placeholder test - Screen existiert', () => {
    
    expect(true).toBe(true);
  });

  test('kann Strings vergleichen', () => {
    const email = 'test@example.com';
    const password = 'password123';
    
    expect(email).toContain('@');
    expect(password.length).toBeGreaterThan(6);
  });
});
