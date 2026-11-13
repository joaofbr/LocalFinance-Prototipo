using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Poupi.Infrastructure.Persistence.Migrations
{
    public partial class Households : Migration
    {
        private const string LegacyHouseholdId = "b1000000-0000-0000-0000-000000000001";

        private static readonly string[] ScopedTables = ["Users", "Categories", "Transactions"];

        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Households",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Households", x => x.Id);
                });

            foreach (var table in ScopedTables)
            {
                migrationBuilder.AddColumn<Guid>(
                    name: "HouseholdId",
                    table: table,
                    type: "uuid",
                    nullable: true);
            }

            migrationBuilder.Sql($"""
                INSERT INTO "Households" ("Id", "CreatedAt")
                SELECT '{LegacyHouseholdId}', MIN("CreatedAt") FROM "Users"
                HAVING COUNT(*) > 0;

                UPDATE "Users" SET "HouseholdId" = '{LegacyHouseholdId}';
                UPDATE "Transactions" SET "HouseholdId" = '{LegacyHouseholdId}';
                UPDATE "Categories" SET "HouseholdId" = '{LegacyHouseholdId}'
                WHERE EXISTS (SELECT 1 FROM "Households" WHERE "Id" = '{LegacyHouseholdId}');

                DELETE FROM "Categories" WHERE "HouseholdId" IS NULL;
                """);

            foreach (var table in ScopedTables)
            {
                migrationBuilder.AlterColumn<Guid>(
                    name: "HouseholdId",
                    table: table,
                    type: "uuid",
                    nullable: false,
                    oldClrType: typeof(Guid),
                    oldType: "uuid",
                    oldNullable: true);
            }

            migrationBuilder.DropIndex(
                name: "IX_Transactions_Date",
                table: "Transactions");

            migrationBuilder.CreateIndex(
                name: "IX_Users_HouseholdId",
                table: "Users",
                column: "HouseholdId");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_HouseholdId",
                table: "Categories",
                column: "HouseholdId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_HouseholdId_Date",
                table: "Transactions",
                columns: new[] { "HouseholdId", "Date" });

            foreach (var table in ScopedTables)
            {
                migrationBuilder.AddForeignKey(
                    name: $"FK_{table}_Households_HouseholdId",
                    table: table,
                    column: "HouseholdId",
                    principalTable: "Households",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            }
        }

        protected override void Down(MigrationBuilder migrationBuilder) =>
            throw new NotSupportedException(
                "Desfazer esta migration juntaria os dados de todas as contas num espaço só. "
                + "Restaure um backup anterior a ela.");
    }
}
