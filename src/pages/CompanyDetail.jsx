import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Descriptions,
  Table,
  Tag,
  Button,
  Spin,
  Typography,
  Space,
  Row,
  Col,
  Alert,
} from 'antd';
import { ArrowLeftOutlined, BuildOutlined } from '@ant-design/icons';
import api from '../api/axios';

const { Title, Text } = Typography;

const CompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      const response = await api.get(`/companies/${id}`);
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
    return <Alert message="Error loading company" type="error" />;
  }

  if (!data) {
    return <Alert message="Company not found" type="warning" />;
  }

  const { company, leads } = data;

  const leadColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          new: 'blue',
          contacted: 'orange',
          qualified: 'green',
          lost: 'red',
          converted: 'green',
        };
        return <Tag color={colorMap[status] || 'default'}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Assigned To',
      dataIndex: ['assignedTo', 'name'],
      key: 'assignedTo',
      render: (text) => text || 'Unassigned',
    },
  ];

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/companies')}
        style={{ marginBottom: 16 }}
      >
        Back to Companies
      </Button>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card>
            <Space size="middle" style={{ marginBottom: 16 }}>
              <BuildOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              <Title level={3} style={{ margin: 0 }}>
                {company.name}
              </Title>
            </Space>

            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="Company Name">
                {company.name}
              </Descriptions.Item>
              <Descriptions.Item label="Industry">
                {company.industry || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {company.email || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {company.phone || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Website">
                {company.website || 'N/A'}
              </Descriptions.Item>
              {company.address && (
                <Descriptions.Item label="Address">
                  {[
                    company.address.street,
                    company.address.city,
                    company.address.state,
                    company.address.zipCode,
                    company.address.country,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <span>Associated Leads</span>
                <Tag color="blue">{leads?.length || 0}</Tag>
              </Space>
            }
          >
            {leads && leads.length > 0 ? (
              <Table
                columns={leadColumns}
                dataSource={leads}
                rowKey="_id"
                pagination={false}
                size="small"
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Text type="secondary">No leads associated with this company</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CompanyDetail;