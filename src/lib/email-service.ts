import { Resend } from 'resend';
import { 
  getOrderConfirmationEmail, 
  getOrderProcessingEmail, 
  getOrderShippedEmail, 
  getOrderDeliveredEmail, 
  getOrderCancelledEmail,
  OrderEmailData 
} from './email-templates';

const resend = new Resend(process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY);

export class EmailService {
  private static async sendEmail(to: string, subject: string, html: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Star Beads Kreation <orders@starbeadskreation.com>',
        to: [to],
        subject,
        html,
      });

      if (error) {
        console.error('Email sending failed:', error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      console.log('Email sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  }

  static async sendOrderConfirmation(data: OrderEmailData) {
    const { subject, html } = getOrderConfirmationEmail(data);
    return this.sendEmail(data.customerEmail, subject, html);
  }

  static async sendOrderProcessing(data: OrderEmailData) {
    const { subject, html } = getOrderProcessingEmail(data);
    return this.sendEmail(data.customerEmail, subject, html);
  }

  static async sendOrderShipped(data: OrderEmailData) {
    const { subject, html } = getOrderShippedEmail(data);
    return this.sendEmail(data.customerEmail, subject, html);
  }

  static async sendOrderDelivered(data: OrderEmailData) {
    const { subject, html } = getOrderDeliveredEmail(data);
    return this.sendEmail(data.customerEmail, subject, html);
  }

  static async sendOrderCancelled(data: OrderEmailData) {
    const { subject, html } = getOrderCancelledEmail(data);
    return this.sendEmail(data.customerEmail, subject, html);
  }

  static async sendOrderStatusUpdate(data: OrderEmailData, newStatus: string) {
    switch (newStatus) {
      case 'processing':
        return this.sendOrderProcessing(data);
      case 'shipped':
        return this.sendOrderShipped(data);
      case 'delivered':
        return this.sendOrderDelivered(data);
      case 'cancelled':
        return this.sendOrderCancelled(data);
      default:
        console.log(`No email template for status: ${newStatus}`);
        return null;
    }
  }
} 