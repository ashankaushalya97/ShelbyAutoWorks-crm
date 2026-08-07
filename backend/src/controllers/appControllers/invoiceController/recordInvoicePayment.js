const mongoose = require('mongoose');

const { calculate } = require('@/helpers');

// Records a Payment for an invoice that is marked "paid" without going through
// the normal Record Payment flow (e.g. a job settled in cash at invoice time).
//
// Why: the P&L dashboard sums Payment documents, not invoice status. Without
// this, revenue collected at invoice-creation time produces no Payment record
// and is invisible to the P&L / profit split — under-reporting revenue.
//
// Idempotent: only records the outstanding balance needed to reach fully paid,
// so re-saving an already-paid invoice never creates a duplicate payment.
const recordInvoicePayment = async ({ invoice, adminId }) => {
  const Payment = mongoose.model('Payment');
  const Invoice = mongoose.model('Invoice');

  const total = invoice.total || 0;
  const discount = invoice.discount || 0;
  const credit = invoice.credit || 0;

  const amountToRecord = calculate.sub(calculate.sub(total, discount), credit);

  if (amountToRecord <= 0) return null;

  const paymentCount = await Payment.countDocuments();

  const payment = await Payment.create({
    number: paymentCount + 1,
    createdBy: adminId,
    client: invoice.client?._id || invoice.client,
    invoice: invoice._id,
    date: invoice.date,
    amount: amountToRecord,
    currency: invoice.currency,
    description: 'Auto-recorded — invoice marked paid on issue',
  });

  await Invoice.updateOne(
    { _id: invoice._id },
    {
      $push: { payment: payment._id },
      $inc: { credit: amountToRecord },
      $set: { paymentStatus: 'paid' },
    }
  );

  return payment;
};

module.exports = recordInvoicePayment;
