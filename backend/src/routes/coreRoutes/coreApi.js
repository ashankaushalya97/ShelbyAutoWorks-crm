const express = require('express');
const { catchErrors } = require('@/handlers/errorHandlers');
const router = express.Router();

const adminController = require('@/controllers/coreControllers/adminController');
const settingController = require('@/controllers/coreControllers/settingController');
const requireRole = require('@/controllers/middlewaresControllers/createAuthMiddleware/requireRole');
const { singleStorageUpload } = require('@/middlewares/uploadMiddleware');

const adminGuard = requireRole(['admin', 'owner']);

// Admin management
router.route('/admin/read/:id').get(catchErrors(adminController.read));
router.route('/admin/password-update/:id').patch(adminGuard, catchErrors(adminController.updatePassword));

// Profile — any logged-in user
router.route('/admin/profile/password').patch(catchErrors(adminController.updateProfilePassword));
router
  .route('/admin/profile/update')
  .patch(
    singleStorageUpload({ entity: 'admin', fieldName: 'photo', fileType: 'image' }),
    catchErrors(adminController.updateProfile)
  );

// Settings — reads open to all, writes admin only
router.route('/setting/create').post(adminGuard, catchErrors(settingController.create));
router.route('/setting/read/:id').get(catchErrors(settingController.read));
router.route('/setting/update/:id').patch(adminGuard, catchErrors(settingController.update));
router.route('/setting/search').get(catchErrors(settingController.search));
router.route('/setting/list').get(catchErrors(settingController.list));
router.route('/setting/listAll').get(catchErrors(settingController.listAll));
router.route('/setting/filter').get(catchErrors(settingController.filter));
router.route('/setting/readBySettingKey/:settingKey').get(catchErrors(settingController.readBySettingKey));
router.route('/setting/listBySettingKey').get(catchErrors(settingController.listBySettingKey));
router
  .route('/setting/updateBySettingKey/:settingKey?')
  .patch(adminGuard, catchErrors(settingController.updateBySettingKey));
router
  .route('/setting/upload/:settingKey?')
  .patch(
    catchErrors(singleStorageUpload({ entity: 'setting', fieldName: 'settingValue', fileType: 'image' })),
    adminGuard,
    catchErrors(settingController.updateBySettingKey)
  );
router.route('/setting/updateManySetting').patch(adminGuard, catchErrors(settingController.updateManySetting));

module.exports = router;
