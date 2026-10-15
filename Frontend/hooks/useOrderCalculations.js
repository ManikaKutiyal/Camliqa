import { useMemo, useEffect } from "react";

/**
 * Shared hook to compute all order calculations reliably.
 * Ensure to pass numerical values.
 */
export function useOrderCalculations({
  cartItems = [],
  appliedCoupon = null,
  shippingMethod = "standard",
  taxRate = 0.15,
}) {
  return useMemo(() => {
    // 1. Calculate Subtotal
    const subtotal = cartItems.reduce((sum, item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 0);
      return sum + price * qty;
    }, 0);
    const numericSubtotal = Number(subtotal.toFixed(2));

    // 2. Base Shipping
    let baseShipping = 0;
    if (numericSubtotal > 0) {
      baseShipping = shippingMethod === "express" ? 120 : 45;
    }

    // 3. Coupon Discount
    let couponDiscount = 0;
    if (appliedCoupon && numericSubtotal > 0) {
      if (appliedCoupon.dealType === "free_shipping") {
        couponDiscount = baseShipping;
      } else if (appliedCoupon.dealType === "fixed_amount") {
        couponDiscount = Number(appliedCoupon.discountAmount || 0);
      } else {
        // Percentage discount
        const pct = Number(appliedCoupon.discountPercent || 0);
        let discount = (numericSubtotal * pct) / 100;
        
        // Enforce maximum discount if specified
        if (appliedCoupon.maxDiscountAmount && appliedCoupon.maxDiscountAmount > 0) {
          discount = Math.min(discount, appliedCoupon.maxDiscountAmount);
        }
        couponDiscount = discount;
      }
    }

    // Ensure discount doesn't exceed subtotal
    const finalDiscount = Number(Math.min(numericSubtotal, couponDiscount).toFixed(2));

    // 4. Shipping Amount
    const shipping = appliedCoupon?.dealType === "free_shipping" ? 0 : baseShipping;

    // 5. Tax Calculation
    const taxableAmount = Math.max(0, numericSubtotal - finalDiscount);
    const tax = Number((taxableAmount * taxRate).toFixed(2));

    // 6. Final Total
    const total = Number((taxableAmount + tax + shipping).toFixed(2));

    return {
      subtotal: numericSubtotal,
      couponDiscount: finalDiscount,
      shipping,
      baseShipping,
      taxableAmount: Number(taxableAmount.toFixed(2)),
      tax,
      total,
    };
  }, [cartItems, appliedCoupon, shippingMethod, taxRate]);
}
