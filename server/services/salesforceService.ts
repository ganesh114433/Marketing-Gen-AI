
import jsforce from 'jsforce';

export class SalesforceService {
  private static instance: SalesforceService;
  private conn: jsforce.Connection;

  private constructor() {
    this.conn = new jsforce.Connection({
      loginUrl: process.env.SALESFORCE_LOGIN_URL
    });
  }

  public static getInstance(): SalesforceService {
    if (!SalesforceService.instance) {
      SalesforceService.instance = new SalesforceService();
    }
    return SalesforceService.instance;
  }

  public async connect() {
    await this.conn.login(
      process.env.SALESFORCE_USERNAME,
      process.env.SALESFORCE_PASSWORD + process.env.SALESFORCE_SECURITY_TOKEN
    );
  }

  public async getLeadData(startDate: string, endDate: string) {
    return await this.conn.query(
      `SELECT Id, Name, Status, CreatedDate FROM Lead WHERE CreatedDate >= ${startDate} AND CreatedDate <= ${endDate}`
    );
  }
}

export const salesforceService = SalesforceService.getInstance();
