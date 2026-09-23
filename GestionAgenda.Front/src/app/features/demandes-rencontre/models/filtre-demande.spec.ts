import { describe, expect, it } from 'vitest';
import { filtreInitial } from './demande.model';

describe('filtreInitial', () => {
  it('devrait reprendre la vue et le statut demandés par le tableau', () => {
    // Act
    const aTraiter = filtreInitial('EnAttente', null);
    const acceptees = filtreInitial(null, 'Acceptee');

    // Assert
    expect(aTraiter.vue).toBe('EnAttente');
    expect(aTraiter.statut).toBe('');
    expect(acceptees.statut).toBe('Acceptee');
    expect(acceptees.vue).toBe('');
  });

  it('devrait ignorer une vue inconnue', () => {
    // Act
    const resultat = filtreInitial('Score', 'Inconnue');

    // Assert
    expect(resultat.vue).toBe('');
    expect(resultat.statut).toBe('');
  });
});
