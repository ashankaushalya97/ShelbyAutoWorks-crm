const mongoose = require('mongoose');

const pnl = async (req, res) => {
  const { month } = req.query; // format: YYYY-MM

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'month query param required in YYYY-MM format',
    });
  }

  const [year, monthNum] = month.split('-').map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 1);

  const Payment = mongoose.model('Payment');
  const Expense = mongoose.model('Expense');

  const [payments, expenses] = await Promise.all([
    Payment.find({ removed: false, date: { $gte: startDate, $lt: endDate } }),
    Expense.find({ removed: false, date: { $gte: startDate, $lt: endDate } }),
  ]);

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  // Last 6 months trend
  const trend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, monthNum - 1 - i, 1);
    const dEnd = new Date(year, monthNum - i, 1);
    const mLabel = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    const [mPayments, mExpenses] = await Promise.all([
      Payment.find({ removed: false, date: { $gte: d, $lt: dEnd } }),
      Expense.find({ removed: false, date: { $gte: d, $lt: dEnd } }),
    ]);

    const mRevenue = mPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const mExpense = mExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    trend.push({ month: mLabel, revenue: mRevenue, expenses: mExpense, netProfit: mRevenue - mExpense });
  }

  return res.status(200).json({
    success: true,
    result: { month, totalRevenue, totalExpenses, netProfit, mechanicShare: netProfit * 0.5, partnerShare: netProfit * 0.25, trend },
    message: 'P&L data retrieved',
  });
};

module.exports = { pnl };
