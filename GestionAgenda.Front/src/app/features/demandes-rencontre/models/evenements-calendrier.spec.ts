import { describe, expect, it } from 'vitest';
import { DemandeResume } from './demande.model';
import { COULEURS_STATUT, evenementDemande } from './evenements-calendrier';

describe('evenementDemande', () => {
  it('devrait placer la demande sur son debut souhaite pour sa duree', () => {
    // Arrange
    const demande: DemandeResume = {
      id: 'd1',
      demandeurId: 'u1',
      dirigeantId: 'u2',
      societeId: 's1',
      type: 'RendezVous',
      motif: 'Point budget',
      dateDebutSouhaitee: '2026-10-01T08:00:00Z',
      dateFinSouhaitee: '2026-10-03T18:00:00Z',
      dureeMinutes: 90,
      urgence: 'Normal',
      priorite: 'Moyenne',
      statut: 'Acceptee',
      salleSouhaiteeId: null,
      dateCreation: '2026-09-20T08:00:00Z',
      demandeurNom: 'Nina Leroy',
      societeNom: 'Softwell',
    };

    // Act
    const evenement = evenementDemande(demande);

    // Assert
    expect(evenement.start).toEqual(new Date('2026-10-01T08:00:00Z'));
    expect(evenement.end).toEqual(new Date('2026-10-01T09:30:00Z'));
    expect(evenement.color).toBe(COULEURS_STATUT.Acceptee);
    expect(evenement.title).toBe('Point budget · Nina Leroy');
    expect(evenement.extendedProps).toEqual({ demandeId: 'd1' });
  });
});
