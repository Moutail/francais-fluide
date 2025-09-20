/**
 * Test simple pour vérifier que Jest fonctionne
 */

describe('Tests de base', () => {
  test('addition simple', () => {
    expect(1 + 1).toBe(2);
  });

  test('string manipulation', () => {
    const text = 'Bonjour';
    expect(text.toLowerCase()).toBe('bonjour');
  });

  test('array operations', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr.includes(2)).toBe(true);
  });
});
