import { Result } from 'antd';
import useLanguage from '@/locale/useLanguage';

const About = () => {
  const translate = useLanguage();
  return (
    <Result
      status="info"
      title="Shelby Auto Works"
      subTitle="Garage Management System"
      extra={
        <p style={{ color: '#888' }}>
          {translate('Contact us')} : shelbyautoworks125@gmail.com
        </p>
      }
    />
  );
};

export default About;
