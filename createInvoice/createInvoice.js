const fs = require("fs");
const PDFDocument = require("pdfkit");
const admin = require('firebase-admin');

admin.initializeApp({
  apiKey: 'AIzaSyBTYRtlpPqffTWJYpVP8aEvo8N-zd_4sZk',
  authDomain: 'findsafe-8e352.firebaseapp.com',
  databaseURL: 'https://findsafe-8e352.firebaseio.com',
  projectId: 'findsafe-8e352',
  storageBucket: 'findsafe-8e352.appspot.com',
  messagingSenderId: '207085702931',
  appId: '1:207085702931:web:9a98a5bfa4e66d4b9554e6',
  measurementId: 'G-F7MHPN7CPN'
});

function createInvoice(invoice, path) {
  let doc = new PDFDocument({ size: "A4", margin: 50 });

  generateHeader(doc);
  generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, invoice);
  generateFooter(doc);

  doc.end();
  doc.pipe(fs.createWriteStream(path));

  const myPdfFile = admin.storage().file('Invoice/test.pdf');
  const stream = doc.pipe(myPdfFile.createWriteStream());

}

function generateHeader(doc) {
  doc
    .image("public/images/logo.png", 50, 45, { width: 50 })
    .fillColor("#444444")
    .fontSize(20)
    .text("FindSafe", 110, 57)
    .fontSize(10)
    .text("FindSafe", 200, 50, { align: "right" })
    .text("47 Nguyen Luong Bang, Lien Chieu", 200, 65, { align: "right" })
    .text("Da Nang, Viet Nam", 200, 80, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("Invoice", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text("Invoice Number:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(invoice.title, 150, customerInformationTop)
    .font("Helvetica")
    .text("Invoice Date:", 50, customerInformationTop + 15)
    .text(invoice.date_start + ' - ' + invoice.date_end, 150, customerInformationTop + 15)
    .text("Balance Due:", 50, customerInformationTop + 30)
    .text(
      invoice.total,
      150,
      customerInformationTop + 30
    )

    .font("Helvetica-Bold")
    .text(invoice.user_rent.name, 300, customerInformationTop)
    .font("Helvetica")
    .text(invoice.user_rent.email, 300, customerInformationTop + 15)
    .text(
      invoice.user_rent.ward +
        ", " +
        invoice.user_rent.district +
        ", " +
        invoice.user_rent.city,
      300,
      customerInformationTop + 30
    )
    .moveDown();
  generateHr(doc, 252);
}

function generateInvoiceTable(doc, invoice) {
  let position;
  const invoiceTableTop = 330;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "ID",
    "Number before",
    "Number after",
    "Line Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  position = invoiceTableTop + 1 * 30;
  generateTableRow(
    doc,
    position,
    'Water',
    invoice.water_before,
    invoice.water_last,
    calcWaterPrice(invoice.water_before, invoice.water_last)
  );
  generateHr(doc, position + 20);

  position = invoiceTableTop + 2 * 30;
  generateTableRow(
    doc,
    position,
    'Electric',
    invoice.electric_before,
    invoice.electric_last,
    calcElectricPrice(invoice.electric_before, invoice.electric_last)
  );
  generateHr(doc, position + 20);

  position = invoiceTableTop + 3 * 30;
  generateTableRow(
    doc,
    position,
    'Price room',
    '',
    '',
    invoice.room_id.price
  );

  generateHr(doc, position + 20);

  const subtotalPosition = invoiceTableTop + 4 * 30;
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Subtotal",
    "",
    invoice.total
  );
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      "Payment is due within 7 days. Thank you.",
      50,
      780,
      { align: "center", width: 500 }
    );
}

function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y)
    .text(unitCost, 280, y, { width: 90, align: "right" })
    .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}

function calcElectricPrice(number1, number2) {
    let total = 0
    let el = number2 - number1
    if (el <= 50) {
        total = el * 1678
    } 
    else if (50 < el <= 100) {
        total = 50 * 1678 + (el - 50) * 1734
    } 
    else if (100 < el <= 200) {
        total = 50 * 1678 + 50 * 1734 + (el - 100) * 2014
    } 
    else if (200 < el <= 300) {
        total = 50 * 1678 + 50 * 1734 + 100 * 2014 + (el - 200) * 2536
    } 
    else if (300 < el <= 400) {
        total = 50 * 1678 + 50 * 1734 + 100 * 2014 + 100 * 2536 + (el - 300) * 2834
    } 
    else if (400 < el) {
        total = 50 * 1678 + 50 * 1734 + 100 * 2014 + 100 * 2536 + 100 * 2834 + (el - 400) * 2927
    }
    total += total * 10 / 100
    return total;
}

function calcWaterPrice(number1, number2) {
    let wt = number2 - number1
    let total = 0
    if (wt <= 10) {
        total = wt * 6869
    }
    else if (10 < wt <= 20) {
        total = 10 * 6869 + (wt - 10) * 8110
    } 
    else if (20 < wt <= 30) {
        total = 10 * 6869 + 10 * 8110 + (wt - 20) * 9969
    }
    else if (30 < wt) {
        total = 10 * 6869 + 10 * 8110 + 10 * 9969 + (wt - 30) * 18318
    }
    return total
}

function formatCurrency(value) {
    return value && this.roundUp(value, 2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

module.exports = {
  createInvoice
};