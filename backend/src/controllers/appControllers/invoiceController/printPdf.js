const pug = require('pug');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const moment = require('moment');

const printPdf = async (req, res) => {
  const Invoice = mongoose.model('Invoice');
  const Setting = mongoose.model('Setting');

  const invoice = await Invoice.findOne({ _id: req.params.id, removed: false })
    .populate('createdBy', 'name surname')
    .populate('client')
    .populate('vehicle')
    .exec();

  if (!invoice) {
    return res.status(404).json({ success: false, result: null, message: 'Invoice not found' });
  }

  const settingsList = await Setting.find({ removed: false });
  const settings = {};
  settingsList.forEach((s) => { settings[s.settingKey] = s.settingValue; });
  settings.public_server_file = process.env.PUBLIC_SERVER_FILE || 'http://localhost:8888/';

  const currencySymbol = settings.currency_symbol || settings.default_currency_code || 'LKR';
  const moneyFormatter = ({ amount }) =>
    `${currencySymbol} ${Number(amount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

  const dateFormat = settings.idurar_app_date_format || 'DD/MM/YYYY';

  // Embed Shelby logo as base64 so it renders correctly in the print page
  const logoPath = path.join(__dirname, '../../../../../frontend/src/style/images/shelbylogo.png');
  let logoBase64 = null;
  if (fs.existsSync(logoPath)) {
    logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;
  }

  const templatePath = path.join(__dirname, '../../../pdf/GarageInvoice.pug');
  const html = pug.renderFile(templatePath, {
    model: invoice.toObject(),
    settings,
    moment,
    moneyFormatter,
    dateFormat,
    logoBase64,
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
};

module.exports = printPdf;
