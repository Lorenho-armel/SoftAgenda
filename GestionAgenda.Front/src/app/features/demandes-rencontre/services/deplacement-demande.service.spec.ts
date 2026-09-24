import { describe, expect, it } from 'vitest';
import { DemandeDetail } from '../models/demande.model';
import { periodeDeplacee } from './deplacement-demande.service';

const demande = {
  dateDebutSouhaitee: '2027-01-10T08:00:00.000Z',
  dateFinSouhaitee: '2027-01-10T12:00:00.000Z',
  dureeMinutes: 60,
} as DemandeDetail;

describe('periodeDeplacee', () => {
  it('devrait decaler toute la periode souhaitee du meme ecart', () => {
    // Act
    const periode = periodeDeplacee(demande, new Date('2027-01-11T10:00:00.000Z'), new Date('2027-01-11T11:00:00.000Z'));

    // Assert
    expect(periode).toEqual({
      dateDebutSouhaitee: '2027-01-11T10:00:00.000Z',
      dateFinSouhaitee: '2027-01-11T14:00:00.000Z',
      dureeMinutes: 60,
    });
  });

  it('devrait allonger la fin de periode quand la duree la depasse', () => {
    // Act
    const periode = periodeDeplacee(demande, new Date('2027-01-10T08:00:00.000Z'), new Date('2027-01-10T13:30:00.000Z'));

    // Assert
    expect(periode.dateFinSouhaitee).toBe('2027-01-10T13:30:00.000Z');
    expect(periode.dureeMinutes).toBe(330);
  });
});
