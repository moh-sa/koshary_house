import type { Order as OrderRow, OrderItem as OrderItemRow, Product as ProductRow } from "@food/db";
import type { Order, OrderItem, Product } from "@food/contract";

export function toProductDTO(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.nameEn,
    nameAr: row.nameAr,
    descEn: row.descEn,
    descAr: row.descAr,
    priceCents: row.priceCents,
    imageUrl: row.imageUrl,
    categoryId: row.categoryId,
    isAvailable: row.isAvailable,
  };
}

export function toOrderItemDTO(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    productId: row.productId,
    nameEn: row.nameEn,
    nameAr: row.nameAr,
    unitPriceCents: row.unitPriceCents,
    quantity: row.quantity,
  };
}

export function toOrderDTO(row: OrderRow & { items: OrderItemRow[] }): Order {
  return {
    id: row.id,
    status: row.status,
    paymentMethod: row.paymentMethod,
    paymentStatus: row.paymentStatus,
    subtotalCents: row.subtotalCents,
    deliveryFeeCents: row.deliveryFeeCents,
    totalCents: row.totalCents,
    contactName: row.contactName,
    phone: row.phone,
    street: row.street,
    city: row.city,
    notes: row.notes,
    createdAt: row.createdAt,
    items: row.items.map(toOrderItemDTO),
  };
}
