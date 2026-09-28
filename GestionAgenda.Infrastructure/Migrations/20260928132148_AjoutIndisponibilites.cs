using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionAgenda.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AjoutIndisponibilites : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Indisponibilites",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DirigeantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SocieteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Motif = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Debut = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Fin = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AuteurId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DateCreation = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    DateModification = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Indisponibilites", x => x.Id);
                    table.CheckConstraint("CK_Indisponibilites_Creneau", "[Fin] > [Debut]");
                    table.ForeignKey(
                        name: "FK_Indisponibilites_Societes_SocieteId",
                        column: x => x.SocieteId,
                        principalTable: "Societes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Indisponibilites_Utilisateurs_AuteurId",
                        column: x => x.AuteurId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Indisponibilites_Utilisateurs_DirigeantId",
                        column: x => x.DirigeantId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Indisponibilites_AuteurId",
                table: "Indisponibilites",
                column: "AuteurId");

            migrationBuilder.CreateIndex(
                name: "IX_Indisponibilites_DirigeantId_Debut_Fin",
                table: "Indisponibilites",
                columns: new[] { "DirigeantId", "Debut", "Fin" });

            migrationBuilder.CreateIndex(
                name: "IX_Indisponibilites_SocieteId",
                table: "Indisponibilites",
                column: "SocieteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Indisponibilites");
        }
    }
}
