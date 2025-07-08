# Hệ thống Notification - EcoFashion

## Tổng quan

Hệ thống notification cung cấp các component để hiển thị thông báo lỗi, thành công và thông tin một cách nhất quán trên toàn bộ ứng dụng.

## Components

### 1. ErrorDisplay

Hiển thị thông báo lỗi với tự động phân loại theo mã lỗi.

```tsx
import { ErrorDisplay } from "@/components/common";

<ErrorDisplay
  error={error}
  onClose={clearError}
  variant="inline" // hoặc "snackbar"
  showCloseButton={true}
/>;
```

**Props:**

- `error`: ApiError | null - Object lỗi với code và message
- `onClose?`: () => void - Callback khi đóng thông báo
- `variant?`: "inline" | "snackbar" - Kiểu hiển thị (mặc định: "inline")
- `autoHideDuration?`: number - Thời gian tự ẩn cho snackbar (mặc định: 6000ms)
- `showCloseButton?`: boolean - Hiển thị nút đóng (mặc định: true)
- `sx?`: object - Custom style

### 2. SuccessDisplay

Hiển thị thông báo thành công.

```tsx
import { SuccessDisplay } from "@/components/common";

<SuccessDisplay
  message="Đăng nhập thành công!"
  onClose={clearSuccess}
  variant="snackbar"
  title="Thành công"
/>;
```

**Props:**

- `message`: string | null - Nội dung thông báo
- `onClose?`: () => void - Callback khi đóng thông báo
- `variant?`: "inline" | "snackbar" - Kiểu hiển thị (mặc định: "inline")
- `autoHideDuration?`: number - Thời gian tự ẩn (mặc định: 4000ms)
- `title?`: string - Tiêu đề thông báo
- `showCloseButton?`: boolean - Hiển thị nút đóng (mặc định: true)
- `sx?`: object - Custom style

### 3. InfoDisplay

Hiển thị thông báo thông tin hoặc cảnh báo.

```tsx
import { InfoDisplay } from "@/components/common";

<InfoDisplay
  message="Mã OTP đã được gửi đến email"
  severity="info" // hoặc "warning"
  variant="inline"
/>;
```

**Props:**

- `message`: string | null - Nội dung thông báo
- `severity?`: "info" | "warning" - Mức độ nghiêm trọng (mặc định: "info")
- `onClose?`: () => void - Callback khi đóng thông báo
- `variant?`: "inline" | "snackbar" - Kiểu hiển thị (mặc định: "inline")
- `autoHideDuration?`: number - Thời gian tự ẩn (mặc định: 5000ms)
- `title?`: string - Tiêu đề thông báo
- `showCloseButton?`: boolean - Hiển thị nút đóng (mặc định: true)
- `sx?`: object - Custom style

### 4. NotificationProvider

Provider để quản lý thông báo toàn ứng dụng.

```tsx
import { NotificationProvider } from "@/components/common";

function App() {
  return (
    <NotificationProvider variant="snackbar">
      {/* Your app components */}
    </NotificationProvider>
  );
}
```

### 5. useNotification Hook

Hook để sử dụng hệ thống thông báo toàn cục.

```tsx
import { useNotification } from "@/components/common";

function MyComponent() {
  const notification = useNotification();

  const handleError = () => {
    notification.showError({
      code: "INVALID_CREDENTIALS",
      message: "Email hoặc mật khẩu không đúng",
    });
  };

  const handleSuccess = () => {
    notification.showSuccess("Đăng nhập thành công!");
  };

  const handleInfo = () => {
    notification.showInfo("Mã OTP đã được gửi", undefined, "info");
  };

  return (
    <div>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleInfo}>Show Info</button>
      <button onClick={notification.clearAll}>Clear All</button>
    </div>
  );
}
```

## Error Codes

Hệ thống hỗ trợ các mã lỗi sau và sẽ tự động hiển thị tiêu đề và mức độ nghiêm trọng phù hợp:

### Authentication

- `INVALID_CREDENTIALS` - Đăng nhập thất bại
- `USER_NOT_FOUND` - Tài khoản không tồn tại
- `ACCOUNT_LOCKED` - Tài khoản bị khóa
- `TOKEN_EXPIRED` - Phiên đăng nhập hết hạn
- `UNAUTHORIZED` - Không có quyền truy cập

### OTP/Verification

- `INVALID_OTP` - Mã OTP không hợp lệ
- `OTP_EXPIRED` - Mã OTP đã hết hạn
- `OTP_LIMIT_EXCEEDED` - Đã vượt quá số lần nhập OTP

### Registration

- `EMAIL_EXISTS` - Email đã tồn tại
- `USERNAME_EXISTS` - Tên đăng nhập đã tồn tại
- `PHONE_EXISTS` - Số điện thoại đã tồn tại

### Validation

- `VALIDATION_ERROR` - Dữ liệu không hợp lệ
- `REQUIRED_FIELD_MISSING` - Thiếu thông tin bắt buộc
- `INVALID_EMAIL_FORMAT` - Định dạng email không hợp lệ
- `WEAK_PASSWORD` - Mật khẩu không đủ mạnh

### Network/Server

- `NETWORK_ERROR` - Lỗi kết nối mạng
- `SERVER_ERROR` - Lỗi máy chủ
- `SERVICE_UNAVAILABLE` - Dịch vụ tạm thời không khả dụng
- `TIMEOUT` - Quá thời gian chờ

### Business Logic

- `INSUFFICIENT_BALANCE` - Số dư không đủ
- `ORDER_NOT_FOUND` - Không tìm thấy đơn hàng
- `PRODUCT_OUT_OF_STOCK` - Sản phẩm hết hàng
- `DISCOUNT_EXPIRED` - Mã giảm giá đã hết hạn

## Tích hợp với useApiError

```tsx
import { useApiError } from "@/hooks/useApiError";
import { ErrorDisplay } from "@/components/common";

function LoginPage() {
  const { error, handleError, clearError } = useApiError();

  const handleLogin = async () => {
    try {
      await loginApi();
    } catch (err) {
      handleError(err); // Tự động parse và set error
    }
  };

  return (
    <div>
      <ErrorDisplay error={error} onClose={clearError} />
      {/* Login form */}
    </div>
  );
}
```

## Best Practices

1. **Sử dụng inline cho form validation errors**
2. **Sử dụng snackbar cho thông báo toàn cục**
3. **Sử dụng NotificationProvider ở root level**
4. **Đặt error codes chuẩn để tự động mapping**
5. **Luôn cung cấp onClose callback**
6. **Sử dụng autoHideDuration phù hợp với nội dung**

## Demo

Xem `NotificationDemo.tsx` để test và tham khảo cách sử dụng tất cả các component.
