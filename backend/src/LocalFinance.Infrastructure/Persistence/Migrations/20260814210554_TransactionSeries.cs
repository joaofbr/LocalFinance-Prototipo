using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LocalFinance.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class TransactionSeries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "InstallmentTotal",
                table: "Transactions",
                newName: "SeriesTotal");

            migrationBuilder.RenameColumn(
                name: "InstallmentNumber",
                table: "Transactions",
                newName: "SeriesIndex");

            migrationBuilder.RenameColumn(
                name: "InstallmentGroupId",
                table: "Transactions",
                newName: "SeriesId");

            migrationBuilder.RenameIndex(
                name: "IX_Transactions_InstallmentGroupId",
                table: "Transactions",
                newName: "IX_Transactions_SeriesId");

            migrationBuilder.AddColumn<string>(
                name: "SeriesKind",
                table: "Transactions",
                type: "character varying(12)",
                maxLength: 12,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SeriesKind",
                table: "Transactions");

            migrationBuilder.RenameColumn(
                name: "SeriesTotal",
                table: "Transactions",
                newName: "InstallmentTotal");

            migrationBuilder.RenameColumn(
                name: "SeriesIndex",
                table: "Transactions",
                newName: "InstallmentNumber");

            migrationBuilder.RenameColumn(
                name: "SeriesId",
                table: "Transactions",
                newName: "InstallmentGroupId");

            migrationBuilder.RenameIndex(
                name: "IX_Transactions_SeriesId",
                table: "Transactions",
                newName: "IX_Transactions_InstallmentGroupId");
        }
    }
}
