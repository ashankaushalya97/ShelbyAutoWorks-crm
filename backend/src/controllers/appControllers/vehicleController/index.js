const mongoose = require('mongoose');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');

const methods = createCRUDController('Vehicle');

// Override listAll to support ?client= filter for the invoice form dropdown
methods.listAll = async (req, res) => {
  const Model = mongoose.model('Vehicle');
  const filter = { removed: false };
  if (req.query.client) filter.customer = req.query.client;

  const result = await Model.find(filter).sort({ created: 'desc' }).exec();

  if (result.length > 0) {
    return res.status(200).json({ success: true, result, message: 'Successfully found all documents' });
  } else {
    return res.status(203).json({ success: false, result: [], message: 'Collection is Empty' });
  }
};

module.exports = methods;
