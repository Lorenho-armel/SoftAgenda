import { describe, expect, it } from 'vitest';
import { libelleJour } from './demande-libelles';

describe('demande-libelles', () => {
  it('devrait dire Aujourd hui pour la date du jour', () => {
    // Arrange
    const maintenant = new Date(2026, 8, 23, 15, 0, 0);

    // Act
    const resultat = libelleJour('2026-09-23T08:00:00', maintenant);

    // Assert
    expect(resultat).toBe("Aujourd'hui");
  });

  it('devrait dire Demain pour le lendemain', () => {
    // Arrange
    const maintenant = new Date(2026, 8, 23, 15, 0, 0);

    // Act
    const resultat = libelleJour('2026-09-24T08:00:00', maintenant);

    // Assert
    expect(resultat).toBe('Demain');
  });
});
