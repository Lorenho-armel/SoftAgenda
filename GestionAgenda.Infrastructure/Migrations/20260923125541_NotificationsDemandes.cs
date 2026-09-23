using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionAgenda.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class NotificationsDemandes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AbonnementsPush",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UtilisateurId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Endpoint = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    CleP256dh = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Auth = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DateCreation = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    DateModification = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AbonnementsPush", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AbonnementsPush_Utilisateurs_UtilisateurId",
                        column: x => x.UtilisateurId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DestinataireId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Titre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    DemandeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Evenement = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    DateCreation = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    DateModification = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_DemandeRencontres_DemandeId",
                        column: x => x.DemandeId,
                        principalTable: "DemandeRencontres",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notifications_Utilisateurs_DestinataireId",
                        column: x => x.DestinataireId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AbonnementsPush_Endpoint",
                table: "AbonnementsPush",
                column: "Endpoint",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AbonnementsPush_UtilisateurId",
                table: "AbonnementsPush",
                column: "UtilisateurId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_DemandeId",
                table: "Notifications",
                column: "DemandeId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_DestinataireId_DateCreation",
                table: "Notifications",
                columns: new[] { "DestinataireId", "DateCreation" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AbonnementsPush");

            migrationBuilder.DropTable(
                name: "Notifications");
        }
    }
}
