### Order Statuses

| Status       | Ý nghĩa                             |
| ------------ | ----------------------------------- |
| `PENDING`    | Đơn vừa được tạo, đang chờ xác nhận |
| `CONFIRMED`  | Admin đã xác nhận đơn               |
| `DELIVERING` | Đơn đang được giao                  |
| `COMPLETED`  | Giao hàng thành công                |
| `CANCELLED`  | Đơn bị hủy                          |

### State Diagram
PENDING
├── CONFIRMED
└── CANCELLED

CONFIRMED
└── DELIVERING

DELIVERING
└── COMPLETED

### Allowed Transitions
| Current    | Next       | Allowed |
| ---------- | ---------- | ------- |
| PENDING    | CONFIRMED  | ✅       |
| PENDING    | CANCELLED  | ✅       |
| CONFIRMED  | DELIVERING | ✅       |
| DELIVERING | COMPLETED  | ✅       |
| PENDING    | DELIVERING | ❌       |
| PENDING    | COMPLETED  | ❌       |
| CONFIRMED  | COMPLETED  | ❌       |
| CONFIRMED  | CANCELLED  | ❌       |
| DELIVERING | CANCELLED  | ❌       |
| COMPLETED  | *any*      | ❌       |
| CANCELLED  | *any*      | ❌       |

### Business rules
1. New orders always start with PENDING.
2. Only PENDING orders can be confirmed.
3. PENDING orders can be cancelled.
4. CONFIRMED orders can move to DELIVERING.
5. DELIVERING orders can move to COMPLETED.
6. COMPLETED orders are immutable.
7. CANCELLED orders are immutable.
8. Client cannot directly set an arbitrary order status.
9. Only authorized admin users can change order status.