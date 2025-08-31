import * as actionTypes from './types';
import { request } from '@/request';

const dispatchSettingsData = (datas) => {
  const settingsCategory = {};

  // Handle empty array case
  if (!datas || datas.length === 0) {
    // Return default settings structure when no settings exist
    return {
      crm_settings: {},
      finance_settings: {},
      company_settings: {},
      app_settings: {},
      money_format_settings: {
        default_currency_code: 'USD', // Provide a default currency
        default_currency_symbol: '$',
      },
    };
  }

  datas.map((data) => {
    settingsCategory[data.settingCategory] = {
      ...settingsCategory[data.settingCategory],
      [data.settingKey]: data.settingValue,
    };
  });

  return settingsCategory;
};

export const settingsAction = {
  resetState: () => (dispatch) => {
    dispatch({
      type: actionTypes.RESET_STATE,
    });
  },
  updateCurrency:
    ({ data }) =>
    async (dispatch) => {
      dispatch({
        type: actionTypes.UPDATE_CURRENCY,
        payload: data,
      });
    },
  update:
    ({ entity, settingKey, jsonData }) =>
    async (dispatch) => {
      dispatch({
        type: actionTypes.REQUEST_LOADING,
      });
      let data = await request.patch({
        entity: entity + '/updateBySettingKey/' + settingKey,
        jsonData,
      });

      if (data.success === true) {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
        });

        let data = await request.listAll({ entity });

        // Handle both success cases: with data and empty collection
        if (data.success === true || (data.success === false && data.result && data.result.length === 0)) {
          const payload = dispatchSettingsData(data.result || []);
          window.localStorage.setItem(
            'settings',
            JSON.stringify(payload)
          );

          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            payload,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
          });
        }
      } else {
        dispatch({
          type: actionTypes.REQUEST_FAILED,
        });
      }
    },
  updateMany:
    ({ entity, jsonData }) =>
    async (dispatch) => {
      dispatch({
        type: actionTypes.REQUEST_LOADING,
      });
      let data = await request.patch({
        entity: entity + '/updateManySetting',
        jsonData,
      });

      if (data.success === true) {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
        });

        let data = await request.listAll({ entity });

        // Handle both success cases: with data and empty collection
        if (data.success === true || (data.success === false && data.result && data.result.length === 0)) {
          const payload = dispatchSettingsData(data.result || []);
          window.localStorage.setItem(
            'settings',
            JSON.stringify(payload)
          );

          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            payload,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
          });
        }
      } else {
        dispatch({
          type: actionTypes.REQUEST_FAILED,
        });
      }
    },
  list:
    ({ entity }) =>
    async (dispatch) => {
      dispatch({
        type: actionTypes.REQUEST_LOADING,
      });

      try {
        let data = await request.listAll({ entity });

        // Handle both success cases: with data and empty collection
        if (data.success === true || (data.success === false && data.result && data.result.length === 0)) {
          const payload = dispatchSettingsData(data.result || []);
          window.localStorage.setItem('settings', JSON.stringify(payload));

          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            payload,
          });
        } else {
          // If the API call failed but we have some data, try to use it
          if (data.result && Array.isArray(data.result)) {
            const payload = dispatchSettingsData(data.result);
            window.localStorage.setItem('settings', JSON.stringify(payload));
            
            dispatch({
              type: actionTypes.REQUEST_SUCCESS,
              payload,
            });
          } else {
            // Complete failure, provide default settings
            const defaultPayload = dispatchSettingsData([]);
            window.localStorage.setItem('settings', JSON.stringify(defaultPayload));
            
            dispatch({
              type: actionTypes.REQUEST_SUCCESS,
              payload: defaultPayload,
            });
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        
        // On error, provide default settings to prevent infinite loading
        const defaultPayload = dispatchSettingsData([]);
        window.localStorage.setItem('settings', JSON.stringify(defaultPayload));
        
        dispatch({
          type: actionTypes.REQUEST_SUCCESS,
          payload: defaultPayload,
        });
      }
    },
  upload:
    ({ entity, settingKey, jsonData }) =>
    async (dispatch) => {
      dispatch({
        type: actionTypes.REQUEST_LOADING,
      });

      let data = await request.upload({
        entity: entity,
        id: settingKey,
        jsonData,
      });

      if (data.success === true) {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
        });

        let data = await request.listAll({ entity });

        // Handle both success cases: with data and empty collection
        if (data.success === true || (data.success === false && data.result && data.result.length === 0)) {
          const payload = dispatchSettingsData(data.result || []);
          window.localStorage.setItem(
            'settings',
            JSON.stringify(payload)
          );
          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            payload,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
          });
        }
      } else {
        dispatch({
          type: actionTypes.REQUEST_FAILED,
        });
      }
    },
};
