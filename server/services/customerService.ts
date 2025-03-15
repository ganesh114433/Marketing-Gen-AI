
import { storage } from '../storage';
import { Customer, EmailCampaign } from '@shared/schema';
import { sendEmail } from '../api/email';

export class CustomerService {
  private static instance: CustomerService;

  private constructor() {}

  public static getInstance(): CustomerService {
    if (!CustomerService.instance) {
      CustomerService.instance = new CustomerService();
    }
    return CustomerService.instance;
  }

  public async createCustomer(customer: Customer): Promise<Customer> {
    return storage.createCustomer(customer);
  }

  public async sendCampaignEmail(campaign: EmailCampaign, customers: Customer[]): Promise<void> {
    for (const customer of customers) {
      await sendEmail({
        to: customer.email,
        subject: campaign.subject,
        html: campaign.content,
        from: process.env.COMPANY_EMAIL
      });
    }
  }

  public async getCustomersBySegment(segment: string): Promise<Customer[]> {
    return storage.getCustomersBySegment(segment);
  }
}

export const customerService = CustomerService.getInstance();
