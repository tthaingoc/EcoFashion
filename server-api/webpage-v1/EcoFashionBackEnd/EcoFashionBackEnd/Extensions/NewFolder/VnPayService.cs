//using EcoFashionBackEnd.Dtos;
//using EcoFashionBackEnd.Dtos.Payment;
//using EcoFashionBackEnd.Helpers;

//namespace EcoFashionBackEnd.Extensions.NewFolder
//{
//    public class VnPayService : IVnPayService
//    {
//        private readonly IConfiguration _config;

//        public VnPayService(IConfiguration config)
//        {
//            _config = config;
//        }

//        /*public string CreatePaymentUrl(HttpContext context, VnPaymentRequestModel model)
//        {
//            var tick = DateTime.Now.Ticks.ToString();

//            var vnpay = new VnPayLibrary();
//            vnpay.AddRequestData("vnp_Version", _config["VnPay:Version"]);
//            vnpay.AddRequestData("vnp_Command", _config["VnPay:Command"]);
//            vnpay.AddRequestData("vnp_TmnCode", _config["VnPay:TmnCode"]);
//            vnpay.AddRequestData("vnp_Amount", (model.Amount * 100).ToString()); //Số tiền thanh toán. Số tiền không mang các ký tự phân tách thập phân, phần nghìn, ký tự tiền tệ. Để gửi số tiền thanh toán là 100,000 VND (một trăm nghìn VNĐ) thì merchant cần nhân thêm 100 lần (khử phần thập phân), sau đó gửi sang VNPAY là: 10000000

//            vnpay.AddRequestData("vnp_CreateDate", model.CreatedDate.ToString("yyyyMMddHHmmss"));
//            vnpay.AddRequestData("vnp_CurrCode", _config["VnPay:CurrCode"]);
//            vnpay.AddRequestData("vnp_IpAddr", Utils.GetIpAddress(context));
//            vnpay.AddRequestData("vnp_Locale", _config["VnPay:Locale"]);

//            vnpay.AddRequestData("vnp_OrderInfo", "Thanh toán cho đơn hàng:" + model.OrderId);
//            vnpay.AddRequestData("vnp_OrderType", "other"); //default value: other
//            vnpay.AddRequestData("vnp_ReturnUrl", _config["VnPay:PaymentBackReturnUrl"]);

//            vnpay.AddRequestData("vnp_TxnRef", tick); // Mã tham chiếu của giao dịch tại hệ thống của merchant. Mã này là duy nhất dùng để phân biệt các đơn hàng gửi sang VNPAY. Không được trùng lặp trong ngày

//            var paymentUrl = vnpay.CreateRequestUrl(_config["VnPay:BaseUrl"], _config["VnPay:HashSecret"]);

//            return paymentUrl;
//        }
//*/
//        public string CreatePaymentUrl(HttpContext context, VnPaymentRequestModel model)
//        {
//            var tick = DateTime.Now.Ticks.ToString();

//            var vnpay = new VnPayLibrary();

//            // Log the incoming payment request
//            Console.WriteLine($"Creating payment URL for OrderId: {model.OrderId}, Amount: {model.Amount}");

//            vnpay.AddRequestData("vnp_Version", _config["VnPay:Version"]);
//            vnpay.AddRequestData("vnp_Command", _config["VnPay:Command"]);
//            vnpay.AddRequestData("vnp_TmnCode", _config["VnPay:TmnCode"]);
//            vnpay.AddRequestData("vnp_Amount", (model.Amount * 100).ToString()); // Ensure correct amount format

//            vnpay.AddRequestData("vnp_CreateDate", model.CreatedDate.ToString("yyyyMMddHHmmss"));
//            vnpay.AddRequestData("vnp_CurrCode", _config["VnPay:CurrCode"]);
//            vnpay.AddRequestData("vnp_IpAddr", Utils.GetIpAddress(context));
//            vnpay.AddRequestData("vnp_Locale", _config["VnPay:Locale"]);
//            vnpay.AddRequestData("vnp_OrderInfo", $"Thanh toán cho đơn hàng: {model.OrderId}");
//            vnpay.AddRequestData("vnp_OrderType", "other");
//            vnpay.AddRequestData("vnp_ReturnUrl", _config["VnPay:PaymentBackReturnUrl"]);
//            vnpay.AddRequestData("vnp_TxnRef", tick); // Unique transaction reference

//            var paymentUrl = vnpay.CreateRequestUrl(_config["VnPay:BaseUrl"], _config["VnPay:HashSecret"]);

//            // Log the payment URL for verification
//            Console.WriteLine($"Generated payment URL: {paymentUrl}");

//            return paymentUrl;
//        }



//        public VnPaymentResponseModel PaymentExecute(IQueryCollection collections)
//        {
//            var vnpay = new VnPayLibrary();
//            foreach (var (key, value) in collections)
//            {
//                if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
//                {
//                    vnpay.AddResponseData(key, value.ToString());
//                }
//            }

//            // Extract transaction details
//            var vnp_OrderInfo = vnpay.GetResponseData("vnp_OrderInfo");
//            var vnp_TransactionIdString = vnpay.GetResponseData("vnp_TransactionNo").ToString();
//            var vnp_AmountString = vnpay.GetResponseData("vnp_Amount"); // Extract amount from response

//            // Extract OrderId from vnp_OrderInfo
//            var vnp_orderIdString = vnp_OrderInfo?.Split(':').LastOrDefault()?.Trim(); // Assuming OrderId is after the last colon

//            // Convert them to long or int only when needed
//            long vnp_TransactionId = Convert.ToInt64(vnp_TransactionIdString);
//            long vnp_Amount = Convert.ToInt64(vnp_AmountString); // Convert amount to long

//            var vnp_SecureHash = collections.FirstOrDefault(p => p.Key == "vnp_SecureHash").Value;
//            var vnp_ResponseCode = vnpay.GetResponseData("vnp_ResponseCode");

//            // Check the response code for success
//            if (vnp_ResponseCode != "00")
//            {
//                // Handle unsuccessful payment, possibly perform a rollback here
//                return new VnPaymentResponseModel
//                {
//                    Success = false,
//                    Message = "Payment failed. Response code: " + vnp_ResponseCode
//                };
//            }

//            // Validate the secure hash
//            bool checkSignature = vnpay.ValidateSignature(vnp_SecureHash, _config["VnPay:HashSecret"]);
//            if (!checkSignature)
//            {
//                return new VnPaymentResponseModel
//                {
//                    Success = false,
//                    Message = "Invalid signature."
//                };
//            }

//            return new VnPaymentResponseModel
//            {
//                Success = true,
//                PaymentMethod = "VnPay",
//                OrderDescription = vnp_OrderInfo,
//                OrderId = vnp_orderIdString, // Use the correctly extracted OrderId
//                TransactionId = vnp_TransactionIdString, // Keep it as string
//                Amount = vnp_Amount, // Include the amount in the response
//                Token = vnp_SecureHash,
//                VnPayResponseCode = vnp_ResponseCode
//            };
//        }




//    }
//}
