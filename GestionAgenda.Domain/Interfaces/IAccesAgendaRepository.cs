namespace GestionAgenda.Domain.Interfaces;

public interface IAccesAgendaRepository
{
    Task<bool> EstMembreAsync(Guid utilisateurId, Guid societeId, CancellationToken cancellationToken = default);

    Task<bool> EstDirigeantAsync(Guid utilisateurId, Guid societeId, CancellationToken cancellationToken = default);

    Task<bool> EstAssistanteActiveAsync(
        Guid assistanteId,
        Guid dirigeantId,
        Guid societeId,
        CancellationToken cancellationToken = default);

    Task<bool> AAssistanteActiveAsync(
        Guid dirigeantId,
        Guid societeId,
        CancellationToken cancellationToken = default);

    Task<bool> SontMembresAsync(
        IReadOnlyCollection<Guid> utilisateurIds,
        Guid societeId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Guid>> ListerAssistantesActivesAsync(
        Guid dirigeantId,
        Guid societeId,
        CancellationToken cancellationToken = default);
}
