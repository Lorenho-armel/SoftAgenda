using FluentValidation;
using GestionAgenda.Application.DTOs.Indisponibilites;
using GestionAgenda.Domain.Common;

namespace GestionAgenda.Application.Validators;

public sealed class CreerIndisponibiliteRequestValidator : AbstractValidator<CreerIndisponibiliteRequest>
{
    public CreerIndisponibiliteRequestValidator()
    {
        RuleFor(x => x.DirigeantId).NotEmpty();
        RuleFor(x => x.SocieteId).NotEmpty();
        RuleFor(x => x.Type).IsInEnum();
        RuleFor(x => x.Motif).NotEmpty().MaximumLength(LimitesDemande.MotifMax);
        RuleFor(x => x)
            .Must(x => x.Fin > x.Debut)
            .WithMessage("La fin de l'indisponibilité doit être postérieure au début.");
    }
}
