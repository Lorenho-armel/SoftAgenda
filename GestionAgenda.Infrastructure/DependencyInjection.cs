using System.Text;
using GestionAgenda.Application;
using GestionAgenda.Application.Services.Interfaces;
using GestionAgenda.Domain.Interfaces;
using GestionAgenda.Infrastructure.Context;
using GestionAgenda.Infrastructure.Notifications;
using GestionAgenda.Infrastructure.Options;
using GestionAgenda.Infrastructure.Repositories;
using GestionAgenda.Infrastructure.Migrations;
using GestionAgenda.Infrastructure.Seeding;
using GestionAgenda.Infrastructure.Services;
using GestionAgenda.Infrastructure.Synchronisation;
using Hangfire;
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
        services.AddScoped<ITableauAssistanteRepository, TableauAssistanteRepository>();
        services.AddScoped<Application.Services.Interfaces.ITableauAssistanteService, TableauAssistanteService>();
        services.AddScoped<IReferentielRepository, ReferentielRepository>();
        services.AddScoped<Application.Services.Interfaces.IReferentielService, ReferentielService>();
        services.AddScoped<Application.Services.Interfaces.IAuthService, AuthService>();
        services.AddScoped<IIndisponibiliteRepository, IndisponibiliteRepository>();
        services.AddScoped<Application.Services.Interfaces.IIndisponibiliteService, IndisponibiliteService>();
        services.Configure<GoogleSheetsOptions>(configuration.GetSection(GoogleSheetsOptions.SectionName));
        services.AddScoped<ISynchronisationAgenda, EnfileurSynchronisationHangfire>();
        services.AddScoped<IClientFeuille, ClientGoogleSheets>();
        services.AddScoped<SynchronisationFeuille>();
        services.AddScoped<Application.Services.Interfaces.IFeuilleAgendaService, ImportFeuille>();
        services.Configure<GoogleCalendarOptions>(configuration.GetSection(GoogleCalendarOptions.SectionName));
        services.AddScoped<IClientCalendrier, ClientGoogleCalendar>();
        services.AddScoped<SynchronisationCalendrier>();
        services.AddMemoryCache();
        services.AddScoped<IDisponibilitesExternes, DisponibilitesGoogle>();
        services.AddScoped<Application.Services.Interfaces.IAgendaGoogleService, ServiceAgendaGoogle>();
        services.AddScoped<DevDataSeeder>();
        services.AddScoped<GenerateurScriptsMigration>();
        services.AddApplication();
        AjouterNotifications(services, configuration, connectionString);
        AjouterJwt(services, configuration);
        return services;
    }

    private static void AjouterNotifications(
        IServiceCollection services,
        IConfiguration configuration,
        string connectionString)
    {
        services.Configure<NotificationsOptions>(configuration.GetSection(NotificationsOptions.SectionName));
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<NotificationsDemande>();
        services.AddScoped<INotificationsDemande, NotificationsAvecSynchronisation>();
        services.AddScoped<ICentreNotifications, CentreNotifications>();
        services.AddScoped<IEnvoiEmail, EnvoiEmailSmtp>();
        services.AddScoped<IEnvoiPush, EnvoiPushNavigateur>();
        services.AddScoped<IEnfileurNotification, EnfileurHangfire>();
        services.AddScoped<DiffuseurNotification>();
        services.AddScoped<RappelsRencontre>();
        services.AddSignalR();
        services.AddHangfire(options => options.UseSqlServerStorage(connectionString));
        if (configuration.GetValue("Hangfire:Actif", true))
        {
            services.AddHangfireServer();
        }
    }

    private static void AjouterJwt(IServiceCollection services, IConfiguration configuration)
    {
        var secret = configuration["Jwt:Secret"];
        if (string.IsNullOrWhiteSpace(secret) || secret.Length < 32)
        {
            throw new InvalidOperationException("Jwt:Secret doit contenir au moins 32 caractères.");
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
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = contexte =>
                    {
                        var jeton = contexte.Request.Query["access_token"];
                        if (!string.IsNullOrEmpty(jeton) && contexte.HttpContext.Request.Path.StartsWithSegments("/hubs"))
                        {
                            contexte.Token = jeton;
                        }

                        return Task.CompletedTask;
                    },
                };
            });
    }
}
