namespace GestionAgenda.Domain.Demandes;

public static class CiblageNotification
{
    public static IReadOnlyList<DestinataireNotification> Creation(
        IReadOnlyList<DestinataireNotification> assistantes,
        DestinataireNotification dirigeant) =>
        Distincts(assistantes.Count > 0 ? assistantes : [dirigeant]);

    public static IReadOnlyList<DestinataireNotification> Demandeur(DestinataireNotification demandeur) =>
        Distincts([demandeur]);

    public static IReadOnlyList<DestinataireNotification> Participants(
        DestinataireNotification dirigeant,
        IReadOnlyList<DestinataireNotification> participants) =>
        Distincts([dirigeant, ..participants]);

    public static IReadOnlyList<DestinataireNotification> Annulation(
        DestinataireNotification demandeur,
        DestinataireNotification dirigeant,
        IReadOnlyList<DestinataireNotification> assistantes,
        IReadOnlyList<DestinataireNotification> participants) =>
        Distincts([demandeur, dirigeant, ..assistantes, ..participants]);

    public static IReadOnlyList<DestinataireNotification> Distincts(
        IEnumerable<DestinataireNotification> destinataires) =>
        destinataires
            .Where(destinataire => !string.IsNullOrWhiteSpace(destinataire.Email))
            .GroupBy(destinataire => destinataire.Email.Trim().ToLowerInvariant())
            .Select(groupe => groupe.First() with { Email = groupe.Key })
            .ToList();
}
