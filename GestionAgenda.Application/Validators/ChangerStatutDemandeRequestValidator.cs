using FluentValidation;
using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Domain.Common;
using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Application.Validators;

public sealed class ChangerStatutDemandeRequestValidator : AbstractValidator<ChangerStatutDemandeRequest>
{
    public ChangerStatutDemandeRequestValidator()
    {
        RuleFor(x => x.Statut).IsInEnum();
        RuleFor(x => x.Commentaire).MaximumLength(LimitesDemande.CommentaireMax);
        RuleFor(x => x.Commentaire)
            .NotEmpty()
            .When(x => x.Statut is StatutDemande.Refusee or StatutDemande.Reportee or StatutDemande.Annulee)
            .WithMessage("Un commentaire est obligatoire : il est transmis au demandeur.");
        RuleFor(x => x.DateDebutSouhaitee).NotNull().When(x => x.Statut == StatutDemande.Reportee);
        RuleFor(x => x.DateFinSouhaitee).NotNull().When(x => x.Statut == StatutDemande.Reportee);
        RuleFor(x => x)
            .Must(x => x.DateFinSouhaitee > x.DateDebutSouhaitee)
            .When(x => x.Statut == StatutDemande.Reportee && x.DateDebutSouhaitee.HasValue && x.DateFinSouhaitee.HasValue)
            .WithMessage("La fin de la période souhaitée doit être postérieure au début.");
        RuleFor(x => x.DebutPlanifie)
            .NotNull()
            .When(x => x.Statut == StatutDemande.Planifiee)
            .WithMessage("Le créneau confirmé est obligatoire pour planifier.");
    }
}
