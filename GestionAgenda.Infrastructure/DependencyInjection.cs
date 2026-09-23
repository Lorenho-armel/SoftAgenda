using System.Text;
using GestionAgenda.Application;
using GestionAgenda.Domain.Interfaces;
using GestionAgenda.Infrastructure.Context;
using GestionAgenda.Infrastructure.Options;
using GestionAgenda.Infrastructure.Repositories;
using GestionAgenda.Infrastructure.Seeding;
using GestionAgenda.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace GestionAgenda.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("ConnectionStrings:DefaultConnection est absente.");
        }

        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.AddDbContext<ApplicationDbContext>((_, options) =>
        {
            options.UseSqlServer(connectionString);
            options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
            options.AddInterceptors(new AuditSaveChangesInterceptor());
        });
        services.AddScoped<IUnitOfWork>(provider => provider.GetRequiredService<ApplicationDbContext>());
        services.AddScoped<IDemandeRencontreRepository, DemandeRencontreRepository>();
        services.AddScoped<IAccesAgendaRepository, AccesAgendaRepository>();
        services.AddScoped<IPlanificationRepository, PlanificationRepository>();
        services.AddScoped<IUtilisateurRepository, UtilisateurRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<PlanificationDemande>();
        services.AddScoped<Application.Services.Interfaces.IDemandeRencontreService, DemandeRencontreService>();
        services.AddScoped<Application.Services.Interfaces.IAuthService, AuthService>();
        services.AddScoped<DevDataSeeder>();
        services.AddApplication();
        AjouterJwt(services, configuration);
        return services;
    }

    private static void AjouterJwt(IServiceCollection services, IConfiguration configuration)
    {
        var secret = configuration["Jwt:Secret"];
        if (string.IsNullOrWhiteSpace(secret))
        {
            return;
        }

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["Jwt:Issuer"],
                    ValidAudience = configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
                    ClockSkew = TimeSpan.FromMinutes(1),
                    RoleClaimType = "role",
                    NameClaimType = "sub",
                };
            });
    }
}
