using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Poupi.Infrastructure.Persistence.Migrations
{
    public partial class HouseholdApproval : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Households",
                type: "character varying(12)",
                maxLength: 12,
                nullable: false,
                defaultValue: "Active");

            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedAt",
                table: "Households",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ApprovedBy",
                table: "Households",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql("""UPDATE "Households" SET "ApprovedAt" = "CreatedAt";""");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "Households");

            migrationBuilder.DropColumn(
                name: "ApprovedAt",
                table: "Households");

            migrationBuilder.DropColumn(
                name: "ApprovedBy",
                table: "Households");
        }
    }
}
