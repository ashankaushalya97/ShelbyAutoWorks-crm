const express = require('express');
const { catchErrors } = require('@/handlers/errorHandlers');
const router = express.Router();

const appControllers = require('@/controllers/appControllers');
const { routesList } = require('@/models/utils');
const requireRole = require('@/controllers/middlewaresControllers/createAuthMiddleware/requireRole');

const adminGuard = requireRole(['admin', 'owner']);

// staff: fully admin-only (create/update/delete)
const ADMIN_ONLY_FULL = ['staff'];
// invoice, expense: mechanic cannot delete
const ADMIN_ONLY_DELETE = ['invoice', 'expense'];

const routerApp = (entity, controller) => {
  const fullGuard = ADMIN_ONLY_FULL.includes(entity);
  const deleteGuard = ADMIN_ONLY_DELETE.includes(entity);

  router
    .route(`/${entity}/create`)
    .post(...(fullGuard ? [adminGuard] : []), catchErrors(controller['create']));

  router.route(`/${entity}/read/:id`).get(catchErrors(controller['read']));

  router
    .route(`/${entity}/update/:id`)
    .patch(...(fullGuard ? [adminGuard] : []), catchErrors(controller['update']));

  router
    .route(`/${entity}/delete/:id`)
    .delete(...(fullGuard || deleteGuard ? [adminGuard] : []), catchErrors(controller['delete']));

  router.route(`/${entity}/search`).get(catchErrors(controller['search']));
  router.route(`/${entity}/list`).get(catchErrors(controller['list']));
  router.route(`/${entity}/listAll`).get(catchErrors(controller['listAll']));
  router.route(`/${entity}/filter`).get(catchErrors(controller['filter']));
  router.route(`/${entity}/summary`).get(catchErrors(controller['summary']));

  if (entity === 'invoice' || entity === 'quote' || entity === 'payment') {
    router.route(`/${entity}/mail`).post(catchErrors(controller['mail']));
  }
  if (entity === 'quote') {
    router.route(`/${entity}/convert/:id`).get(catchErrors(controller['convert']));
  }
};

routesList.forEach(({ entity, controllerName }) => {
  const controller = appControllers[controllerName];
  routerApp(entity, controller);
});

// P&L dashboard endpoint
const dashboardController = require('@/controllers/appControllers/dashboardController');
router.route('/dashboard/pnl').get(catchErrors(dashboardController.pnl));

// Printable garage bill — returns branded HTML for browser printing
router.route('/invoice/print/:id').get(catchErrors(appControllers['invoiceController'].printPdf));
// Preview next invoice number without creating
router.route('/invoice/nextNumber').get(catchErrors(appControllers['invoiceController'].nextNumber));

module.exports = router;
