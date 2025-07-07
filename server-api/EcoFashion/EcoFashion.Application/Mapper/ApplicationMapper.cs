using AutoMapper;
using EcoFashion.Domain.Entities;
using EcoFashion.Application.DTOs.Auth;
using EcoFashion.Application.DTOs.User;

namespace EcoFashion.Application.Mapper
{
    public class ApplicationMapper : Profile
    {
        public ApplicationMapper()
        {
            // User mappings - Đơn giản như v1
            CreateMap<User, UserInfo>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.UserRole != null ? src.UserRole.RoleName : "Customer"));

            CreateMap<UserRole, UserRoleModel>().ReverseMap();
            
            // Chỉ mapping những gì thực sự cần thiết
        }
    }
}
