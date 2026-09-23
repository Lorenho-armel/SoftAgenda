using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionAgenda.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AjoutDemandesRencontre : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Societes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nom = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DateCreation = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    DateModification = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Societes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Utilisateurs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nom = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Prenom = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    MotDePasseHash = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DateCreation = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    DateModification = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Utilisateurs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Salles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SocieteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nom = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Capacite = table.Column<int>(type: "int", nullable: false),
                    EstActive = table.Column<bool>(type: "bit", nullable: false),
                    DateCreation = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    DateModification = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Salles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Salles_Societes_SocieteId",
                        column: x => x.SocieteId,
                        principalTable: "Societes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AffectationAssistantes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AssistanteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DirigeantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SocieteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EstActive = table.Column<bool>(type: "bit", nullable: false),
                    DateCreation = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    DateModification = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AffectationAssistantes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AffectationAssistantes_Societes_SocieteId",
                        column: x => x.SocieteId,
                        principalTable: "Societes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AffectationAssistantes_Utilisateurs_AssistanteId",
                        column: x => x.AssistanteId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AffectationAssistantes_Utilisateurs_DirigeantId",
                        column: x => x.DirigeantId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UtilisateurId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TokenHash = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    ExpireLe = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    RevoqueLe = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    RemplaceParHash = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    DateCreation = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    DateModification = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_Utilisateurs_UtilisateurId",
                        column: x => x.UtilisateurId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UtilisateurSocietes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UtilisateurId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SocieteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DateCreation = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    DateModification = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UtilisateurSocietes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UtilisateurSocietes_Societes_SocieteId",
                        column: x => x.SocieteId,
                        principalTable: "Societes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UtilisateurSocietes_Utilisateurs_UtilisateurId",
                        column: x => x.UtilisateurId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DemandeRencontres",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DemandeurId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DirigeantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SocieteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Motif = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DateDebutSouhaitee = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    DateFinSouhaitee = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    DureeMinutes = table.Column<int>(type: "int", nullable: false),
                    Urgence = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Priorite = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Statut = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    SalleSouhaiteeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DateCreation = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    DateModification = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DemandeRencontres", x => x.Id);
                    table.CheckConstraint("CK_Demande_ActeursDistincts", "[DemandeurId] <> [DirigeantId]");
                    table.CheckConstraint("CK_Demande_Duree", "[DureeMinutes] >= 15 AND [DureeMinutes] <= 480");
                    table.CheckConstraint("CK_Demande_Periode", "[DateFinSouhaitee] > [DateDebutSouhaitee]");
                    table.ForeignKey(
                        name: "FK_DemandeRencontres_Salles_SalleSouhaiteeId",
                        column: x => x.SalleSouhaiteeId,
                        principalTable: "Salles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DemandeRencontres_Societes_SocieteId",
                        column: x => x.SocieteId,
                        principalTable: "Societes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DemandeRencontres_Utilisateurs_DemandeurId",
                        column: x => x.DemandeurId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DemandeRencontres_Utilisateurs_DirigeantId",
                        column: x => x.DirigeantId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DemandeParticipants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DemandeRencontreId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UtilisateurId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    NomComplet = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    DateCreation = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    DateModification = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DemandeParticipants", x => x.Id);
                    table.CheckConstraint("CK_Participant_Identite", "([UtilisateurId] IS NOT NULL AND [NomComplet] IS NULL AND [Email] IS NULL) OR ([UtilisateurId] IS NULL AND [NomComplet] IS NOT NULL AND [Email] IS NOT NULL)");
                    table.ForeignKey(
                        name: "FK_DemandeParticipants_DemandeRencontres_DemandeRencontreId",
                        column: x => x.DemandeRencontreId,
                        principalTable: "DemandeRencontres",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DemandeParticipants_Utilisateurs_UtilisateurId",
                        column: x => x.UtilisateurId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HistoriqueDemandes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DemandeRencontreId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AuteurId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TypeEvenement = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Commentaire = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    StatutAvant = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    StatutApres = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    UrgenceAvant = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    UrgenceApres = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    PrioriteAvant = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    PrioriteApres = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    DateDebutAvant = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DateDebutApres = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DateFinAvant = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DateFinApres = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    SalleAvantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SalleApresId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RendezVousId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ReunionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DateCreation = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    DateModification = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoriqueDemandes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HistoriqueDemandes_DemandeRencontres_DemandeRencontreId",
                        column: x => x.DemandeRencontreId,
                        principalTable: "DemandeRencontres",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HistoriqueDemandes_Utilisateurs_AuteurId",
                        column: x => x.AuteurId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RendezVous",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DirigeantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SocieteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DemandeRencontreId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SalleId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Debut = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Fin = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Titre = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Statut = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DateCreation = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    DateModification = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RendezVous", x => x.Id);
                    table.CheckConstraint("CK_RendezVous_Creneau", "[Fin] > [Debut]");
                    table.ForeignKey(
                        name: "FK_RendezVous_DemandeRencontres_DemandeRencontreId",
                        column: x => x.DemandeRencontreId,
                        principalTable: "DemandeRencontres",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RendezVous_Salles_SalleId",
                        column: x => x.SalleId,
                        principalTable: "Salles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Reunions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DirigeantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SocieteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DemandeRencontreId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SalleId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Debut = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Fin = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Titre = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Statut = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DateCreation = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    DateModification = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reunions", x => x.Id);
                    table.CheckConstraint("CK_Reunion_Creneau", "[Fin] > [Debut]");
                    table.ForeignKey(
                        name: "FK_Reunions_DemandeRencontres_DemandeRencontreId",
                        column: x => x.DemandeRencontreId,
                        principalTable: "DemandeRencontres",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reunions_Salles_SalleId",
                        column: x => x.SalleId,
                        principalTable: "Salles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AffectationAssistantes_AssistanteId_DirigeantId_SocieteId",
                table: "AffectationAssistantes",
                columns: new[] { "AssistanteId", "DirigeantId", "SocieteId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AffectationAssistantes_DirigeantId",
                table: "AffectationAssistantes",
                column: "DirigeantId");

            migrationBuilder.CreateIndex(
                name: "IX_AffectationAssistantes_SocieteId",
                table: "AffectationAssistantes",
                column: "SocieteId");

            migrationBuilder.CreateIndex(
                name: "IX_DemandeParticipants_DemandeRencontreId_Email",
                table: "DemandeParticipants",
                columns: new[] { "DemandeRencontreId", "Email" },
                unique: true,
                filter: "[Email] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_DemandeParticipants_DemandeRencontreId_UtilisateurId",
                table: "DemandeParticipants",
                columns: new[] { "DemandeRencontreId", "UtilisateurId" },
                unique: true,
                filter: "[UtilisateurId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_DemandeParticipants_UtilisateurId",
                table: "DemandeParticipants",
                column: "UtilisateurId");

            migrationBuilder.CreateIndex(
                name: "IX_DemandeRencontres_DemandeurId_Statut",
                table: "DemandeRencontres",
                columns: new[] { "DemandeurId", "Statut" });

            migrationBuilder.CreateIndex(
                name: "IX_DemandeRencontres_DirigeantId_DateDebutSouhaitee",
                table: "DemandeRencontres",
                columns: new[] { "DirigeantId", "DateDebutSouhaitee" });

            migrationBuilder.CreateIndex(
                name: "IX_DemandeRencontres_SalleSouhaiteeId",
                table: "DemandeRencontres",
                column: "SalleSouhaiteeId");

            migrationBuilder.CreateIndex(
                name: "IX_DemandeRencontres_SocieteId_DirigeantId_Statut",
                table: "DemandeRencontres",
                columns: new[] { "SocieteId", "DirigeantId", "Statut" });

            migrationBuilder.CreateIndex(
                name: "IX_HistoriqueDemandes_AuteurId",
                table: "HistoriqueDemandes",
                column: "AuteurId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoriqueDemandes_DemandeRencontreId_DateCreation",
                table: "HistoriqueDemandes",
                columns: new[] { "DemandeRencontreId", "DateCreation" });

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_TokenHash",
                table: "RefreshTokens",
                column: "TokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UtilisateurId",
                table: "RefreshTokens",
                column: "UtilisateurId");

            migrationBuilder.CreateIndex(
                name: "IX_RendezVous_DemandeRencontreId",
                table: "RendezVous",
                column: "DemandeRencontreId",
                unique: true,
                filter: "[DemandeRencontreId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_RendezVous_DirigeantId_Debut_Fin",
                table: "RendezVous",
                columns: new[] { "DirigeantId", "Debut", "Fin" });

            migrationBuilder.CreateIndex(
                name: "IX_RendezVous_SalleId_Debut_Fin",
                table: "RendezVous",
                columns: new[] { "SalleId", "Debut", "Fin" });

            migrationBuilder.CreateIndex(
                name: "IX_Reunions_DemandeRencontreId",
                table: "Reunions",
                column: "DemandeRencontreId",
                unique: true,
                filter: "[DemandeRencontreId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Reunions_DirigeantId_Debut_Fin",
                table: "Reunions",
                columns: new[] { "DirigeantId", "Debut", "Fin" });

            migrationBuilder.CreateIndex(
                name: "IX_Reunions_SalleId_Debut_Fin",
                table: "Reunions",
                columns: new[] { "SalleId", "Debut", "Fin" });

            migrationBuilder.CreateIndex(
                name: "IX_Salles_SocieteId",
                table: "Salles",
                column: "SocieteId");

            migrationBuilder.CreateIndex(
                name: "IX_Utilisateurs_Email",
                table: "Utilisateurs",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UtilisateurSocietes_SocieteId",
                table: "UtilisateurSocietes",
                column: "SocieteId");

            migrationBuilder.CreateIndex(
                name: "IX_UtilisateurSocietes_UtilisateurId_SocieteId_Role",
                table: "UtilisateurSocietes",
                columns: new[] { "UtilisateurId", "SocieteId", "Role" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AffectationAssistantes");

            migrationBuilder.DropTable(
                name: "DemandeParticipants");

            migrationBuilder.DropTable(
                name: "HistoriqueDemandes");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "RendezVous");

            migrationBuilder.DropTable(
                name: "Reunions");

            migrationBuilder.DropTable(
                name: "UtilisateurSocietes");

            migrationBuilder.DropTable(
                name: "DemandeRencontres");

            migrationBuilder.DropTable(
                name: "Salles");

            migrationBuilder.DropTable(
                name: "Utilisateurs");

            migrationBuilder.DropTable(
                name: "Societes");
        }
    }
}
