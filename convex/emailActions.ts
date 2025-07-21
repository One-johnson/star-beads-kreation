import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Test order creation with email
export const testOrderCreation = action({
  args: {
    customerEmail: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Test order creation started");
      console.log("Customer email:", args.customerEmail);
      
      const emailData = {
        orderId: "test-order-123",
        customerName: "Test Customer",
        customerEmail: args.customerEmail,
        orderTotal: 29.99,
        orderItems: [
          {
            name: "Test Product",
            quantity: 1,
            price: 29.99,
          }
        ],
        shippingAddress: {
          fullName: "Test Customer",
          address: "123 Test St",
          city: "Test City",
          state: "TS",
          zipCode: "12345",
        },
        status: "pending",
        orderDate: new Date().toLocaleDateString(),
      };

      console.log("Email data prepared:", emailData);

      // Send email notification
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendOrderConfirmationEmail,
        {
          emailData,
        }
      );

      console.log("Test order email scheduled successfully");
      return { success: true, message: "Test order email sent" };
    } catch (error) {
      console.error("Failed to send test order email:", error);
      throw error;
    }
  },
});

// Test email function
export const sendTestEmail = action({
  args: {
    to: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Test email function called with:", args.to);
      console.log("Resend API key exists:", !!process.env.RESEND_API_KEY);
      
      // Import Resend directly in the action
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      // Send a simple test email
      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: [args.to],
        subject: 'Test Email from Star Beads Kreation',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Test Email</title>
          </head>
          <body>
            <h1>🎉 Email System Working!</h1>
            <p>This is a test email to verify that your Resend configuration is working correctly.</p>
            <p>If you received this email, your order notification system is ready to go!</p>
            <br>
            <p><strong>Star Beads Kreation</strong></p>
          </body>
          </html>
        `,
      });

      if (error) {
        console.error('Test email sending failed:', error);
        throw new Error(`Failed to send test email: ${error.message}`);
      }

      console.log('Test email sent successfully:', data);
      return { success: true, message: 'Test email sent successfully' };
    } catch (error) {
      console.error("Failed to send test email:", error);
      throw error;
    }
  },
});

// Action to send order status email
export const sendOrderStatusEmail = action({
  args: {
    emailData: v.object({
      orderId: v.string(),
      customerName: v.string(),
      customerEmail: v.string(),
      orderTotal: v.number(),
      orderItems: v.array(v.object({
        name: v.string(),
        quantity: v.number(),
        price: v.number(),
      })),
      shippingAddress: v.object({
        fullName: v.string(),
        address: v.string(),
        city: v.string(),
        state: v.string(),
        zipCode: v.string(),
      }),
      trackingNumber: v.optional(v.string()),
      carrier: v.optional(v.string()),
      status: v.string(),
      orderDate: v.string(),
    }),
    newStatus: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Import Resend directly in the action
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      // Import email templates
      const { 
        getOrderProcessingEmail, 
        getOrderShippedEmail, 
        getOrderDeliveredEmail, 
        getOrderCancelledEmail 
      } = await import("../src/lib/email-templates");
      
      // Get the appropriate email template
      let emailTemplate;
      switch (args.newStatus) {
        case 'processing':
          emailTemplate = getOrderProcessingEmail(args.emailData);
          break;
        case 'shipped':
          emailTemplate = getOrderShippedEmail(args.emailData);
          break;
        case 'delivered':
          emailTemplate = getOrderDeliveredEmail(args.emailData);
          break;
        case 'cancelled':
          emailTemplate = getOrderCancelledEmail(args.emailData);
          break;
        default:
          console.log(`No email template for status: ${args.newStatus}`);
          return;
      }
      
      // Send the email
      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: [args.emailData.customerEmail],
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });

      if (error) {
        console.error('Email sending failed:', error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      console.log(`Email sent successfully for order ${args.emailData.orderId} with status ${args.newStatus}`);
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  },
});

// Action to send order confirmation email
export const sendOrderConfirmationEmail = action({
  args: {
    emailData: v.object({
      orderId: v.string(),
      customerName: v.string(),
      customerEmail: v.string(),
      orderTotal: v.number(),
      orderItems: v.array(v.object({
        name: v.string(),
        quantity: v.number(),
        price: v.number(),
      })),
      shippingAddress: v.object({
        fullName: v.string(),
        address: v.string(),
        city: v.string(),
        state: v.string(),
        zipCode: v.string(),
      }),
      trackingNumber: v.optional(v.string()),
      carrier: v.optional(v.string()),
      status: v.string(),
      orderDate: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Order confirmation email action started");
      console.log("Email data received:", args.emailData);
      console.log("Resend API key exists:", !!process.env.RESEND_API_KEY);
      
      // Import Resend directly in the action
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      // Import email templates
      const { getOrderConfirmationEmail } = await import("../src/lib/email-templates");
      
      // Get the email template
      const emailTemplate = getOrderConfirmationEmail(args.emailData);
      
      // Send the email
      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: [args.emailData.customerEmail],
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });

      if (error) {
        console.error('Email sending failed:', error);
        throw new Error(`Failed to send email: ${error.message}`);
      }
      
      console.log(`Order confirmation email sent successfully for order ${args.emailData.orderId}`);
    } catch (error) {
      console.error("Failed to send order confirmation email:", error);
      throw error;
    }
  },
}); 