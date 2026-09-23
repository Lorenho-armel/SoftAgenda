using FluentValidation;
using GestionAgenda.Application.DTOs.TableauAssistante;

namespace GestionAgenda.Application.Validators;

public sealed class TableauAssistanteQueryValidator : AbstractValidator<TableauAssistanteQuery>
{
    public TableauAssistanteQueryValidator()
    {
        RuleFor(x => x.FinJour).GreaterThan(x => x.DebutJour);
        RuleFor(x => x)
            .Must(x => DureeValide(x.FinJour - x.DebutJour))
            .WithMessage("La journée demandée est invalide.");
    }

    private static bool DureeValide(TimeSpan duree) =>
        duree >= TimeSpan.FromHours(23) && duree <= TimeSpan.FromHours(25);
}
