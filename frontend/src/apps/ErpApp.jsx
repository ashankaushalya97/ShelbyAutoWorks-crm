import { useLayoutEffect, useState } from 'react';
import { useEffect } from 'react';
import { selectAppSettings } from '@/redux/settings/selectors';
import { useDispatch, useSelector } from 'react-redux';

import { Layout } from 'antd';

import { useAppContext } from '@/context/appContext';

import Navigation from '@/apps/Navigation/NavigationContainer';

import HeaderContent from '@/apps/Header/HeaderContainer';
import PageLoader from '@/components/PageLoader';

import { settingsAction } from '@/redux/settings/actions';

import { selectSettings } from '@/redux/settings/selectors';

import AppRouter from '@/router/AppRouter';

import useResponsive from '@/hooks/useResponsive';

import storePersist from '@/redux/storePersist';

export default function ErpCrmApp() {
  const { Content } = Layout;

  // const { state: stateApp, appContextAction } = useAppContext();
  // // const { app } = appContextAction;
  // const { isNavMenuClose, currentApp } = stateApp;

  const { isMobile } = useResponsive();
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const dispatch = useDispatch();

  useLayoutEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('Settings loading timed out, using default settings');
      setHasTimedOut(true);
      
      // Provide default settings to prevent infinite loading
      const defaultSettings = {
        crm_settings: {},
        finance_settings: {},
        company_settings: {},
        app_settings: {},
        money_format_settings: {
          default_currency_code: 'USD',
          default_currency_symbol: '$',
        },
      };
      
      dispatch({
        type: 'settings/REQUEST_SUCCESS',
        payload: defaultSettings,
      });
    }, 10000); // 10 second timeout

    // Check if settings are already in localStorage to avoid unnecessary API call
    const cachedSettings = window.localStorage.getItem('settings');
    if (cachedSettings) {
      try {
        const parsedSettings = JSON.parse(cachedSettings);
        // Check if cached settings have the required structure
        if (parsedSettings && typeof parsedSettings === 'object') {
          // Clear timeout since we have valid cached settings
          clearTimeout(timeoutId);
          // Dispatch the cached settings immediately to avoid loading state
          dispatch({
            type: 'settings/REQUEST_SUCCESS',
            payload: parsedSettings,
          });
        } else {
          // Invalid cached settings, make API call
          dispatch(settingsAction.list({ entity: 'setting' }));
        }
      } catch (error) {
        console.error('Error parsing cached settings:', error);
        // If parsing fails, fall back to API call
        dispatch(settingsAction.list({ entity: 'setting' }));
      }
    } else {
      // No cached settings, make API call
      dispatch(settingsAction.list({ entity: 'setting' }));
    }

    // Cleanup timeout on unmount
    return () => clearTimeout(timeoutId);
  }, []);

  // const appSettings = useSelector(selectAppSettings);

  const { isSuccess: settingIsloaded } = useSelector(selectSettings);

  // useEffect(() => {
  //   const { loadDefaultLang } = storePersist.get('firstVisit');
  //   if (appSettings.idurar_app_language && !loadDefaultLang) {
  //     window.localStorage.setItem('firstVisit', JSON.stringify({ loadDefaultLang: true }));
  //   }
  // }, [appSettings]);

  if (settingIsloaded || hasTimedOut)
    return (
      <Layout hasSider>
        <Navigation />

        {isMobile ? (
          <Layout style={{ marginLeft: 0 }}>
            <HeaderContent />
            <Content
              style={{
                margin: '40px auto 30px',
                overflow: 'initial',
                width: '100%',
                padding: '0 25px',
                maxWidth: 'none',
              }}
            >
              <AppRouter />
            </Content>
          </Layout>
        ) : (
          <Layout>
            <HeaderContent />
            <Content
              style={{
                margin: '40px auto 30px',
                overflow: 'initial',
                width: '100%',
                padding: '0 50px',
                maxWidth: 1400,
              }}
            >
              <AppRouter />
            </Content>
          </Layout>
        )}
      </Layout>
    );
  else return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <PageLoader />
    </div>
  );
}
