using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace GestionAgenda.Infrastructure.Notifications;

[Authorize]
public sealed class NotificationsHub : Hub
{
    public static string Groupe(Guid utilisateurId) => $"utilisateur-{utilisateurId}";

    public override async Task OnConnectedAsync()
    {
        var valeur = Context.User?.FindFirst("sub")?.Value;
        if (Guid.TryParse(valeur, out var utilisateurId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, Groupe(utilisateurId));
        }

        await base.OnConnectedAsync();
    }
}
