using FluentValidation;
using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Domain.Common;

namespace GestionAgenda.Application.Validators;

public sealed class ChangerUrgenceDemandeRequestValidator : AbstractValidator<ChangerUrgenceDemandeRequest>
{
    public ChangerUrgenceDemandeRequestValidator()
    {
        RuleFor(x => x.Urgence).IsInEnum();
        RuleFor(x => x.Commentaire).MaximumLength(LimitesDemande.CommentaireMax);
    }
}
