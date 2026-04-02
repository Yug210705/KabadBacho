
export const generateInvoice = (pickup) => {
  const invoiceWindow = window.open('', '_blank', 'width=800,height=900');
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice - ${pickup.id}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 0; padding: 40px; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); font-size: 16px; line-height: 24px; color: #555; }
        .invoice-box table { width: 100%; line-height: inherit; text-align: left; }
        .invoice-box table td { padding: 5px; vertical-align: top; }
        .invoice-box table tr td:nth-child(2) { text-align: right; }
        .invoice-box table tr.top table td { padding-bottom: 20px; }
        .invoice-box table tr.top table td.title { font-size: 45px; line-height: 45px; color: #4CAF50; font-weight: bold; }
        .invoice-box table tr.information table td { padding-bottom: 40px; }
        .invoice-box table tr.heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
        .invoice-box table tr.details td { padding-bottom: 20px; }
        .invoice-box table tr.item td { border-bottom: 1px solid #eee; }
        .invoice-box table tr.item.last td { border-bottom: none; }
        .invoice-box table tr.total td:nth-child(2) { border-top: 2px solid #eee; font-weight: bold; font-size: 20px; color: #4CAF50; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; }
        .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; text-transform: uppercase; font-size: 12px; }
        .status-paid { background: #E8F5E9; color: #2E7D32; }
        @media print {
          .no-print { display: none; }
          body { padding: 0; }
          .invoice-box { box-shadow: none; border: none; }
        }
        .print-btn { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="no-print" style="text-align: center;">
        <button class="print-btn" onclick="window.print()">Print / Download PDF</button>
      </div>
      <div class="invoice-box">
        <table cellpadding="0" cellspacing="0">
          <tr class="top">
            <td colspan="2">
              <table>
                <tr>
                  <td class="title">KABAD BECHO</td>
                  <td>
                    Invoice #: ${pickup.id}<br>
                    Created: ${new Date().toLocaleDateString()}<br>
                    Due: ${pickup.date}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr class="information">
            <td colspan="2">
              <table>
                <tr>
                  <td>
                    Kabad Becho Logistics Pvt Ltd.<br>
                    123 Eco Industrial Area<br>
                    Mumbai, MH 400001
                  </td>
                  <td>
                    ${pickup.customer || 'Valued Customer'}<br>
                    ${pickup.phone || ''}<br>
                    ${pickup.address}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr class="heading">
            <td>Payment Method</td>
            <td>Status</td>
          </tr>
          <tr class="details">
            <td>Cash / UPI (to Pickup Partner)</td>
            <td><span class="status-badge status-paid">PAID</span></td>
          </tr>
          <tr class="heading">
            <td>Item</td>
            <td>Price</td>
          </tr>
          <tr class="item">
            <td>${pickup.scrapType} (${pickup.weight || 'Estimated'})</td>
            <td>${pickup.amount}</td>
          </tr>
          <tr class="item last">
            <td>Service Fee (Included)</td>
          <td>₹0.00</td>
          </tr>
          <tr class="total">
            <td></td>
            <td>Total: ${pickup.amount}</td>
          </tr>
        </table>
        <div class="footer">
          <p>Thank you for contributing to a greener planet!</p>
          <p>Certified Recycling Partner | www.kabadbecho.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  invoiceWindow.document.write(htmlContent);
  invoiceWindow.document.close();
};
