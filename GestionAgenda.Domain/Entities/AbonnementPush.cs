using GestionAgenda.Domain.Common;

namespace GestionAgenda.Domain.Entities;

public sealed class AbonnementPush : BaseEntity
{
    private AbonnementPush()
    {
    }

    public Guid UtilisateurId { get; private set; }

    public string Endpoint { get; private set; } = string.Empty;

    public string CleP256dh { get; private set; } = string.Empty;

    public string Auth { get; private set; } = string.Empty;

    public static AbonnementPush Creer(Guid utilisateurId, string endpoint, string cleP256dh, string auth) =>
        new()
        {
            UtilisateurId = utilisateurId,
            Endpoint = endpoint.Trim(),
            CleP256dh = cleP256dh.Trim(),
            Auth = auth.Trim(),
        };
}
