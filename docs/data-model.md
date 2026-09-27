User

────────────────

id
name
email
password
phoneNumber
role
createdAt
updatedAt

---
Category

────────────────

id
name
createdAt
updatedAt

---
Product

────────────────

id
categoryId
name
imageUrl
description
price
unit
stock
status
createdAt
updatedAt

---
Order

────────────────

id
userId

recipientName
recipientPhone

shippingAddressDetail
shippingProvince
shippingNote

deliveryDate
deliveryTimeSlot

paymentMethod
status
totalAmount

createdAt
updatedAt

---
OrderItem

────────────────

id
orderId
productId

productName
unitPrice
quantity
subtotal