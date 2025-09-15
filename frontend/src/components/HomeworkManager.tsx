import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Typography,
  Tag,
  Progress,
  Tooltip,
  Badge,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  BookOutlined,
  ExperimentOutlined,
  EditOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEditor, EditorContent } from '@tiptap/react';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface HomeworkTarget {
  id: string;
  name: string;
}

interface Homework {
  id: string;
  title: string;
  category: string;
  type: 'chapter' | 'selftest';
  deadline: string;
  content: string;
  targets: HomeworkTarget[];
  createdAt: string;
  submissionStats: {
    total: number;
    submitted: number;
    pending: number;
  };
}

interface Submission {
  id: string;
  homeworkId: string;
  targetName: string;
  submittedAt?: string;
  status: 'submitted' | 'pending' | 'late';
  content?: string;
}

// 더미 데이터
const dummyTargets: HomeworkTarget[] = [
  { id: '1', name: '김세실' },
  { id: '2', name: '이나경' },
  { id: '3', name: '이용균' },
  { id: '4', name: '박기현' },
  { id: '5', name: '김재원' },
  { id: '6', name: '이용재' },
];

const dummyHomeworks: Homework[] = [
  {
    id: '1',
    title: '프로토콜의 3요소에 대해 설명하세요',
    category: '네트워크',
    type: 'chapter',
    deadline: '2024-09-15',
    content: '프로토콜의 3요소(구문, 의미, 타이밍)에 대해 각각의 의미와 특징을 설명하세요.',
    targets: dummyTargets.slice(0, 4),
    createdAt: '2024-09-01',
    submissionStats: { total: 4, submitted: 3, pending: 1 },
  },
  {
    id: '2',
    title: '1교시형) TCP와 UDP를 비교 설명하시오.',
    category: '네트워크',
    type: 'selftest',
    deadline: '2024-09-20',
    content: 'TCP와 UDP 프로토콜의 특징, 장단점, 사용 용도를 비교하여 설명하시오.',
    targets: dummyTargets,
    createdAt: '2024-09-05',
    submissionStats: { total: 6, submitted: 2, pending: 4 },
  },
];

const dummySubmissions: Submission[] = [
  { id: '1', homeworkId: '1', targetName: '김세실', submittedAt: '2024-09-14', status: 'submitted' },
  { id: '2', homeworkId: '1', targetName: '이나경', submittedAt: '2024-09-13', status: 'submitted' },
  { id: '3', homeworkId: '1', targetName: '이용균', submittedAt: '2024-09-16', status: 'late' },
  { id: '4', homeworkId: '1', targetName: '박기현', status: 'pending' },
  { id: '5', homeworkId: '2', targetName: '김세실', submittedAt: '2024-09-18', status: 'submitted' },
  { id: '6', homeworkId: '2', targetName: '이나경', submittedAt: '2024-09-19', status: 'submitted' },
  { id: '7', homeworkId: '2', targetName: '이용균', status: 'pending' },
  { id: '8', homeworkId: '2', targetName: '박기현', status: 'pending' },
  { id: '9', homeworkId: '2', targetName: '김재원', status: 'pending' },
  { id: '10', homeworkId: '2', targetName: '이용재', status: 'pending' },
];

const HomeworkManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chapter' | 'selftest'>('chapter');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [form] = Form.useForm();

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
  });

  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
    editor?.commands.clearContent();
  };

  const showDetailModal = (homework: Homework) => {
    setSelectedHomework(homework);
    setIsDetailModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsDetailModalVisible(false);
    setSelectedHomework(null);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    console.log('숙제 등록:', {
      ...values,
      content: editor?.getHTML(),
      type: activeTab,
    });
    setIsModalVisible(false);
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Tag icon={<CheckCircleOutlined />} color="success">제출완료</Tag>;
      case 'late':
        return <Tag icon={<ExclamationCircleOutlined />} color="warning">지각제출</Tag>;
      case 'pending':
        return <Tag icon={<ClockCircleOutlined />} color="default">미제출</Tag>;
      default:
        return <Tag>알 수 없음</Tag>;
    }
  };

  const getFilteredHomeworks = () => {
    return dummyHomeworks.filter(hw => hw.type === activeTab);
  };

  const homeworkColumns = [
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Homework) => (
        <Button type="link" onClick={() => showDetailModal(record)}>
          {title}
        </Button>
      ),
    },
    {
      title: '카테고리',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: '제출기한',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (deadline: string) => (
        <span>
          <CalendarOutlined style={{ marginRight: 4 }} />
          {deadline}
        </span>
      ),
    },
    {
      title: '대상자',
      dataIndex: 'targets',
      key: 'targets',
      render: (targets: HomeworkTarget[]) => (
        <span>
          <UserOutlined style={{ marginRight: 4 }} />
          {targets.length}명
        </span>
      ),
    },
    {
      title: '제출현황',
      key: 'submissionStats',
      render: (record: Homework) => {
        const { submitted, total } = record.submissionStats;
        const percentage = total > 0 ? Math.round((submitted / total) * 100) : 0;
        return (
          <div style={{ width: 120 }}>
            <Progress 
              percent={percentage} 
              size="small" 
              format={() => `${submitted}/${total}`}
            />
          </div>
        );
      },
    },
    {
      title: '작업',
      key: 'actions',
      render: (record: Homework) => (
        <Space>
          <Tooltip title="상세보기">
            <Button 
              icon={<EyeOutlined />} 
              size="small" 
              onClick={() => showDetailModal(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const submissionColumns = [
    {
      title: '대상자',
      dataIndex: 'targetName',
      key: 'targetName',
    },
    {
      title: '제출상태',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '제출일시',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (submittedAt?: string) => submittedAt || '-',
    },
  ];

  const getSubmissionsForHomework = (homeworkId: string) => {
    return dummySubmissions.filter(sub => sub.homeworkId === homeworkId);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <BookOutlined style={{ marginRight: 8 }} />
        숙제 관리
      </Title>

      <Tabs 
        activeKey={activeTab} 
        onChange={(key) => setActiveTab(key as 'chapter' | 'selftest')}
        tabBarExtraContent={
          <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
            숙제 등록
          </Button>
        }
      >
        <TabPane
          tab={
            <span>
              <BookOutlined />
              목차과제
            </span>
          }
          key="chapter"
        >
          <Table
            dataSource={getFilteredHomeworks()}
            columns={homeworkColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
        <TabPane
          tab={
            <span>
              <ExperimentOutlined />
              셀프테스트 과제
            </span>
          }
          key="selftest"
        >
          <Table
            dataSource={getFilteredHomeworks()}
            columns={homeworkColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
      </Tabs>

      {/* 숙제 등록 모달 */}
      <Modal
        title={`${activeTab === 'chapter' ? '목차과제' : '셀프테스트 과제'} 등록`}
        open={isModalVisible}
        onCancel={handleCancel}
        width={800}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="제목"
            rules={[{ required: true, message: '제목을 입력하세요' }]}
          >
            <Input placeholder="숙제 제목을 입력하세요" />
          </Form.Item>

          <Form.Item
            name="category"
            label="카테고리"
            rules={[{ required: true, message: '카테고리를 선택하세요' }]}
          >
            <Select placeholder="카테고리를 선택하세요">
              <Option value="정보시스템">정보시스템</Option>
              <Option value="데이터베이스">데이터베이스</Option>
              <Option value="네트워크">네트워크</Option>
              <Option value="소프트웨어공학">소프트웨어공학</Option>
              <Option value="보안">보안</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="deadline"
            label="제출기한"
            rules={[{ required: true, message: '제출기한을 선택하세요' }]}
          >
            <DatePicker 
              style={{ width: '100%' }}
              placeholder="제출기한을 선택하세요"
              format="YYYY-MM-DD"
            />
          </Form.Item>

          <Form.Item
            name="targets"
            label="숙제 대상"
            rules={[{ required: true, message: '대상자를 선택하세요' }]}
          >
            <Select 
              mode="multiple"
              placeholder="대상자를 선택하세요"
              style={{ width: '100%' }}
            >
              {dummyTargets.map(target => (
                <Option key={target.id} value={target.id}>
                  {target.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="내용">
            <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 8 }}>
              <EditorContent editor={editor} />
            </div>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                등록
              </Button>
              <Button onClick={handleCancel}>
                취소
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 숙제 상세/제출현황 모달 */}
      <Modal
        title="숙제 상세 및 제출현황"
        open={isDetailModalVisible}
        onCancel={handleCancel}
        width={900}
        footer={null}
      >
        {selectedHomework && (
          <div>
            <Card title="숙제 정보" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <p><strong>제목:</strong> {selectedHomework.title}</p>
                  <p><strong>카테고리:</strong> <Tag color="blue">{selectedHomework.category}</Tag></p>
                  <p><strong>유형:</strong> {selectedHomework.type === 'chapter' ? '목차과제' : '셀프테스트 과제'}</p>
                </Col>
                <Col span={12}>
                  <p><strong>제출기한:</strong> {selectedHomework.deadline}</p>
                  <p><strong>등록일:</strong> {selectedHomework.createdAt}</p>
                  <p><strong>대상자:</strong> {selectedHomework.targets.length}명</p>
                </Col>
              </Row>
              <div>
                <strong>내용:</strong>
                <div 
                  style={{ 
                    marginTop: 8, 
                    padding: 12, 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: 4 
                  }}
                  dangerouslySetInnerHTML={{ __html: selectedHomework.content }}
                />
              </div>
            </Card>

            <Card title="제출 현황">
              <div style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Badge count={selectedHomework.submissionStats.submitted} showZero>
                      <Button>제출완료</Button>
                    </Badge>
                  </Col>
                  <Col span={8}>
                    <Badge count={selectedHomework.submissionStats.pending} showZero>
                      <Button>미제출</Button>
                    </Badge>
                  </Col>
                  <Col span={8}>
                    <Progress 
                      percent={Math.round((selectedHomework.submissionStats.submitted / selectedHomework.submissionStats.total) * 100)}
                      format={percent => `${percent}%`}
                    />
                  </Col>
                </Row>
              </div>
              
              <Table
                dataSource={getSubmissionsForHomework(selectedHomework.id)}
                columns={submissionColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HomeworkManager;