using GestionAgenda.Domain.Demandes;

namespace GestionAgenda.Domain.Interfaces;

public sealed record CreneauOccupeExterne(string Titre, DateTimeOffset Debut, DateTimeOffset Fin);

public sealed record DisponibilitesExternes(bool Verifiees, string? Raison, IReadOnlyList<CreneauOccupeExterne> Occupations)
{
    public static DisponibilitesExternes SansObjet { get; } = new(true, null, []);

    public static DisponibilitesExternes NonVerifiees(string raison) => new(false, raison, []);
}

public interface IDisponibilitesExternes
{
    Task<DisponibilitesExternes> OccupationsDirigeantAsync(
        Guid dirigeantId,
        Intervalle creneau,
        CancellationToken cancellationToken = default);
}
