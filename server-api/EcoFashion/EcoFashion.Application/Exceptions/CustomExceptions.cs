namespace EcoFashion.Application.Exceptions
{
    public class UnauthorizedException : Exception
    {
        public UnauthorizedException(string message) : base(message) { }
    }

    public class EmailNotVerifiedException : Exception
    {
        public EmailNotVerifiedException(string message) : base(message) { }
    }
}
