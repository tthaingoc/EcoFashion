using EcoFashion.Domain.Entities;
using EcoFashion.Domain.Interfaces;
using EcoFashion.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EcoFashion.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly EcoFashionDbContext _context;

        public UserRepository(EcoFashionDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            var user = await _context.Users
                .Include(u => u.UserRole)
                .FirstOrDefaultAsync(u => u.Email == email);
            
            // Debug log
            if (user != null)
            {
                Console.WriteLine($"User found: {user.Email}, RoleId: {user.RoleId}, Role: {user.UserRole?.RoleName ?? "NULL"}");
            }
            
            return user;
        }

        public async Task<User?> GetByIdAsync(int userId)
        {
            return await _context.Users
                .Include(u => u.UserRole)
                .FirstOrDefaultAsync(u => u.UserId == userId);
        }

        public async Task<User> CreateAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User> UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task DeleteAsync(int userId)
        {
            var user = await GetByIdAsync(userId);
            if (user != null)
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int userId)
        {
            return await _context.Users.AnyAsync(u => u.UserId == userId);
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }

        public async Task<bool> UsernameExistsAsync(string username)
        {
            return await _context.Users.AnyAsync(u => u.Username == username);
        }
    }
}
