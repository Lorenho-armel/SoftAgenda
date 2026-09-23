using GestionAgenda.Domain.Common;
using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Domain.Entities;

public sealed class Notification : BaseEntity
{
    private Notification()
    {
    }

    public Guid? DestinataireId { get; private set; }

    public string Email { get; private set; } = string.Empty;

    public string Titre { get; private set; } = string.Empty;

    public string Message { get; private set; } = string.Empty;

    public Guid DemandeId { get; private set; }

    public EvenementNotification Evenement { get; private set; }

    public static Notification Creer(
        Guid? destinataireId,
        string email,
        string titre,
        string message,
        Guid demandeId,
        EvenementNotification evenement) =>
        new()
        {
            DestinataireId = destinataireId,
            Email = email.Trim().ToLowerInvariant(),
            Titre = titre.Trim(),
            Message = message.Trim(),
            DemandeId = demandeId,
            Evenement = evenement,
        };
}
