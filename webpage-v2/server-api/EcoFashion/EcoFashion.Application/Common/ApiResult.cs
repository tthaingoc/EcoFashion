namespace EcoFashion.Application.Common
{
    public class ApiResult<T>
    {
         public bool Success { get; set; }
        public T? Result { get; set; }
        public string? ErrorMessage { get; set; }

        public static ApiResult<T> Succeed(T? result)
        {
            return new ApiResult<T> { Success = true, Result = result };
        }

        public static ApiResult<T> Error(T? result)
        {
            return new ApiResult<T> { Success = false, Result = result };
        }

        public static ApiResult<T> Fail(Exception ex)
        {
            return new ApiResult<T>
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }

        public static ApiResult<T> Fail(string errorMessage)
        {
            return new ApiResult<T>
            {
                Success = false,
                ErrorMessage = errorMessage
            };
        }
    }
}
