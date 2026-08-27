import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Modal,
  Form,
  message,
  Spin,
  Typography,
  Row,
  Col,
  DatePicker,
  Dropdown,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../api/axios';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Tasks = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', currentPage, pageSize, search, statusFilter],
    queryFn: async () => {
      const response = await api.get('/tasks', {
        params: {
          page: currentPage,
          limit: pageSize,
          search: search || undefined,
          status: statusFilter || undefined,
        },
      });
      return response.data;
    },
  });

  const { data: leadsData } = useQuery({
    queryKey: ['leadsForTasks'],
    queryFn: async () => {
      const response = await api.get('/leads', { params: { limit: 100 } });
      return response.data.leads;
    },
  });

  const { data: usersData } = useQuery({
    queryKey: ['usersForTasks'],
    queryFn: async () => {
      const response = await api.get('/auth/users');
      return response.data.users;
    },
  });

  const createMutation = useMutation({
    mutationFn: (values) => api.post('/tasks', values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      message.success('Task created successfully');
      setModalVisible(false);
      form.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to create task');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/tasks/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      message.success('Task status updated');
    },
    onError: () => {
      message.error('Failed to update task status');
    },
  });

  const getStatusTag = (status) => {
    const colorMap = {
      pending: 'orange',
      'in-progress': 'blue',
      completed: 'green',
      cancelled: 'red',
    };
    return <Tag color={colorMap[status] || 'default'}>{status.toUpperCase()}</Tag>;
  };

  const getPriorityTag = (priority) => {
    const colorMap = {
      low: 'blue',
      medium: 'orange',
      high: 'red',
    };
    return <Tag color={colorMap[priority] || 'default'}>{priority.toUpperCase()}</Tag>;
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <Text strong>{text}</Text>,
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
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => getPriorityTag(priority),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => {
        const statusMenu = {
          items: [
            { key: 'in-progress', label: 'Mark as In Progress' },
            { key: 'completed', label: 'Mark as Completed' },
            { key: 'cancelled', label: 'Mark as Cancelled' },
          ],
          onClick: ({ key }) => {
            if (record.assignedTo?._id) {
              updateStatusMutation.mutate({ id: record._id, status: key });
            } else {
              message.warning('Only assigned users can update task status');
            }
          },
        };

        return (
          <Dropdown menu={statusMenu} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined />} size="small" />
          </Dropdown>
        );
      },
    },
  ];

  const onFinish = (values) => {
    createMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Tasks</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Add Task
        </Button>
      </div>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search tasks..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
            >
              <Option value="pending">Pending</Option>
              <Option value="in-progress">In Progress</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={data?.tasks}
          rowKey="_id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: data?.pagination?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} tasks`,
            onChange: (page, size) => {
              setCurrentPage(page);
              if (size) setPageSize(size);
            },
          }}
        />
      </Card>

      <Modal
        title="Add New Task"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          size="large"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="title"
            label="Task Title"
            rules={[{ required: true, message: 'Please enter task title' }]}
          >
            <Input placeholder="Enter task title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Enter task description" />
          </Form.Item>

          <Form.Item
            name="lead"
            label="Lead"
            rules={[{ required: true, message: 'Please select a lead' }]}
          >
            <Select placeholder="Select lead">
              {leadsData?.map((lead) => (
                <Option key={lead._id} value={lead._id}>
                  {lead.name} ({lead.email})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="assignedTo"
            label="Assign To"
            rules={[{ required: true, message: 'Please select a user' }]}
          >
            <Select placeholder="Select user">
              {usersData?.map((user) => (
                <Option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Priority"
                initialValue="medium"
              >
                <Select>
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dueDate"
                label="Due Date"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending}
                icon={<CheckCircleOutlined />}
              >
                Create Task
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Tasks;