using FluentValidation;
using GestionAgenda.Application.Common;
using GestionAgenda.Application.DTOs;
using GestionAgenda.Application.DTOs.Notifications;
using GestionAgenda.Application.Services.Interfaces;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Interfaces;
using GestionAgenda.Infrastructure.Options;
using Microsoft.Extensions.Options;

namespace GestionAgenda.Infrastructure.Services;

public sealed class CentreNotifications(
    INotificationRepository notifications,
    IUnitOfWork unitOfWork,
    IValidator<NotificationQuery> queryValidator,
    IValidator<AbonnementPushRequest> abonnementValidator,
    IOptions<NotificationsOptions> options) : ICentreNotifications
{
    public async Task<PaginatedResult<NotificationResponse>> ListerAsync(
        Guid destinataireId,
        NotificationQuery query,
        CancellationToken cancellationToken = default)
    {
        await queryValidator.ValiderAsync(query, cancellationToken);
        var page = await notifications.ListerAsync(destinataireId, query.Page, query.Size, cancellationToken);
        var totalPages = query.Size == 0 ? 0 : (int)Math.Ceiling(page.TotalCount / (double)query.Size);
        var items = page.Items.Select(item => new NotificationResponse(
            item.Id, item.Titre, item.Message, item.DemandeId, item.DateCreation)).ToList();
        return new PaginatedResult<NotificationResponse>(items, page.TotalCount, query.Page, query.Size, totalPages);
    }

    public async Task EnregistrerPushAsync(
        Guid utilisateurId,
        AbonnementPushRequest request,
        CancellationToken cancellationToken = default)
    {
        await abonnementValidator.ValiderAsync(request, cancellationToken);
        if (await notifications.AbonnementParEndpointAsync(request.Endpoint, cancellationToken) is not null)
        {
            return;
        }

        await notifications.AddAbonnementAsync(
            AbonnementPush.Creer(utilisateurId, request.Endpoint, request.CleP256dh, request.Auth),
            cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public string ClePubliquePush() => options.Value.Push.ClePublique;
}
