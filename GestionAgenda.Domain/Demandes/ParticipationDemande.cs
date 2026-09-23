using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Exceptions;

namespace GestionAgenda.Domain.Demandes;

internal static class ParticipationDemande
{
    public static List<DemandeParticipant> Construire(
        Guid demandeId,
        Guid dirigeantId,
        TypeDemande type,
        IReadOnlyList<NouveauParticipant> participants)
    {
        if (type == TypeDemande.Reunion && participants.Count == 0)
        {
            throw new DomainException("Une réunion comporte au moins un participant en plus du dirigeant.");
        }

        var identifiants = participants
            .Where(p => p.UtilisateurId.HasValue)
            .Select(p => p.UtilisateurId!.Value)
            .ToList();
        if (identifiants.Count != identifiants.Distinct().Count() || identifiants.Contains(dirigeantId))
        {
            throw new DomainException("Les participants internes sont invalides ou reprennent le dirigeant.");
        }

        var emails = participants
            .Where(p => !p.UtilisateurId.HasValue && !string.IsNullOrWhiteSpace(p.Email))
            .Select(p => p.Email!.Trim().ToLowerInvariant())
            .ToList();
        if (emails.Count != emails.Distinct().Count())
        {
            throw new DomainException("Un participant externe est en double.");
        }

        return participants.Select(p => DemandeParticipant.Creer(demandeId, p)).ToList();
    }
}
