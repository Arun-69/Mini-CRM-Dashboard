import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  message,
  Spin,
  Typography,
  Row,
  Col,
  Space,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import api from '../api/axios';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const LeadForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const { data: leadData, isLoading: isLoadingLead } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get(`/leads/${id}`);
      return response.data.lead;
    },
    enabled: !!id,
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/auth/users');
      return response.data.users;
    },
  });

  useEffect(() => {
    if (leadData) {
      form.setFieldsValue({
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        companyName: leadData.company?.name,
        status: leadData.status,
        source: leadData.source,
        notes: leadData.notes,
        assignedTo: leadData.assignedTo?._id,
      });
    }
  }, [leadData, form]);

  const mutation = useMutation({
    mutationFn: (data) => {
      if (id) {
        return api.put(`/leads/${id}`, data);
      }
      return api.post('/leads', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      message.success(id ? 'Lead updated successfully' : 'Lead created successfully');
      navigate('/leads');
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to save lead');
    },
  });

  const onFinish = (values) => {
    mutation.mutate(values);
  };

  if (isLoadingLead) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/leads')}
        >
          Back
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          {id ? 'Edit Lead' : 'Add New Lead'}
        </Title>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          size="large"
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter name' }]}
              >
                <Input placeholder="Enter lead name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter valid email' },
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="companyName"
                label="Company Name"
              >
                <Input placeholder="Enter company name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                name="status"
                label="Status"
                initialValue="new"
              >
                <Select>
                  <Option value="new">New</Option>
                  <Option value="contacted">Contacted</Option>
                  <Option value="qualified">Qualified</Option>
                  <Option value="lost">Lost</Option>
                  <Option value="converted">Converted</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="source"
                label="Source"
                initialValue="other"
              >
                <Select>
                  <Option value="website">Website</Option>
                  <Option value="referral">Referral</Option>
                  <Option value="social">Social Media</Option>
                  <Option value="email">Email</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="assignedTo"
                label="Assign To"
              >
                <Select placeholder="Select user" allowClear>
                  <Option value="">Unassigned</Option>
                  {usersData?.map((user) => (
                    <Option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea rows={4} placeholder="Add any additional notes" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={mutation.isPending}
              >
                {id ? 'Update Lead' : 'Create Lead'}
              </Button>
              <Button onClick={() => navigate('/leads')}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LeadForm;