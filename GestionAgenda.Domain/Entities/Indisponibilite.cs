using GestionAgenda.Domain.Common;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Exceptions;

namespace GestionAgenda.Domain.Entities;

public sealed class Indisponibilite : BaseEntity
{
    private Indisponibilite()
    {
    }

    public Guid DirigeantId { get; private set; }

    public Guid SocieteId { get; private set; }

    public TypeIndisponibilite Type { get; private set; }

    public string Motif { get; private set; } = string.Empty;

    public DateTimeOffset Debut { get; private set; }

    public DateTimeOffset Fin { get; private set; }

    public Guid AuteurId { get; private set; }

    public static Indisponibilite Creer(
        Guid dirigeantId,
        Guid societeId,
        TypeIndisponibilite type,
        string motif,
        DateTimeOffset debut,
        DateTimeOffset fin,
        Guid auteurId)
    {
        if (fin <= debut)
        {
            throw new DomainException("La fin de l'indisponibilité doit être postérieure au début.");
        }

        if ((fin - debut).TotalDays > LimitesDemande.IndisponibiliteJoursMax)
        {
            throw new DomainException(
                $"Une indisponibilité ne peut pas dépasser {LimitesDemande.IndisponibiliteJoursMax} jours.");
        }

        var texte = motif.Trim();
        if (texte.Length is 0 or > LimitesDemande.MotifMax)
        {
            throw new DomainException($"Le motif doit contenir entre 1 et {LimitesDemande.MotifMax} caractères.");
        }

        return new Indisponibilite
        {
            DirigeantId = dirigeantId,
            SocieteId = societeId,
            Type = type,
            Motif = texte,
            Debut = debut,
            Fin = fin,
            AuteurId = auteurId,
        };
    }
}
