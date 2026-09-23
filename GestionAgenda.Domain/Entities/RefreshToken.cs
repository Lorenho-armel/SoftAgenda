using GestionAgenda.Domain.Common;

namespace GestionAgenda.Domain.Entities;

public sealed class RefreshToken : BaseEntity
{
    private RefreshToken()
    {
    }

    public Guid UtilisateurId { get; private set; }

    public string TokenHash { get; private set; } = string.Empty;

    public DateTimeOffset ExpireLe { get; private set; }

    public DateTimeOffset? RevoqueLe { get; private set; }

    public string? RemplaceParHash { get; private set; }

    public bool EstActif(DateTimeOffset maintenant) =>
        RevoqueLe is null && ExpireLe > maintenant;

    public void Revoquer(DateTimeOffset maintenant, string? remplaceParHash)
    {
        RevoqueLe = maintenant;
        RemplaceParHash = remplaceParHash;
    }

    public static RefreshToken Creer(Guid utilisateurId, string tokenHash, DateTimeOffset expireLe) =>
        new()
        {
            UtilisateurId = utilisateurId,
            TokenHash = tokenHash,
            ExpireLe = expireLe,
        };
}
