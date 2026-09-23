namespace GestionAgenda.Domain.Common;

public abstract class BaseEntity
{
    public Guid Id { get; private set; } = Guid.CreateVersion7();

    public DateTimeOffset DateCreation { get; private set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset DateModification { get; private set; } = DateTimeOffset.UtcNow;

    public void MarquerModifiee() => DateModification = DateTimeOffset.UtcNow;

    internal void AttribuerIdentifiant(Guid id) => Id = id;
}
