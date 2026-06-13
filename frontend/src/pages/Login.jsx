import { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import useLanguage from '@/locale/useLanguage';

import { Form, Button } from 'antd';

import { login, register, resetState } from '@/redux/auth/actions';
import { selectAuth } from '@/redux/auth/selectors';
import LoginForm from '@/forms/LoginForm';
import Loading from '@/components/Loading';
import AuthModule from '@/modules/AuthModule';
import RegisterForm from '@/forms/RegisterForm';

const LoginPage = () => {
  const translate = useLanguage();
  const { isLoading, isSuccess } = useSelector(selectAuth);
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);

  const dispatch = useDispatch();
  
  const onFinish = (values) => {
    if (isRegister) {
      dispatch(register({ registerData: values }));
    } else {
      dispatch(login({ loginData: values }));
    }
  };

  useEffect(() => {
    if (isSuccess) {
      navigate('/');
      // Reset auth state after successful navigation to prevent lingering states
      setTimeout(() => {
        dispatch(resetState());
      }, 100);
    }
  }, [isSuccess, navigate, dispatch]);

  const FormContainer = () => {
    return (
      <Loading isLoading={isLoading}>
        <Form
          layout="vertical"
          name="normal_login"
          className="login-form"
          initialValues={{
            remember: true,
            email:'admin@admin.com',
            password:'admin123',
          }}
          onFinish={onFinish}
        >
          {isRegister ? <RegisterForm /> : <LoginForm />}
          
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              loading={isLoading}
              size="large"
            >
              {isRegister ? translate('Register') : translate('Log in')}
            </Button>
          </Form.Item>
          
          {
            isRegister ? (
              <div style={{ textAlign: 'center' }}>
                {translate('Already have an account?')}{' '}
                <a onClick={() => setIsRegister(false)} style={{ fontWeight: 600 }}>
                  {translate('Login')}
                </a>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                {translate('New Here?')}{' '}
                <a onClick={() => setIsRegister(true)} style={{ fontWeight: 600 }}>
                  {translate('Register')}
                </a>
              </div>
            )
          }
         
        </Form>
      </Loading>
    );
  };

  return <AuthModule authContent={<FormContainer />} AUTH_TITLE={isRegister ? "Sign up" : "Sign in"} />;
};

export default LoginPage;
