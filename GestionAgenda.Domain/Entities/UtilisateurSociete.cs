using GestionAgenda.Domain.Common;
using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Domain.Entities;

public sealed class UtilisateurSociete : BaseEntity
{
    private UtilisateurSociete()
    {
    }

    public Guid UtilisateurId { get; private set; }

    public Guid SocieteId { get; private set; }

    public RoleSociete Role { get; private set; }

    public Utilisateur? Utilisateur { get; private set; }

    public Societe? Societe { get; private set; }

    public static UtilisateurSociete Creer(Guid utilisateurId, Guid societeId, RoleSociete role) =>
        new()
        {
            UtilisateurId = utilisateurId,
            SocieteId = societeId,
            Role = role,
        };
}
