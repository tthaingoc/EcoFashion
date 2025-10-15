namespace EcoFashion.Application.DTOs.User
{
    public class UserModel
    {
        public int UserId { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Username { get; set; }
        public string? FullName { get; set; }
        public int RoleId { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime LastUpdatedAt { get; set; }
    }
}
