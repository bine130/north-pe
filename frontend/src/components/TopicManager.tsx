import React, { useState, useEffect } from 'react';
import {
  Layout,
  Row,
  Col,
  Card,
  Button,
  Input,
  Select,
  Table,
  Space,
  message,
  Modal,
  Tag,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { Topic, topicApi } from '../services/api';
import TopicEditor from './TopicEditor';

const { Search } = Input;
const { Option } = Select;

const TopicManager: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [searchType, setSearchType] = useState('all');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyVersions, setHistoryVersions] = useState<any[]>([]);
  const [historyTitle, setHistoryTitle] = useState('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailTopic, setDetailTopic] = useState<Topic | null>(null);
  const [isVersionDetailOpen, setIsVersionDetailOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    setLoading(true);
    try {
      const data = await topicApi.getAll();
      setTopics(data);
    } catch (error) {
      message.error('토픽을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    if (!value) {
      loadTopics();
      return;
    }
    setLoading(true);
    try {
      const data = await topicApi.search(value, searchType);
      setTopics(data);
    } catch (error) {
      message.error('검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedTopic(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '토픽 삭제',
      content: '정말로 이 토픽을 삭제하시겠습니까?',
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: async () => {
        try {
          await topicApi.delete(id);
          message.success('토픽이 삭제되었습니다.');
          loadTopics();
        } catch (error) {
          message.error('토픽 삭제에 실패했습니다.');
        }
      },
    });
  };

  const handleViewDetail = (topic: Topic) => {
    setDetailTopic(topic);
    setIsDetailModalOpen(true);
  };

  const handleViewVersion = (version: any, topic: Topic) => {
    setSelectedVersion(version);
    setCurrentTopic(topic);
    setIsVersionDetailOpen(true);
  };

  const handleViewHistory = async (topic: Topic) => {
    console.log('ViewHistory clicked for topic:', topic);
    try {
      const versions = await topicApi.getVersions(topic.id!);
      console.log('Versions received:', versions);
      
      if (!versions || versions.length === 0) {
        message.info('버전 이력이 없습니다.');
        return;
      }

      setHistoryVersions(versions);
      setHistoryTitle(topic.title);
      setCurrentTopic(topic);
      setIsHistoryModalOpen(true);
    } catch (error) {
      console.error('Version history error:', error);
      message.error('버전 이력을 불러오는데 실패했습니다.');
    }
  };

  const handleRestoreVersion = async () => {
    if (!selectedVersion || !currentTopic) return;
    
    Modal.confirm({
      title: '버전 복원',
      content: `버전 ${selectedVersion.version}으로 복원하시겠습니까? 현재 내용이 덮어쓰여집니다.`,
      okText: '복원',
      okType: 'primary',
      cancelText: '취소',
      onOk: async () => {
        try {
          const restoreData = {
            title: selectedVersion.title,
            content: selectedVersion.content,
            category: selectedVersion.category,
          };
          
          await topicApi.update(currentTopic.id!, restoreData);
          message.success(`버전 ${selectedVersion.version}으로 복원되었습니다.`);
          
          // 모달 닫고 데이터 새로고침
          setIsVersionDetailOpen(false);
          setIsHistoryModalOpen(false);
          loadTopics();
        } catch (error) {
          message.error('버전 복원에 실패했습니다.');
        }
      },
    });
  };

  const columns = [
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
      render: (text: string, record: Topic) => (
        <Button
          type="link"
          onClick={() => handleViewDetail(record)}
          style={{ padding: 0, textAlign: 'left', height: 'auto' }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: '카테고리',
      dataIndex: 'category',
      key: 'category',
      width: '15%',
    },
    {
      title: '키워드',
      dataIndex: 'keywords',
      key: 'keywords',
      width: '25%',
      render: (keywords: any[]) => (
        <>
          {keywords?.map((k) => (
            <Tag key={k.id} color="blue">
              {k.keyword}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '암기법',
      dataIndex: 'mnemonics',
      key: 'mnemonics',
      width: '15%',
      render: (mnemonics: any[]) => (
        <>
          {mnemonics?.map((m) => (
            <Tag key={m.id} color="green">
              {m.mnemonic}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '작업',
      key: 'action',
      width: '15%',
      render: (_: any, record: Topic) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            icon={<HistoryOutlined />}
            onClick={() => handleViewHistory(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id!)}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Input.Group compact>
              <Select
                defaultValue="all"
                style={{ width: '30%' }}
                onChange={setSearchType}
              >
                <Option value="all">전체</Option>
                <Option value="title">제목</Option>
                <Option value="keyword">키워드</Option>
                <Option value="mnemonic">암기법</Option>
              </Select>
              <Search
                placeholder="검색어를 입력하세요"
                onSearch={handleSearch}
                style={{ width: '70%' }}
                enterButton={<SearchOutlined />}
              />
            </Input.Group>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              새 토픽 추가
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={topics}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}개`,
          }}
        />
      </Card>

      <TopicEditor
        open={isEditorOpen}
        topic={selectedTopic}
        onClose={() => setIsEditorOpen(false)}
        onSave={() => {
          setIsEditorOpen(false);
          loadTopics();
        }}
      />

      <Modal
        title={`${historyTitle} - 버전 이력`}
        open={isHistoryModalOpen}
        onCancel={() => setIsHistoryModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsHistoryModalOpen(false)}>
            닫기
          </Button>
        ]}
        width={800}
      >
        <div style={{ maxHeight: '400px', overflow: 'auto' }}>
          {historyVersions.map((v: any) => (
            <Card 
              key={v.id} 
              size="small" 
              style={{ 
                marginBottom: 8, 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              hoverable
              onClick={() => handleViewVersion(v, currentTopic!)}
            >
              <p><strong>버전 {v.version}</strong> - {new Date(v.created_at).toLocaleString()}</p>
              <p>변경자: {v.changed_by}</p>
              <p>변경 사유: {v.change_reason}</p>
              <p style={{ color: '#1890ff', fontSize: '12px', margin: 0 }}>클릭하여 상세보기</p>
            </Card>
          ))}
        </div>
      </Modal>

      <Modal
        title={detailTopic?.title}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="edit" type="primary" onClick={() => {
            setSelectedTopic(detailTopic);
            setIsDetailModalOpen(false);
            setIsEditorOpen(true);
          }}>
            수정
          </Button>,
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            닫기
          </Button>
        ]}
        width={1000}
      >
        {detailTopic && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <strong>카테고리:</strong> {detailTopic.category || '없음'}
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <strong>키워드:</strong>{' '}
              {detailTopic.keywords && detailTopic.keywords.length > 0 ? (
                detailTopic.keywords.map((k) => (
                  <Tag key={k.id} color="blue" style={{ marginRight: 4 }}>
                    {k.keyword}
                  </Tag>
                ))
              ) : (
                <span style={{ color: '#999' }}>없음</span>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <strong>암기법:</strong>{' '}
              {detailTopic.mnemonics && detailTopic.mnemonics.length > 0 ? (
                detailTopic.mnemonics.map((m) => (
                  <Tag key={m.id} color="green" style={{ marginRight: 4 }} title={m.full_text}>
                    {m.mnemonic}
                  </Tag>
                ))
              ) : (
                <span style={{ color: '#999' }}>없음</span>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <strong>출제 이력:</strong>{' '}
              {detailTopic.exam_histories && detailTopic.exam_histories.length > 0 ? (
                detailTopic.exam_histories.map((e) => (
                  <Tag key={e.id} color="orange" style={{ marginRight: 4 }}>
                    {e.exam_round} {e.question_number}
                    {e.score && ` (${e.score}점)`}
                  </Tag>
                ))
              ) : (
                <span style={{ color: '#999' }}>없음</span>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <strong>생성일:</strong> {new Date(detailTopic.created_at!).toLocaleString()}
            </div>

            <div style={{ marginBottom: 16 }}>
              <strong>수정일:</strong> {new Date(detailTopic.updated_at!).toLocaleString()}
            </div>

            <div>
              <strong>내용:</strong>
              <div 
                style={{ 
                  border: '1px solid #d9d9d9', 
                  borderRadius: 4, 
                  padding: 16, 
                  marginTop: 8,
                  maxHeight: '400px',
                  overflow: 'auto'
                }}
              >
                <div 
                  style={{ width: '100%' }}
                  dangerouslySetInnerHTML={{ __html: detailTopic.content || '<p>내용이 없습니다.</p>' }}
                />
                <style>{`
                  .ant-modal-body img {
                    width: 100% !important;
                    height: auto !important;
                    max-width: 100% !important;
                  }
                  .ant-modal-body table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 1em 0;
                  }
                  .ant-modal-body table td,
                  .ant-modal-body table th {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                  }
                  .ant-modal-body table th {
                    background-color: #f5f5f5;
                    font-weight: bold;
                  }
                  .ant-modal-body [style*="font-size: 12px"] { font-size: 12px !important; }
                  .ant-modal-body [style*="font-size: 14px"] { font-size: 14px !important; }
                  .ant-modal-body [style*="font-size: 16px"] { font-size: 16px !important; }
                  .ant-modal-body [style*="font-size: 18px"] { font-size: 18px !important; }
                  .ant-modal-body [style*="font-size: 20px"] { font-size: 20px !important; }
                  .ant-modal-body [style*="font-size: 24px"] { font-size: 24px !important; }
                  .ant-modal-body [style*="font-size: 28px"] { font-size: 28px !important; }
                  .ant-modal-body [style*="font-size: 32px"] { font-size: 32px !important; }
                `}</style>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={selectedVersion ? `${currentTopic?.title} - 버전 ${selectedVersion.version} 비교` : ''}
        open={isVersionDetailOpen}
        onCancel={() => setIsVersionDetailOpen(false)}
        footer={[
          <Button key="restore" type="primary" onClick={handleRestoreVersion}>
            이 버전으로 복원
          </Button>,
          <Button key="close" onClick={() => setIsVersionDetailOpen(false)}>
            닫기
          </Button>
        ]}
        width={1200}
      >
        {selectedVersion && currentTopic && (
          <div>
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f0f0f0', borderRadius: 4 }}>
              <strong>버전 정보:</strong>
              <br />
              버전 {selectedVersion.version} - {new Date(selectedVersion.created_at).toLocaleString()}
              <br />
              변경자: {selectedVersion.changed_by}
              <br />
              변경 사유: {selectedVersion.change_reason}
            </div>

            <div style={{ marginBottom: 16 }}>
              <strong>카테고리:</strong> {currentTopic.category || '없음'}
            </div>

            <Tabs defaultActiveKey="content" style={{ marginTop: 16 }}>
              <Tabs.TabPane tab="버전 내용" key="content">
                <div 
                  style={{ 
                    border: '1px solid #d9d9d9', 
                    borderRadius: 4, 
                    padding: 16, 
                    maxHeight: '400px',
                    overflow: 'auto',
                    backgroundColor: '#fafafa'
                  }}
                  dangerouslySetInnerHTML={{ __html: selectedVersion.content || '<p>내용이 없습니다.</p>' }}
                />
              </Tabs.TabPane>
              
              <Tabs.TabPane tab="현재 버전과 비교" key="compare">
                <Row gutter={16}>
                  <Col span={12}>
                    <h4 style={{ marginBottom: 8, color: '#ff4d4f' }}>이전 버전 (버전 {selectedVersion.version})</h4>
                    <div 
                      style={{ 
                        border: '1px solid #ff4d4f', 
                        borderRadius: 4, 
                        padding: 16, 
                        maxHeight: '400px',
                        overflow: 'auto',
                        backgroundColor: '#fff2f0'
                      }}
                      dangerouslySetInnerHTML={{ __html: selectedVersion.content || '<p>내용이 없습니다.</p>' }}
                    />
                  </Col>
                  
                  <Col span={12}>
                    <h4 style={{ marginBottom: 8, color: '#52c41a' }}>현재 버전</h4>
                    <div 
                      style={{ 
                        border: '1px solid #52c41a', 
                        borderRadius: 4, 
                        padding: 16, 
                        maxHeight: '400px',
                        overflow: 'auto',
                        backgroundColor: '#f6ffed'
                      }}
                      dangerouslySetInnerHTML={{ __html: currentTopic.content || '<p>내용이 없습니다.</p>' }}
                    />
                  </Col>
                </Row>
                
                <div style={{ marginTop: 16, padding: 12, backgroundColor: '#e6f7ff', borderRadius: 4 }}>
                  <strong>변경 요약:</strong>
                  <ul style={{ marginTop: 8, marginBottom: 0 }}>
                    <li>제목: {selectedVersion.title !== currentTopic.title ? `"${selectedVersion.title}" → "${currentTopic.title}"` : '변경 없음'}</li>
                    <li>카테고리: {selectedVersion.category !== currentTopic.category ? `"${selectedVersion.category || '없음'}" → "${currentTopic.category || '없음'}"` : '변경 없음'}</li>
                    <li>내용: {selectedVersion.content !== currentTopic.content ? '변경됨' : '변경 없음'}</li>
                  </ul>
                </div>
              </Tabs.TabPane>
            </Tabs>

            <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic', marginTop: 16 }}>
              💡 이것은 버전 {selectedVersion.version} 시점의 내용입니다. 현재 버전과 다를 수 있습니다.
            </div>
            
            <style>{`
              .ant-modal-body table {
                border-collapse: collapse;
                width: 100%;
                margin: 1em 0;
              }
              .ant-modal-body table td,
              .ant-modal-body table th {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              .ant-modal-body table th {
                background-color: #f5f5f5;
                font-weight: bold;
              }
              .ant-tabs-tabpane table {
                border-collapse: collapse;
                width: 100%;
                margin: 1em 0;
              }
              .ant-tabs-tabpane table td,
              .ant-tabs-tabpane table th {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              .ant-tabs-tabpane table th {
                background-color: #f5f5f5;
                font-weight: bold;
              }
              .ant-modal-body [style*="font-size: 12px"], .ant-tabs-tabpane [style*="font-size: 12px"] { font-size: 12px !important; }
              .ant-modal-body [style*="font-size: 14px"], .ant-tabs-tabpane [style*="font-size: 14px"] { font-size: 14px !important; }
              .ant-modal-body [style*="font-size: 16px"], .ant-tabs-tabpane [style*="font-size: 16px"] { font-size: 16px !important; }
              .ant-modal-body [style*="font-size: 18px"], .ant-tabs-tabpane [style*="font-size: 18px"] { font-size: 18px !important; }
              .ant-modal-body [style*="font-size: 20px"], .ant-tabs-tabpane [style*="font-size: 20px"] { font-size: 20px !important; }
              .ant-modal-body [style*="font-size: 24px"], .ant-tabs-tabpane [style*="font-size: 24px"] { font-size: 24px !important; }
              .ant-modal-body [style*="font-size: 28px"], .ant-tabs-tabpane [style*="font-size: 28px"] { font-size: 28px !important; }
              .ant-modal-body [style*="font-size: 32px"], .ant-tabs-tabpane [style*="font-size: 32px"] { font-size: 32px !important; }
            `}</style>
          </div>
        )}
      </Modal>
    </>
  );
};

export default TopicManager;