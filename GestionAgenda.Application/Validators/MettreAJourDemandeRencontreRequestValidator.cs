using FluentValidation;
using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Domain.Common;
using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Application.Validators;

public sealed class MettreAJourDemandeRencontreRequestValidator : AbstractValidator<MettreAJourDemandeRencontreRequest>
{
    public MettreAJourDemandeRencontreRequestValidator()
    {
        RuleFor(x => x.Type).IsInEnum();
        RuleFor(x => x.Motif).NotEmpty().Length(LimitesDemande.MotifMin, LimitesDemande.MotifMax);
        RuleFor(x => x.DureeMinutes).InclusiveBetween(LimitesDemande.DureeMin, LimitesDemande.DureeMax);
        RuleFor(x => x.DateFinSouhaitee)
            .GreaterThan(x => x.DateDebutSouhaitee)
            .WithMessage("La fin de la période souhaitée doit être postérieure au début.");
        RuleFor(x => x)
            .Must(x => x.DureeMinutes <= (x.DateFinSouhaitee - x.DateDebutSouhaitee).TotalMinutes)
            .WithMessage("La durée dépasse la période souhaitée.");
        RuleFor(x => x.Participants)
            .Must(p => p is { Count: > 0 })
            .When(x => x.Type == TypeDemande.Reunion)
            .WithMessage("Une réunion comporte au moins un participant en plus du dirigeant.");
        RuleForEach(x => x.Participants).SetValidator(new ParticipantRequestValidator());
    }
}
