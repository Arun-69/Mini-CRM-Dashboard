import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout as AntLayout,
  Menu,
  Avatar,
  Dropdown,
  Space,
  Badge,
  Button,
  Typography,
  theme,
} from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  BuildOutlined,
  CheckCircleOutlined,
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = AntLayout;
const { Text } = Typography;

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/leads',
      icon: <TeamOutlined />,
      label: 'Leads',
    },
    {
      key: '/companies',
      icon: <BuildOutlined />,
      label: 'Companies',
    },
    {
      key: '/tasks',
      icon: <CheckCircleOutlined />,
      label: 'Tasks',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: '#001529',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
        width={240}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px',
          background: 'rgba(255,255,255,0.05)',
        }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>
            {collapsed ? 'CRM' : 'Mini CRM'}
          </Text>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 'none', padding: '8px 0' }}
        />

        {!collapsed && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}>
            <Space>
              <Avatar style={{ backgroundColor: '#1890ff' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <div>
                <Text style={{ color: 'white', display: 'block', fontSize: 13 }}>
                  {user?.name}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
                  {user?.role || 'User'}
                </Text>
              </div>
            </Space>
          </div>
        )}
      </Sider>

      <AntLayout style={{ marginLeft: collapsed ? 80 : 240, transition: 'all 0.2s' }}>
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 999,
          width: '100%',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 40, height: 40 }}
            />
            <Text strong style={{ fontSize: 18 }}>
              {menuItems.find(item => item.key === location.pathname)?.label || 'Dashboard'}
            </Text>
          </div>

          <Space size="middle">
            <Badge count={0} dot>
              <Button type="text" icon={<BellOutlined />} size="large" />
            </Badge>
            
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#1890ff' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Text>{user?.name}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{
          padding: '24px',
          minHeight: 'calc(100vh - 64px)',
          background: '#f0f2f5',
        }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;