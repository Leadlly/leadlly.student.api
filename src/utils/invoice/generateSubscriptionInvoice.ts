import puppeteer from 'puppeteer';
import path from 'path';
import IUser from '../../types/IUser';

// Function to generate the PDF invoice
export const generateInvoicePDF = async (user: IUser, order: any) => {
    const browser = await puppeteer.launch({
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',  // Point to Chrome
        headless: true,  // Enable headless mode
      });
  const page = await browser.newPage();

  // HTML template for the invoice
  const invoiceHtml = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <h1>Invoice</h1>
      <p><strong>Customer Name:</strong> ${user.firstname} ${user.lastname}</p>
      <p><strong>Customer Email:</strong> ${user.email}</p>
      <p><strong>Order ID:</strong> ${order.order_id}</p>
      <p><strong>Plan:</strong> ${order.category}</p>
      <p><strong>Date of Purchase:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Amount:</strong> INR ${order.amount}</p>
      
      <h3>Details</h3>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${order.plan}</td>
            <td>$${order.amount}</td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `;

  await page.setContent(invoiceHtml);
  const pdfPath = path.join(__dirname, 'invoice.pdf');

  await page.pdf({ path: pdfPath, format: 'A4' });
  await browser.close();

  return pdfPath; 
};
