import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Tabs,
  Typography,
  Alert,
  Layout,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Content } = Layout;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const onFinish = async (values) => {
    setError('');
    setLoading(true);

    const { name, email, password, activeTab } = values;
    let result;

    if (activeTab === '1') {
      result = await login(email, password);
    } else {
      result = await register(name, email, password);
    }

    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}>
        <Card style={{ maxWidth: 420, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#1890ff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Text style={{ color: 'white', fontSize: 28, fontWeight: 700 }}>C</Text>
            </div>
            <Title level={2} style={{ margin: 0 }}>Mini CRM</Title>
            <Text type="secondary">Manage your leads, companies & tasks</Text>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: 20 }}
              closable
              onClose={() => setError('')}
            />
          )}

          <Tabs defaultActiveKey="1" centered>
            <TabPane tab="Sign In" key="1">
              <Form
                name="login"
                onFinish={onFinish}
                layout="vertical"
                size="large"
              >
                <Form.Item
                  name="activeTab"
                  initialValue="1"
                  hidden
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email!' },
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined />} 
                    placeholder="Email Address" 
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Please input your password!' }]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />} 
                    placeholder="Password" 
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                  >
                    Sign In
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane tab="Sign Up" key="2">
              <Form
                name="register"
                onFinish={onFinish}
                layout="vertical"
                size="large"
              >
                <Form.Item
                  name="activeTab"
                  initialValue="2"
                  hidden
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="name"
                  rules={[{ required: true, message: 'Please input your name!' }]}
                >
                  <Input 
                    prefix={<UserOutlined />} 
                    placeholder="Full Name" 
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email!' },
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined />} 
                    placeholder="Email Address" 
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: 'Please input your password!' },
                    { min: 6, message: 'Password must be at least 6 characters!' },
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />} 
                    placeholder="Password" 
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                  >
                    Create Account
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              © 2024 Mini CRM. All rights reserved.
            </Text>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default Login;