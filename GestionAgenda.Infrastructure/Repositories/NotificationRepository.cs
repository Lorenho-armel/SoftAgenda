using GestionAgenda.Domain.Common;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Interfaces;
using GestionAgenda.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionAgenda.Infrastructure.Repositories;

public sealed class NotificationRepository(ApplicationDbContext context) : INotificationRepository
{
    public Task AddAsync(Notification notification, CancellationToken cancellationToken = default)
    {
        context.Set<Notification>().Add(notification);
        return Task.CompletedTask;
    }

    public Task<Notification?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        context.Set<Notification>().FirstOrDefaultAsync(n => n.Id == id, cancellationToken);

    public async Task<Page<Notification>> ListerAsync(
        Guid destinataireId,
        int page,
        int size,
        CancellationToken cancellationToken = default)
    {
        var requete = context.Set<Notification>().Where(n => n.DestinataireId == destinataireId);
        var total = await requete.CountAsync(cancellationToken);
        var items = await requete
            .OrderByDescending(n => n.DateCreation)
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync(cancellationToken);
        return new Page<Notification>(items, total);
    }

    public Task AddAbonnementAsync(AbonnementPush abonnement, CancellationToken cancellationToken = default)
    {
        context.Set<AbonnementPush>().Add(abonnement);
        return Task.CompletedTask;
    }

    public Task<AbonnementPush?> AbonnementParEndpointAsync(
        string endpoint,
        CancellationToken cancellationToken = default) =>
        context.Set<AbonnementPush>().FirstOrDefaultAsync(a => a.Endpoint == endpoint, cancellationToken);

    public async Task<IReadOnlyList<AbonnementPush>> AbonnementsDeAsync(
        Guid utilisateurId,
        CancellationToken cancellationToken = default) =>
        await context.Set<AbonnementPush>().Where(a => a.UtilisateurId == utilisateurId).ToListAsync(cancellationToken);

    public Task RetirerAbonnementAsync(AbonnementPush abonnement, CancellationToken cancellationToken = default)
    {
        var ensemble = context.Set<AbonnementPush>();
        if (context.Entry(abonnement).State == EntityState.Detached)
        {
            ensemble.Attach(abonnement);
        }

        ensemble.Remove(abonnement);
        return Task.CompletedTask;
    }

    public Task<bool> RappelEmisAsync(
        Guid demandeId,
        string titre,
        DateTimeOffset depuis,
        CancellationToken cancellationToken = default) =>
        context.Set<Notification>().AnyAsync(
            notification => notification.DemandeId == demandeId
                && notification.Evenement == EvenementNotification.Rappel
                && notification.Titre == titre
                && notification.DateCreation >= depuis,
            cancellationToken);
}
