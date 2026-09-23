using GestionAgenda.Domain.Common;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Exceptions;

namespace GestionAgenda.Domain.Entities;

public sealed class DemandeParticipant : BaseEntity
{
    private DemandeParticipant()
    {
    }

    public Guid DemandeRencontreId { get; private set; }

    public Guid? UtilisateurId { get; private set; }

    public string? NomComplet { get; private set; }

    public string? Email { get; private set; }

    public DemandeRencontre? Demande { get; private set; }

    internal static DemandeParticipant Creer(Guid demandeId, NouveauParticipant participant)
    {
        if (participant.UtilisateurId.HasValue)
        {
            return new DemandeParticipant
            {
                DemandeRencontreId = demandeId,
                UtilisateurId = participant.UtilisateurId,
            };
        }

        var nom = participant.NomComplet?.Trim();
        var email = participant.Email?.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(nom) || string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
        {
            throw new DomainException("Un participant externe a un nom et un e-mail valides.");
        }

        return new DemandeParticipant
        {
            DemandeRencontreId = demandeId,
            NomComplet = nom,
            Email = email,
        };
    }
}
