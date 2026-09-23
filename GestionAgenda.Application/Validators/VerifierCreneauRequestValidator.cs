using FluentValidation;
using GestionAgenda.Application.DTOs.DemandesRencontre;

namespace GestionAgenda.Application.Validators;

public sealed class VerifierCreneauRequestValidator : AbstractValidator<VerifierCreneauRequest>
{
    public VerifierCreneauRequestValidator()
    {
        RuleFor(x => x.DebutPlanifie).NotEmpty().WithMessage("Le créneau confirmé est obligatoire pour planifier.");
    }
}
