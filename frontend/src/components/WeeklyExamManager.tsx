import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  Input,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  List,
  Tag,
  message,
} from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface ExamQuestion {
  id?: number;
  session: number;
  question_number: number;
  question_text: string;
  question_type: 'short_answer' | 'essay';
}

interface WeeklyExam {
  id: number;
  week_number: number;
  category_id: number;
  category?: Category;
  questions: ExamQuestion[];
  created_at: string;
}

interface Student {
  id: number;
  name: string;
}

interface ExamScore {
  id: number;
  student_id: number;
  student_name: string;
  weekly_exam_id: number;
  session1_scores: { [key: number]: number }; // question_number: score
  session2_scores: { [key: number]: number };
  session1_total: number;
  session2_total: number;
  total: number;
}

const WeeklyExamManager: React.FC = () => {
  const [weeklyExams, setWeeklyExams] = useState<WeeklyExam[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [examScores, setExamScores] = useState<ExamScore[]>([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isScoreModalVisible, setIsScoreModalVisible] = useState(false);
  const [isScoreViewModalVisible, setIsScoreViewModalVisible] = useState(false);
  const [selectedExam, setSelectedExam] = useState<WeeklyExam | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [form] = Form.useForm();
  const [scoreForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);

  // 1교시 문제 (13개) 초기 상태
  const [session1Questions, setSession1Questions] = useState<string[]>(
    Array(13).fill('')
  );

  // 2교시 문제 (6개) 초기 상태
  const [session2Questions, setSession2Questions] = useState<string[]>(
    Array(6).fill('')
  );

  useEffect(() => {
    loadCategories();
    loadWeeklyExams();
    loadStudents();
    loadDummyScores();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/api/categories`);
      setCategories(response.data);
    } catch (error) {
      message.error('카테고리를 불러오는데 실패했습니다.');
    }
  };

  const loadWeeklyExams = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/weekly-exams-direct`);
      setWeeklyExams(response.data);
    } catch (error) {
      message.error('주간모의고사를 불러오는데 실패했습니다.');
    }
  };

  const loadStudents = async () => {
    // 더미 학생 데이터
    const dummyStudents = [
      { id: 1, name: '김기주' },
      { id: 2, name: '김영탁' },
      { id: 3, name: '김재원' },
      { id: 4, name: '김종진' },
      { id: 5, name: '김지수' },
      { id: 6, name: '나승엽' },
      { id: 7, name: '노영진' },
      { id: 8, name: '명성규' },
      { id: 9, name: '모시라' },
      { id: 10, name: '박기헌' },
      { id: 11, name: '박몽' },
      { id: 12, name: '변태한' },
      { id: 13, name: '백수연' },
    ];
    setStudents(dummyStudents);
  };

  const loadDummyScores = () => {
    // 더미 성적 데이터 (이미지 기반)
    const dummyScores: ExamScore[] = [
      {
        id: 1,
        student_id: 1,
        student_name: '김기주',
        weekly_exam_id: 1,
        session1_scores: {1: 0, 2: 6, 3: 5, 4: 4, 5: 4.7, 6: 4.9, 7: 5.7, 8: 5.4, 9: 6, 10: 4, 11: 4, 12: 2, 13: 4},
        session2_scores: {1: 13.9, 2: 13, 3: 14.5, 4: 0, 5: 0, 6: 0},
        session1_total: 46.7,
        session2_total: 41.4,
        total: 47.55
      },
      {
        id: 2,
        student_id: 2,
        student_name: '김영탁',
        weekly_exam_id: 1,
        session1_scores: {1: 0, 2: 6, 3: 6, 4: 5.7, 5: 5.7, 6: 5.9, 7: 0, 8: 5.9, 9: 0, 10: 5.9, 11: 5.9, 12: 6, 13: 6},
        session2_scores: {1: 15, 2: 15, 3: 0, 4: 14.9, 5: 14.9, 6: 0},
        session1_total: 59,
        session2_total: 59.8,
        total: 59.4
      }
    ];
    setExamScores(dummyScores);
  };

  const handleCreateExam = async (values: any) => {
    setLoading(true);
    try {
      // 1교시 문제들 (단답형)
      const session1Qs: ExamQuestion[] = session1Questions
        .filter(q => q.trim() !== '')
        .map((q, index) => ({
          session: 1,
          question_number: index + 1,
          question_text: q,
          question_type: 'short_answer',
        }));

      // 2교시 문제들 (서술형)
      const session2Qs: ExamQuestion[] = session2Questions
        .filter(q => q.trim() !== '')
        .map((q, index) => ({
          session: 2,
          question_number: index + 1,
          question_text: q,
          question_type: 'essay',
        }));

      const examData = {
        week_number: values.week_number,
        category_id: values.category_id,
        questions: [...session1Qs, ...session2Qs],
      };

      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/weekly-exams-direct`, examData);

      message.success('주간모의고사가 성공적으로 등록되었습니다.');
      setIsCreateModalVisible(false);
      form.resetFields();
      setSession1Questions(Array(13).fill(''));
      setSession2Questions(Array(6).fill(''));
      loadWeeklyExams();
    } catch (error) {
      message.error('주간모의고사 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const showCreateModal = () => {
    setIsCreateModalVisible(true);
  };

  const showDetailModal = (exam: WeeklyExam) => {
    setSelectedExam(exam);
    setIsDetailModalVisible(true);
  };

  const showScoreModal = (exam: WeeklyExam) => {
    setSelectedExam(exam);
    setIsScoreModalVisible(true);
  };

  const showScoreViewModal = (exam: WeeklyExam) => {
    setSelectedExam(exam);
    setIsScoreViewModalVisible(true);
  };

  const handleScoreSubmit = async (values: any) => {
    try {
      // 성적 등록 로직 (더미)
      message.success('성적이 등록되었습니다.');
      setIsScoreModalVisible(false);
      scoreForm.resetFields();
      setSelectedStudent(null);
    } catch (error) {
      message.error('성적 등록에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    setIsCreateModalVisible(false);
    setIsDetailModalVisible(false);
    setIsScoreModalVisible(false);
    setIsScoreViewModalVisible(false);
    setSelectedExam(null);
    setSelectedStudent(null);
    form.resetFields();
    scoreForm.resetFields();
    setSession1Questions(Array(13).fill(''));
    setSession2Questions(Array(6).fill(''));
  };

  const updateSession1Question = (index: number, value: string) => {
    const newQuestions = [...session1Questions];
    newQuestions[index] = value;
    setSession1Questions(newQuestions);
  };

  const updateSession2Question = (index: number, value: string) => {
    const newQuestions = [...session2Questions];
    newQuestions[index] = value;
    setSession2Questions(newQuestions);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedScores = () => {
    if (!selectedExam) return [];
    
    let filteredScores = examScores.filter(score => score.weekly_exam_id === selectedExam.id);
    
    if (sortConfig) {
      filteredScores.sort((a, b) => {
        let aValue: any, bValue: any;
        
        if (sortConfig.key === 'name') {
          aValue = a.student_name;
          bValue = b.student_name;
        } else if (sortConfig.key === 'session1_total') {
          aValue = a.session1_total;
          bValue = b.session1_total;
        } else if (sortConfig.key === 'session2_total') {
          aValue = a.session2_total;
          bValue = b.session2_total;
        } else if (sortConfig.key === 'total') {
          aValue = a.total;
          bValue = b.total;
        } else if (sortConfig.key.startsWith('session1_')) {
          const questionNum = parseInt(sortConfig.key.replace('session1_', ''));
          aValue = a.session1_scores[questionNum] || 0;
          bValue = b.session1_scores[questionNum] || 0;
        } else if (sortConfig.key.startsWith('session2_')) {
          const questionNum = parseInt(sortConfig.key.replace('session2_', ''));
          aValue = a.session2_scores[questionNum] || 0;
          bValue = b.session2_scores[questionNum] || 0;
        } else {
          return 0;
        }

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredScores;
  };

  const SortableHeader = ({ children, sortKey }: { children: React.ReactNode, sortKey: string }) => {
    const isActive = sortConfig?.key === sortKey;
    const direction = isActive ? sortConfig.direction : null;
    
    return (
      <th 
        style={{ 
          border: '1px solid #d9d9d9', 
          padding: '8px', 
          backgroundColor: '#fafafa',
          cursor: 'pointer',
          userSelect: 'none',
          position: 'relative'
        }}
        onClick={() => handleSort(sortKey)}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {children}
          <span style={{ marginLeft: '4px', fontSize: '12px' }}>
            {isActive && direction === 'asc' && '↑'}
            {isActive && direction === 'desc' && '↓'}
            {!isActive && '⇅'}
          </span>
        </div>
      </th>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>
          <CalendarOutlined style={{ marginRight: 8 }} />
          주간모의고사 관리
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>
          새 주간모의고사 등록
        </Button>
      </div>

      {/* 주간모의고사 목록 */}
      <Row gutter={16}>
        {weeklyExams.map((exam) => (
          <Col span={8} key={exam.id} style={{ marginBottom: 16 }}>
            <Card
              title={`${exam.week_number}주차 - ${exam.category?.name}`}
              extra={
                <Space>
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => showDetailModal(exam)}
                  />
                  <Button
                    type="text"
                    icon={<FileTextOutlined />}
                    onClick={() => showScoreModal(exam)}
                  />
                  <Button
                    type="text"
                    icon={<BarChartOutlined />}
                    onClick={() => showScoreViewModal(exam)}
                  />
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                  />
                </Space>
              }
            >
              <p>문제 수: {exam.questions?.length || 0}개</p>
              <p>등록일: {new Date(exam.created_at).toLocaleDateString()}</p>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 새 주간모의고사 등록 모달 */}
      <Modal
        title="새 주간모의고사 등록"
        open={isCreateModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={900}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateExam}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="week_number"
                label="주차"
                rules={[{ required: true, message: '주차를 입력해주세요.' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="몇 주차인지 입력" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category_id"
                label="카테고리"
                rules={[{ required: true, message: '카테고리를 선택해주세요.' }]}
              >
                <Select placeholder="카테고리 선택">
                  {categories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider>1교시 문제 (단답형 13문제)</Divider>
          {session1Questions.map((question, index) => (
            <Form.Item key={`session1_${index}`} label={`${index + 1}번 문제`}>
              <Input
                placeholder={`예: SCTP`}
                value={question}
                onChange={(e) => updateSession1Question(index, e.target.value)}
              />
            </Form.Item>
          ))}

          <Divider>2교시 문제 (서술형 6문제)</Divider>
          {session2Questions.map((question, index) => (
            <Form.Item key={`session2_${index}`} label={`${index + 1}번 문제`}>
              <TextArea
                placeholder={`예: SCTP에 대해 설명하시오. 가. sctp개념, 나. sctp 프로토콜구조, 다. sctp와 tcp 비교`}
                value={question}
                onChange={(e) => updateSession2Question(index, e.target.value)}
                rows={3}
              />
            </Form.Item>
          ))}

          <Form.Item style={{ textAlign: 'center', marginTop: 24 }}>
            <Space>
              <Button onClick={handleCancel}>취소</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                등록
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 상세보기 모달 */}
      <Modal
        title={`${selectedExam?.week_number}주차 주간모의고사 - ${selectedExam?.category?.name}`}
        open={isDetailModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="close" onClick={handleCancel}>
            닫기
          </Button>,
        ]}
        width={800}
      >
        {selectedExam && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>등록일: </Text>
              <Text>{new Date(selectedExam.created_at).toLocaleDateString()}</Text>
            </div>

            <Divider>1교시 문제 (단답형)</Divider>
            <List
              dataSource={selectedExam.questions.filter(q => q.session === 1)}
              renderItem={(question) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong>{question.question_number}. </Text>
                      <Tag color="blue">단답형</Tag>
                    </div>
                    <div>
                      {question.question_text}
                    </div>
                  </div>
                </List.Item>
              )}
            />

            <Divider>2교시 문제 (서술형)</Divider>
            <List
              dataSource={selectedExam.questions.filter(q => q.session === 2)}
              renderItem={(question) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong>{question.question_number}. </Text>
                      <Tag color="green">서술형</Tag>
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {question.question_text}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>

      {/* 성적 등록 모달 */}
      <Modal
        title={`성적 등록 - ${selectedExam?.week_number}주차 ${selectedExam?.category?.name}`}
        open={isScoreModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={900}
      >
        <Form form={scoreForm} layout="vertical" onFinish={handleScoreSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="student_id"
                label="학생 선택"
                rules={[{ required: true, message: '학생을 선택해주세요.' }]}
              >
                <Select
                  placeholder="학생 선택"
                  onChange={(value) => {
                    const student = students.find(s => s.id === value);
                    setSelectedStudent(student || null);
                  }}
                >
                  {students.map((student) => (
                    <Option key={student.id} value={student.id}>
                      {student.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {selectedStudent && selectedExam && (
            <>
              <Divider>1교시 문제 (13문제 중 10문제 선택)</Divider>
              <Row gutter={[8, 8]}>
                {selectedExam.questions
                  .filter(q => q.session === 1)
                  .map((question, index) => (
                    <Col span={6} key={question.id}>
                      <Form.Item
                        name={`session1_${question.question_number}`}
                        label={`${question.question_number}번 (6점)`}
                      >
                        <InputNumber
                          min={0}
                          max={6}
                          step={0.1}
                          style={{ width: '100%' }}
                          placeholder="점수 입력"
                        />
                      </Form.Item>
                    </Col>
                  ))}
              </Row>

              <Divider>2교시 문제 (6문제 중 4문제 선택)</Divider>
              <Row gutter={[8, 8]}>
                {selectedExam.questions
                  .filter(q => q.session === 2)
                  .map((question) => (
                    <Col span={8} key={question.id}>
                      <Form.Item
                        name={`session2_${question.question_number}`}
                        label={`${question.question_number}번 (15점)`}
                      >
                        <InputNumber
                          min={0}
                          max={15}
                          step={0.1}
                          style={{ width: '100%' }}
                          placeholder="점수 입력"
                        />
                      </Form.Item>
                    </Col>
                  ))}
              </Row>

              <Form.Item style={{ textAlign: 'center', marginTop: 24 }}>
                <Space>
                  <Button onClick={handleCancel}>취소</Button>
                  <Button type="primary" htmlType="submit">
                    성적 등록
                  </Button>
                </Space>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      {/* 성적 조회 모달 */}
      <Modal
        title={`성적 조회 - ${selectedExam?.week_number}주차 ${selectedExam?.category?.name}`}
        open={isScoreViewModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="close" onClick={handleCancel}>
            닫기
          </Button>
        ]}
        width={1400}
        style={{ top: 20 }}
      >
        {selectedExam && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #d9d9d9', padding: '8px', backgroundColor: '#fafafa' }}>No</th>
                  <th style={{ border: '1px solid #d9d9d9', padding: '8px', backgroundColor: '#fafafa' }}>기수</th>
                  <SortableHeader sortKey="name">이름</SortableHeader>
                  {/* 1교시 문제 헤더 */}
                  {Array.from({length: 13}, (_, i) => (
                    <th 
                      key={`session1_${i+1}`} 
                      style={{ 
                        border: '1px solid #d9d9d9', 
                        padding: '4px', 
                        backgroundColor: '#e6f4ff', 
                        minWidth: '40px',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                      onClick={() => handleSort(`session1_${i+1}`)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {i+1}
                        <span style={{ marginLeft: '2px', fontSize: '10px' }}>
                          {sortConfig?.key === `session1_${i+1}` && sortConfig.direction === 'asc' && '↑'}
                          {sortConfig?.key === `session1_${i+1}` && sortConfig.direction === 'desc' && '↓'}
                          {sortConfig?.key !== `session1_${i+1}` && '⇅'}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th 
                    style={{ 
                      border: '1px solid #d9d9d9', 
                      padding: '8px', 
                      backgroundColor: '#fff2e6',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={() => handleSort('session1_total')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      총점
                      <span style={{ marginLeft: '4px', fontSize: '12px' }}>
                        {sortConfig?.key === 'session1_total' && sortConfig.direction === 'asc' && '↑'}
                        {sortConfig?.key === 'session1_total' && sortConfig.direction === 'desc' && '↓'}
                        {sortConfig?.key !== 'session1_total' && '⇅'}
                      </span>
                    </div>
                  </th>
                  {/* 2교시 문제 헤더 */}
                  {Array.from({length: 6}, (_, i) => (
                    <th 
                      key={`session2_${i+1}`} 
                      style={{ 
                        border: '1px solid #d9d9d9', 
                        padding: '4px', 
                        backgroundColor: '#f6ffed', 
                        minWidth: '40px',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                      onClick={() => handleSort(`session2_${i+1}`)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {i+1}
                        <span style={{ marginLeft: '2px', fontSize: '10px' }}>
                          {sortConfig?.key === `session2_${i+1}` && sortConfig.direction === 'asc' && '↑'}
                          {sortConfig?.key === `session2_${i+1}` && sortConfig.direction === 'desc' && '↓'}
                          {sortConfig?.key !== `session2_${i+1}` && '⇅'}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th 
                    style={{ 
                      border: '1px solid #d9d9d9', 
                      padding: '8px', 
                      backgroundColor: '#fff2e6',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={() => handleSort('session2_total')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      총점
                      <span style={{ marginLeft: '4px', fontSize: '12px' }}>
                        {sortConfig?.key === 'session2_total' && sortConfig.direction === 'asc' && '↑'}
                        {sortConfig?.key === 'session2_total' && sortConfig.direction === 'desc' && '↓'}
                        {sortConfig?.key !== 'session2_total' && '⇅'}
                      </span>
                    </div>
                  </th>
                  <th 
                    style={{ 
                      border: '1px solid #d9d9d9', 
                      padding: '8px', 
                      backgroundColor: '#fafafa',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={() => handleSort('total')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      평균
                      <span style={{ marginLeft: '4px', fontSize: '12px' }}>
                        {sortConfig?.key === 'total' && sortConfig.direction === 'asc' && '↑'}
                        {sortConfig?.key === 'total' && sortConfig.direction === 'desc' && '↓'}
                        {sortConfig?.key !== 'total' && '⇅'}
                      </span>
                    </div>
                  </th>
                  <th style={{ border: '1px solid #d9d9d9', padding: '8px', backgroundColor: '#fafafa' }}>순위</th>
                </tr>
              </thead>
              <tbody>
                {getSortedScores().map((score, index) => (
                    <tr key={score.id}>
                      <td style={{ border: '1px solid #d9d9d9', padding: '4px', textAlign: 'center' }}>{index + 1}</td>
                      <td style={{ border: '1px solid #d9d9d9', padding: '4px', textAlign: 'center', backgroundColor: '#fff7e6' }}>3기</td>
                      <td style={{ border: '1px solid #d9d9d9', padding: '4px', textAlign: 'center', backgroundColor: '#fff7e6' }}>{score.student_name}</td>
                      
                      {/* 1교시 점수들 */}
                      {Array.from({length: 13}, (_, i) => (
                        <td key={`s1_${i+1}`} style={{ border: '1px solid #d9d9d9', padding: '2px', textAlign: 'center', fontSize: '11px' }}>
                          {score.session1_scores[i+1] || ''}
                        </td>
                      ))}
                      <td style={{ border: '1px solid #d9d9d9', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                        {score.session1_total}
                      </td>
                      
                      {/* 2교시 점수들 */}
                      {Array.from({length: 6}, (_, i) => (
                        <td key={`s2_${i+1}`} style={{ border: '1px solid #d9d9d9', padding: '2px', textAlign: 'center', fontSize: '11px' }}>
                          {score.session2_scores[i+1] || ''}
                        </td>
                      ))}
                      <td style={{ border: '1px solid #d9d9d9', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                        {score.session2_total}
                      </td>
                      <td style={{ border: '1px solid #d9d9d9', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                        {score.total}
                      </td>
                      <td style={{ border: '1px solid #d9d9d9', padding: '4px', textAlign: 'center' }}>{index + 1}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WeeklyExamManager;