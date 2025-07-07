namespace EcoFashion.Application.DTOs.User
{
    public class UserRoleModel
    {
        public int RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
