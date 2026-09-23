using FluentValidation;
using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Domain.Common;

namespace GestionAgenda.Application.Validators;

public sealed class DemandeRencontreQueryValidator : AbstractValidator<DemandeRencontreQuery>
{
    private static readonly string[] TrisAutorises =
        ["urgence", "priorite", "datedebutsouhaitee", "datecreation", "statut"];

    public DemandeRencontreQueryValidator()
    {
        RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
        RuleFor(x => x.Size).InclusiveBetween(1, LimitesDemande.PageSizeMax);
        RuleFor(x => x.SortDirection)
            .Must(v => v.Equals("asc", StringComparison.OrdinalIgnoreCase)
                || v.Equals("desc", StringComparison.OrdinalIgnoreCase))
            .WithMessage("Le sens de tri doit être asc ou desc.");
        RuleFor(x => x.SortBy)
            .Must(v => v is null || TrisAutorises.Contains(v.Trim().ToLowerInvariant()))
            .WithMessage("Le tri demandé n'est pas autorisé.");
    }
}
