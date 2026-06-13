import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Drawer, Layout, Menu } from 'antd';
import { useSelector } from 'react-redux';

import { useAppContext } from '@/context/appContext';
import { selectIsAdmin } from '@/redux/auth/selectors';

import useLanguage from '@/locale/useLanguage';
import logoIcon from '@/style/images/shelbylogo.png';

import useResponsive from '@/hooks/useResponsive';

import {
  SettingOutlined,
  CustomerServiceOutlined,
  ContainerOutlined,
  FileSyncOutlined,
  DashboardOutlined,
  CreditCardOutlined,
  MenuOutlined,
  ShopOutlined,
  WalletOutlined,
  ReconciliationOutlined,
  CarOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

export default function Navigation() {
  const { isMobile } = useResponsive();
  return isMobile ? <MobileSidebar /> : <Sidebar collapsible={false} />;
}

function Sidebar({ collapsible, isMobile = false }) {
  let location = useLocation();

  const { state: stateApp, appContextAction } = useAppContext();
  const { isNavMenuClose } = stateApp;
  const { navMenu } = appContextAction;
  const [currentPath, setCurrentPath] = useState(location.pathname.slice(1));

  const translate = useLanguage();
  const navigate = useNavigate();
  const isAdmin = useSelector(selectIsAdmin);

  const baseItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to={'/'}>{translate('dashboard')}</Link>,
    },
    {
      key: 'customer',
      icon: <CustomerServiceOutlined />,
      label: <Link to={'/customer'}>{translate('customers')}</Link>,
    },
    {
      key: 'vehicle',
      icon: <CarOutlined />,
      label: <Link to={'/vehicle'}>Vehicles</Link>,
    },
    {
      key: 'invoice',
      icon: <ContainerOutlined />,
      label: <Link to={'/invoice'}>{translate('invoices')}</Link>,
    },
    {
      key: 'quote',
      icon: <FileSyncOutlined />,
      label: <Link to={'/quote'}>{translate('quote')}</Link>,
    },
    {
      key: 'payment',
      icon: <CreditCardOutlined />,
      label: <Link to={'/payment'}>{translate('payments')}</Link>,
    },
    {
      key: 'expense',
      icon: <WalletOutlined />,
      label: <Link to={'/expense'}>Expenses</Link>,
    },
    {
      key: 'paymentMode',
      icon: <WalletOutlined />,
      label: <Link to={'/payment/mode'}>{translate('payments_mode')}</Link>,
    },
    {
      key: 'taxes',
      icon: <ShopOutlined />,
      label: <Link to={'/taxes'}>{translate('taxes')}</Link>,
    },
  ];

  const adminItems = [
    {
      key: 'staff',
      icon: <TeamOutlined />,
      label: <Link to={'/staff'}>Staff</Link>,
    },
    {
      key: 'generalSettings',
      icon: <SettingOutlined />,
      label: <Link to={'/settings'}>{translate('settings')}</Link>,
    },
    {
      key: 'about',
      icon: <ReconciliationOutlined />,
      label: <Link to={'/about'}>{translate('about')}</Link>,
    },
  ];

  const items = isAdmin ? [...baseItems, ...adminItems] : baseItems;

  useEffect(() => {
    if (location) {
      if (currentPath !== location.pathname) {
        if (location.pathname === '/') {
          setCurrentPath('dashboard');
        } else {
          setCurrentPath(location.pathname.slice(1));
        }
      }
    }
  }, [location, currentPath]);


  const onCollapse = () => {
    navMenu.collapse();
  };

  return (
    <Sider
      collapsible={collapsible}
      collapsed={collapsible ? isNavMenuClose : collapsible}
      onCollapse={onCollapse}
      className="navigation"
      width={256}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: isMobile ? 'absolute' : 'relative',
        bottom: '20px',
        ...(!isMobile && {
          left: '20px',
          top: '20px',
        }),
      }}
      theme={'light'}
    >
      <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={logoIcon} alt="Logo" style={{ height: '80px', width: '200px', objectFit: 'contain' }} />
        </div>
      </div>
      <Menu
        items={items}
        mode="inline"
        theme={'light'}
        selectedKeys={[currentPath]}
        style={{ width: 256 }}
      />
    </Sider>
  );
}

function MobileSidebar() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button
        type="text"
        size="large"
        onClick={() => setVisible(true)}
        className="mobile-sidebar-btn"
        style={{ marginLeft: 25 }}
      >
        <MenuOutlined style={{ fontSize: 18 }} />
      </Button>
      <Drawer width={250} placement={'left'} closable={false} onClose={() => setVisible(false)} open={visible}>
        <Sidebar collapsible={false} isMobile={true} />
      </Drawer>
    </>
  );
}
