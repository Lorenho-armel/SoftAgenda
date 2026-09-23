namespace GestionAgenda.Domain.Common;

public sealed class Page<T>
{
    public Page(IReadOnlyList<T> items, int totalCount)
    {
        Items = items;
        TotalCount = totalCount;
    }

    public IReadOnlyList<T> Items { get; }

    public int TotalCount { get; }
}
