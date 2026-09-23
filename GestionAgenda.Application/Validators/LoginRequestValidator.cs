using FluentValidation;
using GestionAgenda.Application.DTOs.Auth;

namespace GestionAgenda.Application.Validators;

public sealed class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.MotDePasse).NotEmpty();
    }
}
