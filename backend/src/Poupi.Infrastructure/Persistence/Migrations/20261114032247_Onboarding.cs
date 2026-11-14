using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Poupi.Infrastructure.Persistence.Migrations
{
    public partial class Onboarding : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ChecklistDismissedAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FamilyGuideDismissedAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FamilyGuideStartedAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "WelcomeSeenAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE "Users" SET "WelcomeSeenAt" = now(), "ChecklistDismissedAt" = now();
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ChecklistDismissedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FamilyGuideDismissedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FamilyGuideStartedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "WelcomeSeenAt",
                table: "Users");
        }
    }
}
