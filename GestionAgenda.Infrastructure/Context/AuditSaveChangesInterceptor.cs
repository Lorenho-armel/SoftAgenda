using GestionAgenda.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace GestionAgenda.Infrastructure.Context;

public sealed class AuditSaveChangesInterceptor : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        MarquerModifiees(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        MarquerModifiees(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private static void MarquerModifiees(DbContext? context)
    {
        if (context is null)
        {
            return;
        }

        foreach (var entree in context.ChangeTracker.Entries<BaseEntity>())
        {
            if (entree.State == EntityState.Modified)
            {
                entree.Entity.MarquerModifiee();
            }
        }
    }
}
