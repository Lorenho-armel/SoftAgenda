namespace GestionAgenda.Application.DTOs.Notifications;

public record NotificationQuery(int Page = 1, int Size = 20);

public record NotificationResponse(
    Guid Id,
    string Titre,
    string Message,
    Guid DemandeId,
    DateTimeOffset DateCreation);

public record AbonnementPushRequest(string Endpoint, string CleP256dh, string Auth);

public record ClePushResponse(string ClePublique);
