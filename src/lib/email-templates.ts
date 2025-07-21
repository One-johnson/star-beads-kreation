export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  orderTotal: number;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  trackingNumber?: string;
  carrier?: string;
  status: string;
  orderDate: string;
}

export const getOrderConfirmationEmail = (data: OrderEmailData) => ({
  subject: `Order Confirmation - #${data.orderId.slice(-8)}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
        .content { padding: 20px; }
        .order-details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-weight: bold; font-size: 18px; text-align: right; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
          <p>Thank you for your order, ${data.customerName}!</p>
        </div>
        
        <div class="content">
          <h2>Order #${data.orderId.slice(-8)}</h2>
          <p>We've received your order and are preparing it for shipment.</p>
          
          <div class="order-details">
            <h3>Order Summary</h3>
            ${data.orderItems.map(item => `
              <div class="item">
                <span>${item.name} x${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
            <div class="total">
              <strong>Total: $${data.orderTotal.toFixed(2)}</strong>
            </div>
          </div>
          
          <h3>Shipping Address</h3>
          <p>
            ${data.shippingAddress.fullName}<br>
            ${data.shippingAddress.address}<br>
            ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}
          </p>
          
          <p><strong>Order Date:</strong> ${data.orderDate}</p>
          
          <p>We'll send you another email when your order ships with tracking information.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderId}" class="button">
              View Order Details
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Star Beads Kreation!</p>
          <p>If you have any questions, please contact us at support@starbeadskreation.com</p>
        </div>
      </div>
    </body>
    </html>
  `
});

export const getOrderProcessingEmail = (data: OrderEmailData) => ({
  subject: `Order Processing - #${data.orderId.slice(-8)}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Processing</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e3f2fd; padding: 20px; text-align: center; border-radius: 8px; }
        .content { padding: 20px; }
        .status { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Order Processing</h1>
          <p>Your order is being prepared for shipment!</p>
        </div>
        
        <div class="content">
          <h2>Order #${data.orderId.slice(-8)}</h2>
          
          <div class="status">
            <h3>Status Update</h3>
            <p>Your order is now being processed and prepared for shipment. This usually takes 1-2 business days.</p>
          </div>
          
          <p>We'll notify you as soon as your order ships with tracking information.</p>
          
          <p><strong>Order Date:</strong> ${data.orderDate}</p>
          <p><strong>Total:</strong> $${data.orderTotal.toFixed(2)}</p>
        </div>
        
        <div class="footer">
          <p>Thank you for your patience!</p>
          <p>If you have any questions, please contact us at support@starbeadskreation.com</p>
        </div>
      </div>
    </body>
    </html>
  `
});

export const getOrderShippedEmail = (data: OrderEmailData) => ({
  subject: `Order Shipped - #${data.orderId.slice(-8)}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Shipped</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #fff3e0; padding: 20px; text-align: center; border-radius: 8px; }
        .content { padding: 20px; }
        .tracking { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚚 Order Shipped!</h1>
          <p>Your order is on its way to you!</p>
        </div>
        
        <div class="content">
          <h2>Order #${data.orderId.slice(-8)}</h2>
          
          <div class="tracking">
            <h3>Tracking Information</h3>
            <p><strong>Carrier:</strong> ${data.carrier || 'Standard Shipping'}</p>
            <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
            ${data.carrier === 'USPS' ? `<p><a href="https://tools.usps.com/go/TrackConfirmAction?tLabels=${data.trackingNumber}" target="_blank">Track Package</a></p>` : ''}
            ${data.carrier === 'FedEx' ? `<p><a href="https://www.fedex.com/fedextrack/?trknbr=${data.trackingNumber}" target="_blank">Track Package</a></p>` : ''}
            ${data.carrier === 'UPS' ? `<p><a href="https://www.ups.com/track?tracknum=${data.trackingNumber}" target="_blank">Track Package</a></p>` : ''}
          </div>
          
          <p><strong>Order Date:</strong> ${data.orderDate}</p>
          <p><strong>Total:</strong> $${data.orderTotal.toFixed(2)}</p>
        </div>
        
        <div class="footer">
          <p>Your order should arrive within 3-7 business days.</p>
          <p>If you have any questions, please contact us at support@starbeadskreation.com</p>
        </div>
      </div>
    </body>
    </html>
  `
});

export const getOrderDeliveredEmail = (data: OrderEmailData) => ({
  subject: `Order Delivered - #${data.orderId.slice(-8)}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Delivered</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e8f5e8; padding: 20px; text-align: center; border-radius: 8px; }
        .content { padding: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Delivered!</h1>
          <p>Your order has been successfully delivered!</p>
        </div>
        
        <div class="content">
          <h2>Order #${data.orderId.slice(-8)}</h2>
          
          <p>We hope you love your new items! If you have any questions or need assistance, please don't hesitate to reach out.</p>
          
          <p><strong>Order Date:</strong> ${data.orderDate}</p>
          <p><strong>Total:</strong> $${data.orderTotal.toFixed(2)}</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" class="button">
              Shop Again
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Star Beads Kreation!</p>
          <p>If you have any questions, please contact us at support@starbeadskreation.com</p>
        </div>
      </div>
    </body>
    </html>
  `
});

export const getOrderCancelledEmail = (data: OrderEmailData) => ({
  subject: `Order Cancelled - #${data.orderId.slice(-8)}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Cancelled</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ffebee; padding: 20px; text-align: center; border-radius: 8px; }
        .content { padding: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Order Cancelled</h1>
          <p>Your order has been cancelled</p>
        </div>
        
        <div class="content">
          <h2>Order #${data.orderId.slice(-8)}</h2>
          
          <p>We're sorry to inform you that your order has been cancelled. If you have any questions about this cancellation, please contact our support team.</p>
          
          <p><strong>Order Date:</strong> ${data.orderDate}</p>
          <p><strong>Total:</strong> $${data.orderTotal.toFixed(2)}</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" class="button">
              Browse Products
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>If you have any questions, please contact us at support@starbeadskreation.com</p>
        </div>
      </div>
    </body>
    </html>
  `
}); 