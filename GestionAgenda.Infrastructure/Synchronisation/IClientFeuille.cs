namespace GestionAgenda.Infrastructure.Synchronisation;

public sealed record BlocCellules(string Plage, IList<IList<object?>> Valeurs);

public interface IClientFeuille
{
    Task<IList<IList<object?>>> LireAsync(string plage, CancellationToken cancellationToken = default);

    Task EcrireAsync(IReadOnlyList<BlocCellules> blocs, CancellationToken cancellationToken = default);
}
