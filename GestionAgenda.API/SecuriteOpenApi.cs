using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace GestionAgenda.API;

public sealed class SecuriteOpenApi : IOpenApiDocumentTransformer
{
    private const string Schema = "Bearer";

    public Task TransformAsync(OpenApiDocument document, OpenApiDocumentTransformerContext context, CancellationToken cancellationToken)
    {
        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();
        document.Components.SecuritySchemes[Schema] = new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
        };
        document.Security ??= [];
        document.Security.Add(new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference(Schema, document)] = [],
        });
        return Task.CompletedTask;
    }
}
