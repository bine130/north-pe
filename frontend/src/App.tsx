import React from 'react';
import { Layout, ConfigProvider, Tabs } from 'antd';
import { FileTextOutlined, AppstoreOutlined, LayoutOutlined, DashboardOutlined, BookOutlined, CalendarOutlined, TrophyOutlined } from '@ant-design/icons';
import TopicManager from './components/TopicManager';
import CategoryManager from './components/CategoryManager';
import TemplateManager from './components/TemplateManager';
import Dashboard from './components/Dashboard';
import HomeworkManager from './components/HomeworkManager';
import WeeklyExamManager from './components/WeeklyExamManager';
import 'antd/dist/reset.css';
import './App.css';

const { Header, Content } = Layout;
const { TabPane } = Tabs;

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{ 
            color: 'white', 
            margin: 0, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            fontWeight: 'bold',
            fontSize: '28px',
            fontFamily: '"Segoe UI", "Malgun Gothic", sans-serif',
            letterSpacing: '0.5px'
          }}>
            <TrophyOutlined style={{ fontSize: '32px', color: '#ffd700' }} />
            정보관리기술사 - 강북심화반
          </h1>
        </Header>
        <Content style={{ padding: '24px' }}>
          <Tabs defaultActiveKey="dashboard" size="large">
            <TabPane
              tab={
                <span>
                  <DashboardOutlined style={{ marginRight: 8 }} />
                  대시보드
                </span>
              }
              key="dashboard"
            >
              <Dashboard />
            </TabPane>
            <TabPane
              tab={
                <span>
                  <FileTextOutlined style={{ marginRight: 8 }} />
                  토픽 관리
                </span>
              }
              key="topics"
            >
              <TopicManager />
            </TabPane>
            <TabPane
              tab={
                <span>
                  <AppstoreOutlined style={{ marginRight: 8 }} />
                  카테고리 관리
                </span>
              }
              key="categories"
            >
              <CategoryManager />
            </TabPane>
            <TabPane
              tab={
                <span>
                  <LayoutOutlined style={{ marginRight: 8 }} />
                  템플릿 관리
                </span>
              }
              key="templates"
            >
              <TemplateManager />
            </TabPane>
            <TabPane
              tab={
                <span>
                  <BookOutlined style={{ marginRight: 8 }} />
                  숙제 관리
                </span>
              }
              key="homework"
            >
              <HomeworkManager />
            </TabPane>
            <TabPane
              tab={
                <span>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  주간모의고사 관리
                </span>
              }
              key="weekly-exam"
            >
              <WeeklyExamManager />
            </TabPane>
          </Tabs>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
