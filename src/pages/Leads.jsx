import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Dropdown,
  message,
  Spin,
  Typography,
  Row,
  Col,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import api from '../api/axios';

const { Title } = Typography;
const { Option } = Select;

const Leads = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['leads', currentPage, pageSize, search, statusFilter],
    queryFn: async () => {
      const response = await api.get('/leads', {
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

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/leads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      message.success('Lead deleted successfully');
      setDeleteModalVisible(false);
    },
    onError: () => {
      message.error('Failed to delete lead');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/leads/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      message.success('Lead status updated');
    },
    onError: () => {
      message.error('Failed to update status');
    },
  });

  const handleDelete = (lead) => {
    setSelectedLead(lead);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedLead) {
      deleteMutation.mutate(selectedLead._id);
    }
  };

  const handleStatusChange = (lead, status) => {
    updateStatusMutation.mutate({ id: lead._id, status });
  };

  const getStatusTag = (status) => {
    const colorMap = {
      new: 'blue',
      contacted: 'orange',
      qualified: 'green',
      lost: 'red',
      converted: 'green',
    };
    return <Tag color={colorMap[status] || 'default'}>{status.toUpperCase()}</Tag>;
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text) => <Text strong>{text}</Text>,
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
      title: 'Company',
      dataIndex: ['company', 'name'],
      key: 'company',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Assigned To',
      dataIndex: ['assignedTo', 'name'],
      key: 'assignedTo',
      render: (text) => text || 'Unassigned',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => {
        const statusMenu = {
          items: [
            { key: 'contacted', label: 'Mark as Contacted' },
            { key: 'qualified', label: 'Mark as Qualified' },
            { key: 'converted', label: 'Mark as Converted' },
            { key: 'lost', label: 'Mark as Lost' },
          ],
          onClick: ({ key }) => handleStatusChange(record, key),
        };

        return (
          <Space>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/leads/${record._id}/edit`)}
              size="small"
            />
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/leads/${record._id}/edit`)}
              size="small"
            />
            <Dropdown menu={statusMenu} placement="bottomRight">
              <Button type="text" icon={<MoreOutlined />} size="small" />
            </Dropdown>
            <Popconfirm
              title="Delete Lead"
              description={`Are you sure you want to delete ${record.name}?`}
              onConfirm={() => handleDelete(record)}
              okText="Yes"
              cancelText="No"
              okType="danger"
            >
              <Button type="text" icon={<DeleteOutlined />} danger size="small" />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

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
        <Title level={3} style={{ margin: 0 }}>Leads</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/leads/new')}
        >
          Add Lead
        </Button>
      </div>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search leads..."
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
              <Option value="new">New</Option>
              <Option value="contacted">Contacted</Option>
              <Option value="qualified">Qualified</Option>
              <Option value="lost">Lost</Option>
              <Option value="converted">Converted</Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={data?.leads}
          rowKey="_id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: data?.pagination?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} leads`,
            onChange: (page, size) => {
              setCurrentPage(page);
              if (size) setPageSize(size);
            },
          }}
        />
      </Card>

      <Modal
        title="Delete Lead"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete <strong>{selectedLead?.name}</strong>?</p>
        <p style={{ color: '#ff4d4f', fontSize: 12 }}>
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Leads;