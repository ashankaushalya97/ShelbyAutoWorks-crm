import { Layout } from 'antd';
import logo from '@/style/images/shelbylogo.png';

const { Content } = Layout;

export default function SideContent() {
  return (
    <Content
      style={{
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
      className="sideContent"
    >
      <div style={{ width: '100%' }}>
        <img
          src={logo}
          alt="Shelby Auto Works"
          style={{ display: 'block', objectFit: 'contain' }}
          height={150}
          width={500}
        />
      </div>
    </Content>
  );
}
