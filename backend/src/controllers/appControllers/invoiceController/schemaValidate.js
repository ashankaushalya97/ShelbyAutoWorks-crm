const Joi = require('joi');

const schema = Joi.object({
  client: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
  vehicle: Joi.alternatives().try(Joi.string(), Joi.object()).optional(),
  // number and year are auto-set by the create controller — optional from client
  number: Joi.number().optional(),
  year: Joi.number().optional(),
  invoiceNumber: Joi.string().optional(),
  paymentMethod: Joi.string().valid('cash', 'card', 'other').optional(),
  status: Joi.string().required(),
  notes: Joi.string().allow('').optional(),
  expiredDate: Joi.date().required(),
  date: Joi.date().required(),
  items: Joi.array()
    .items(
      Joi.object({
        _id: Joi.string().allow('').optional(),
        itemName: Joi.string().required(),
        description: Joi.string().allow('').optional(),
        quantity: Joi.number().required(),
        price: Joi.number().required(),
        total: Joi.number().required(),
      }).required()
    )
    .required(),
  taxRate: Joi.alternatives().try(Joi.number(), Joi.string()).optional().default(0),
  discount: Joi.number().optional().default(0),
});

module.exports = schema;
