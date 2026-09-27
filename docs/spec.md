# Farm Ecommerce Specification

## 1. Objective

Xây dựng website thương mại điện tử bán nông sản.

## 2. Customer Features

### Product
- Xem danh sách sản phẩm
- Xem chi tiết sản phẩm

### Cart
- Thêm sản phẩm vào giỏ
- Thay đổi số lượng
- Xóa sản phẩm khỏi giỏ

### Checkout
- Nhập thông tin nhận hàng
- Xác nhận đơn hàng
- Kiểm tra tồn kho
- Tạo đơn hàng

### Order
- Xem lịch sử đơn hàng
- Xem trạng thái đơn hàng

## 3. Admin Features

### Authentication
- Admin đăng nhập

### Product Management
- Xem sản phẩm
- Thêm sản phẩm
- Sửa sản phẩm
- Ngừng bán sản phẩm

### Order Management
- Xem danh sách đơn hàng
- Xem chi tiết đơn hàng
- Cập nhật trạng thái đơn hàng

## 4. Optional Features

- Bán theo cân, điều chỉnh sau khi cân thực tế

## 5. Order flow
PENDING → CONFIRMED → DELIVERING → COMPLETED (và PENDING -> CANCELLED).


## 6. Out of Scope

- Real payment gateway
- Shipping provider integration
- Multi-vendor
- Microservices