import React, { useState, useEffect } from 'react';
import {
  Card,
  Tree,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Popconfirm,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import { Category, categoryApi } from '../services/api';

const { TextArea } = Input;
const { Option } = Select;

interface TreeNode {
  key: string;
  title: React.ReactNode;
  children?: TreeNode[];
  category: Category;
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const treeCategories = await categoryApi.getTree();
      const allCategories = await categoryApi.getAll();
      setCategories(allCategories);
      setTreeData(buildTreeData(treeCategories));
    } catch (error) {
      message.error('카테고리를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const buildTreeData = (categories: Category[]): TreeNode[] => {
    return categories.map((category) => ({
      key: category.id!.toString(),
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            {category.name}
            {category.description && (
              <span style={{ color: '#999', marginLeft: 8, fontSize: '12px' }}>
                ({category.description})
              </span>
            )}
          </span>
          <Space size="small">
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleAddChild(category);
              }}
              title="하위 카테고리 추가"
            />
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(category);
              }}
              title="수정"
            />
            <Popconfirm
              title="정말로 이 카테고리를 삭제하시겠습니까?"
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDelete(category.id!);
              }}
              onCancel={(e) => e?.stopPropagation()}
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => e.stopPropagation()}
                title="삭제"
              />
            </Popconfirm>
          </Space>
        </div>
      ),
      children: category.children ? buildTreeData(category.children) : undefined,
      category,
    }));
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleAddChild = (parent: Category) => {
    setSelectedCategory(null);
    form.resetFields();
    form.setFieldsValue({ parent_id: parent.id });
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      parent_id: category.parent_id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await categoryApi.delete(id);
      message.success('카테고리가 삭제되었습니다.');
      loadCategories();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || '카테고리 삭제에 실패했습니다.';
      message.error(errorMsg);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (selectedCategory) {
        await categoryApi.update(selectedCategory.id!, values);
        message.success('카테고리가 수정되었습니다.');
      } else {
        await categoryApi.create(values);
        message.success('카테고리가 추가되었습니다.');
      }
      
      setIsModalOpen(false);
      loadCategories();
    } catch (error) {
      message.error('저장에 실패했습니다.');
    }
  };

  const getParentOptions = () => {
    const options: { value: number; label: string }[] = [];
    
    const addOptions = (cats: Category[], prefix = '') => {
      cats.forEach(cat => {
        if (!selectedCategory || cat.id !== selectedCategory.id) {
          options.push({
            value: cat.id!,
            label: prefix + cat.name
          });
          if (cat.children) {
            addOptions(cat.children, prefix + cat.name + ' > ');
          }
        }
      });
    };

    const treeCategories = categories.filter(c => !c.parent_id);
    addOptions(treeCategories);
    
    return options;
  };

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          최상위 카테고리 추가
        </Button>
      </div>

      <Spin spinning={loading}>
        <Tree
          treeData={treeData}
          defaultExpandAll
          showIcon
          icon={({ expanded }) => expanded ? <FolderOpenOutlined /> : <FolderOutlined />}
          blockNode
          style={{ fontSize: '14px' }}
        />
      </Spin>

      <Modal
        title={selectedCategory ? '카테고리 수정' : '카테고리 추가'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            취소
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            {selectedCategory ? '수정' : '추가'}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="카테고리명"
            rules={[{ required: true, message: '카테고리명을 입력해주세요' }]}
          >
            <Input placeholder="카테고리명을 입력하세요" />
          </Form.Item>

          <Form.Item name="description" label="설명">
            <TextArea 
              placeholder="카테고리 설명을 입력하세요 (선택사항)"
              rows={3}
            />
          </Form.Item>

          <Form.Item name="parent_id" label="상위 카테고리">
            <Select placeholder="상위 카테고리를 선택하세요 (선택사항)" allowClear>
              {getParentOptions().map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CategoryManager;