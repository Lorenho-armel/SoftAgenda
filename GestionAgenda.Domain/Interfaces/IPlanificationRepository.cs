using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;

namespace GestionAgenda.Domain.Interfaces;

public interface IPlanificationRepository
{
    Task<Salle?> GetSalleAsync(Guid salleId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<OccupationCalendrier>> OccupationsDirigeantAsync(
        Guid dirigeantId,
        Intervalle creneau,
        Guid demandeExclueId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<OccupationCalendrier>> OccupationsParticipantsAsync(
        IReadOnlyCollection<Guid> utilisateurIds,
        Intervalle creneau,
        Guid demandeExclueId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<OccupationSalle>> OccupationsSalleAsync(
        Guid salleId,
        Intervalle creneau,
        Guid demandeExclueId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<OccurrenceARappeler>> ListerARappelerAsync(
        DateTimeOffset maintenant,
        DateTimeOffset limite,
        CancellationToken cancellationToken = default);
}
