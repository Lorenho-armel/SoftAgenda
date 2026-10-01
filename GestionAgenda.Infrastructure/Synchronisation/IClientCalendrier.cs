namespace GestionAgenda.Infrastructure.Synchronisation;

public enum CouleurEvenement
{
    RendezVous,
    Reunion,
    Indisponibilite,
}

public sealed record EvenementAgenda(
    string Id,
    Guid SourceId,
    string Titre,
    string Description,
    string? Lieu,
    DateTimeOffset Debut,
    DateTimeOffset Fin,
    CouleurEvenement Couleur,
    bool Prive);

public sealed record AccesAgenda(bool Accessible, string Message);

public sealed record EvenementLu(string Id, string? Titre, DateTimeOffset Debut, DateTimeOffset Fin, bool Libre);

public interface IClientCalendrier
{
    string CompteService { get; }

    Task EnregistrerAsync(string agendaId, EvenementAgenda evenement, CancellationToken cancellationToken = default);

    Task SupprimerAsync(string agendaId, string evenementId, CancellationToken cancellationToken = default);

    Task<AccesAgenda> VerifierAccesAsync(string agendaId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<EvenementLu>> ListerAsync(
        string agendaId,
        DateTimeOffset debut,
        DateTimeOffset fin,
        CancellationToken cancellationToken = default);
}
