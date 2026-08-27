import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Spin,
  Empty,
  Typography,
  Space,
  Progress,
  Alert,
} from 'antd';
import {
  TeamOutlined,
  BuildOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import api from '../api/axios';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message="Error loading dashboard" type="error" />;
  }

  const { stats, recent } = data || {};

  const statusColors = {
    new: 'blue',
    contacted: 'orange',
    qualified: 'green',
    lost: 'red',
    converted: 'green',
    pending: 'orange',
    'in-progress': 'blue',
    completed: 'green',
    cancelled: 'red',
  };

  const leadColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Company',
      dataIndex: ['company', 'name'],
      key: 'company',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status] || 'default'}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
  ];

  const taskColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Lead',
      dataIndex: ['lead', 'name'],
      key: 'lead',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Assigned To',
      dataIndex: ['assignedTo', 'name'],
      key: 'assignedTo',
      render: (text) => text || 'Unassigned',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status] || 'default'}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>Dashboard</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Leads"
              value={stats?.totalLeads || 0}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ArrowUpOutlined style={{ color: '#52c41a' }} /> 12% this month
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Companies"
              value={stats?.totalCompanies || 0}
              prefix={<BuildOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ArrowUpOutlined style={{ color: '#52c41a' }} /> 8% this month
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Tasks"
              value={stats?.totalTasks || 0}
              prefix={<CheckCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ArrowUpOutlined style={{ color: '#52c41a' }} /> 5% this month
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Lead Status Distribution">
            {stats?.leadsByStatus && Object.keys(stats.leadsByStatus).length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {Object.entries(stats.leadsByStatus).map(([status, count]) => {
                  const total = stats.totalLeads || 1;
                  const percent = Math.round((count / total) * 100);
                  return (
                    <div key={status}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text>{status}</Text>
                        <Text strong>{count}</Text>
                      </div>
                      <Progress
                        percent={percent}
                        showInfo={false}
                        strokeColor={
                          status === 'New' ? '#1890ff' :
                          status === 'Contacted' ? '#faad14' :
                          status === 'Qualified' ? '#52c41a' :
                          status === 'Lost' ? '#ff4d4f' : '#52c41a'
                        }
                      />
                    </div>
                  );
                })}
              </Space>
            ) : (
              <Empty description="No leads data available" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Task Status Distribution">
            {stats?.tasksByStatus && Object.keys(stats.tasksByStatus).length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {Object.entries(stats.tasksByStatus).map(([status, count]) => {
                  const total = stats.totalTasks || 1;
                  const percent = Math.round((count / total) * 100);
                  return (
                    <div key={status}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text>{status}</Text>
                        <Text strong>{count}</Text>
                      </div>
                      <Progress
                        percent={percent}
                        showInfo={false}
                        strokeColor={
                          status === 'Pending' ? '#faad14' :
                          status === 'In Progress' ? '#1890ff' :
                          status === 'Completed' ? '#52c41a' : '#ff4d4f'
                        }
                      />
                    </div>
                  );
                })}
              </Space>
            ) : (
              <Empty description="No tasks data available" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Recent Leads">
            {recent?.leads && recent.leads.length > 0 ? (
              <Table
                dataSource={recent.leads}
                columns={leadColumns}
                pagination={false}
                size="small"
                rowKey="_id"
              />
            ) : (
              <Empty description="No recent leads" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Recent Tasks">
            {recent?.tasks && recent.tasks.length > 0 ? (
              <Table
                dataSource={recent.tasks}
                columns={taskColumns}
                pagination={false}
                size="small"
                rowKey="_id"
              />
            ) : (
              <Empty description="No recent tasks" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;