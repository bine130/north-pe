import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Typography,
  Spin,
  Tag,
  Space,
} from 'antd';
import {
  FileTextOutlined,
  UserOutlined,
  TrophyOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { topicApi, categoryApi } from '../services/api';

const { Title } = Typography;

interface CategoryStats {
  category: string;
  count: number;
  percentage: number;
}

interface DashboardStats {
  totalTopics: number;
  totalStudents: number;
  currentGeneration: number;
  categoryStats: CategoryStats[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 모든 토픽과 카테고리 데이터를 동시에 가져오기
      const [topics, categories] = await Promise.all([
        topicApi.getAll(),
        categoryApi.getAll(),
      ]);

      // 최상위 카테고리만 필터링 (parent_id가 null인 카테고리)
      const topLevelCategories = categories.filter(cat => !cat.parent_id);
      
      // 카테고리별 토픽 개수 계산
      const categoryStats: CategoryStats[] = [];
      const totalTopics = topics.length;
      
      // 하위 카테고리 이름을 포함하는 헬퍼 함수
      const getAllSubcategoryNames = (parentCategory: any): string[] => {
        const subcategories = categories.filter(cat => cat.parent_id === parentCategory.id);
        let allNames = [parentCategory.name];
        
        subcategories.forEach(sub => {
          allNames = allNames.concat(getAllSubcategoryNames(sub));
        });
        
        return allNames;
      };

      // 각 최상위 카테고리별 토픽 개수 계산 (하위 카테고리 포함)
      topLevelCategories.forEach(category => {
        const allCategoryNames = getAllSubcategoryNames(category);
        
        const count = topics.filter(topic => 
          topic.category && allCategoryNames.includes(topic.category)
        ).length;
        
        if (count > 0) {
          categoryStats.push({
            category: category.name,
            count,
            percentage: Math.round((count / totalTopics) * 100),
          });
        }
      });

      // 카테고리가 없는 토픽들
      const uncategorizedCount = topics.filter(topic => 
        !topic.category || topic.category.trim() === ''
      ).length;
      
      if (uncategorizedCount > 0) {
        categoryStats.push({
          category: '미분류',
          count: uncategorizedCount,
          percentage: Math.round((uncategorizedCount / totalTopics) * 100),
        });
      }

      // 개수 순으로 정렬
      categoryStats.sort((a, b) => b.count - a.count);

      setStats({
        totalTopics,
        totalStudents: 40, // 더미 수강생 수
        currentGeneration: 3, // 현재 3기
        categoryStats,
      });
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '카테고리',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color={category === '미분류' ? 'default' : 'blue'}>
          {category}
        </Tag>
      ),
    },
    {
      title: '토픽 개수',
      dataIndex: 'count',
      key: 'count',
      render: (count: number) => (
        <strong>{count.toLocaleString()}개</strong>
      ),
    },
    {
      title: '비율',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage: number) => (
        <span>{percentage}%</span>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <BarChartOutlined style={{ marginRight: 8 }} />
        대시보드
      </Title>
      
      {/* 전체 통계 카드 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="총 토픽 수"
              value={stats?.totalTopics || 0}
              prefix={<FileTextOutlined />}
              suffix="개"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="현재 기수"
              value={stats?.currentGeneration || 0}
              prefix={<TrophyOutlined />}
              suffix="기"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="수강생 수"
              value={stats?.totalStudents || 0}
              prefix={<UserOutlined />}
              suffix="명"
            />
          </Card>
        </Col>
      </Row>

      {/* 카테고리별 토픽 분포 */}
      <Card 
        title="카테고리별 토픽 분포" 
        style={{ marginBottom: 24 }}
      >
        <Table
          dataSource={stats?.categoryStats || []}
          columns={columns}
          rowKey="category"
          pagination={false}
          size="middle"
        />
      </Card>

      {/* 추가 정보 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="최근 활동" size="small">
            <p style={{ color: '#666', margin: 0 }}>
              토픽 관리 시스템이 활발히 사용되고 있습니다.
            </p>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="사용 팁" size="small">
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <p style={{ margin: 0, fontSize: '12px' }}>
                💡 템플릿을 활용하여 일관된 토픽 구조를 만들어보세요
              </p>
              <p style={{ margin: 0, fontSize: '12px' }}>
                📁 카테고리를 활용하여 토픽을 체계적으로 정리하세요
              </p>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;