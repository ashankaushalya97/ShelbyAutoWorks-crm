const mongoose = require('mongoose');

const Model = mongoose.model('Invoice');

const { calculate } = require('@/helpers');
const schema = require('./schemaValidate');

const create = async (req, res) => {
  let body = req.body;

  const { error, value } = schema.validate(body);
  if (error) {
    const { details } = error;
    return res.status(400).json({
      success: false,
      result: null,
      message: details[0]?.message,
    });
  }

  const { items = [], taxRate = 0, discount = 0 } = value;

  let subTotal = 0;
  let taxTotal = 0;
  let total = 0;

  items.map((item) => {
    let itemTotal = calculate.multiply(item['quantity'], item['price']);
    subTotal = calculate.add(subTotal, itemTotal);
    item['total'] = itemTotal;
  });
  taxTotal = calculate.multiply(subTotal, taxRate / 100);
  total = calculate.add(subTotal, taxTotal);

  body['subTotal'] = subTotal;
  body['taxTotal'] = taxTotal;
  body['total'] = total;
  body['items'] = items;
  // If user explicitly marks the invoice as paid, honour it; otherwise derive from totals
  if (body.status === 'paid') {
    body['paymentStatus'] = 'paid';
  } else {
    body['paymentStatus'] = calculate.sub(total, discount) === 0 ? 'paid' : 'unpaid';
  }
  body['createdBy'] = req.admin._id;

  // Auto-generate invoiceNumber in INV-YYYYMM-XXX format
  const invoiceDate = new Date(body.date) || new Date();
  const year = invoiceDate.getFullYear();
  const month = String(invoiceDate.getMonth() + 1).padStart(2, '0');
  const monthPrefix = `INV-${year}${month}`;

  const lastInvoice = await Model.findOne({
    invoiceNumber: new RegExp(`^${monthPrefix}`),
    removed: false,
  }).sort({ invoiceNumber: -1 });

  let seq = 1;
  if (lastInvoice?.invoiceNumber) {
    const parts = lastInvoice.invoiceNumber.split('-');
    const lastSeq = parseInt(parts[2], 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }

  body['invoiceNumber'] = `${monthPrefix}-${String(seq).padStart(3, '0')}`;
  body['number'] = seq;
  body['year'] = year;

  const result = await new Model(body).save();
  const fileId = 'invoice-' + result._id + '.pdf';
  const updateResult = await Model.findOneAndUpdate(
    { _id: result._id },
    { pdf: fileId },
    { new: true }
  ).exec();

  return res.status(200).json({
    success: true,
    result: updateResult,
    message: 'Invoice created successfully',
  });
};

module.exports = create;
