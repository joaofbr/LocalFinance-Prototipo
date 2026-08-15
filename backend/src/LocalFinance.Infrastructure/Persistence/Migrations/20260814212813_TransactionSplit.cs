using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LocalFinance.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class TransactionSplit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SplitTotal",
                table: "Transactions",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SplitTotal",
                table: "Transactions");
        }
    }
}
