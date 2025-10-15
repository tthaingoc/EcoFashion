using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace EcoFashion.Infrastructure.Repositories
{
    public interface  IRepository<TEntity, in TKey>
    {
        IQueryable<TEntity> GetAll();
        IQueryable<TEntity> FindByCondition(Expression<Func<TEntity, bool>> predicate);
        Task<TEntity?> GetByIdAsync(TKey id);
        Task<TEntity> AddAsync(TEntity entity);
        TEntity Update(TEntity entity);
        TEntity Remove(TKey id);
        Task<int> Commit();
        Task<int> CountAsync();
        Task<decimal> SumAsync(Expression<Func<TEntity, bool>> predicate, Expression<Func<TEntity, decimal>> selector);
    }
}
