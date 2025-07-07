using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace EcoFashion.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            // AutoMapper
            services.AddAutoMapper(Assembly.GetExecutingAssembly());

            return services;
        }
    }
}
