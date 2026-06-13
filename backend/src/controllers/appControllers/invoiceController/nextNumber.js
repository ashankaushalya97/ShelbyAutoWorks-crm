const mongoose = require('mongoose');

// Returns the next invoice number without creating anything — used for preview on the create form.
const nextNumber = async (req, res) => {
  const Model = mongoose.model('Invoice');

  const date = req.query.date ? new Date(req.query.date) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
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

  return res.status(200).json({
    success: true,
    result: {
      invoiceNumber: `${monthPrefix}-${String(seq).padStart(3, '0')}`,
    },
    message: 'Next invoice number',
  });
};

module.exports = nextNumber;
