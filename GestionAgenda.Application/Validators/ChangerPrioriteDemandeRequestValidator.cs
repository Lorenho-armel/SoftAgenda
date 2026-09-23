using FluentValidation;
using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Domain.Common;

namespace GestionAgenda.Application.Validators;

public sealed class ChangerPrioriteDemandeRequestValidator : AbstractValidator<ChangerPrioriteDemandeRequest>
{
    public ChangerPrioriteDemandeRequestValidator()
    {
        RuleFor(x => x.Priorite).IsInEnum();
        RuleFor(x => x.Commentaire).MaximumLength(LimitesDemande.CommentaireMax);
    }
}
