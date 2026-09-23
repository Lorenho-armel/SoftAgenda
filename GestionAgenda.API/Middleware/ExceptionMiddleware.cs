using System.Text.Json;
using GestionAgenda.Application.DTOs;
using GestionAgenda.Domain.Exceptions;

namespace GestionAgenda.API.Middleware;

public sealed class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            await EcrireAsync(context, exception);
        }
    }

    private async Task EcrireAsync(HttpContext context, Exception exception)
    {
        if (context.Response.HasStarted)
        {
            System.Runtime.ExceptionServices.ExceptionDispatchInfo.Capture(exception).Throw();
        }

        var (status, message) = exception switch
        {
            NotFoundException ex => (StatusCodes.Status404NotFound, ex.Message),
            UnauthorizedException ex => (StatusCodes.Status401Unauthorized, ex.Message),
            ForbiddenException ex => (StatusCodes.Status403Forbidden, ex.Message),
            ConflictException ex => (StatusCodes.Status409Conflict, ex.Message),
            DomainException ex => (StatusCodes.Status400BadRequest, ex.Message),
            _ => (StatusCodes.Status500InternalServerError, "Une erreur interne est survenue."),
        };

        if (status == StatusCodes.Status500InternalServerError)
        {
            logger.LogError(exception, "Erreur non gérée sur {Method} {Path}", context.Request.Method, context.Request.Path);
        }
        else
        {
            logger.LogWarning(
                "Requête refusée {Method} {Path} : {Message}",
                context.Request.Method,
                context.Request.Path,
                exception.Message);
        }

        context.Response.StatusCode = status;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(JsonSerializer.Serialize(ApiResponse<object>.Fail(message), JsonOptions));
    }
}
