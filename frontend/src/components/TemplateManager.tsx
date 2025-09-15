import React, { useState, useEffect } from 'react';
import {
  Card,
  Table as AntTable,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Popconfirm,
  Tag,
  Typography,
  Dropdown,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BoldOutlined, 
  ItalicOutlined, 
  UnderlineOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  PictureOutlined,
  TableOutlined,
  MergeCellsOutlined,
  SplitCellsOutlined,
  PlusOutlined as PlusIcon,
  MinusOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontSize } from '@tiptap/extension-font-size';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import Image from '@tiptap/extension-image';
import { Template, TemplateCreate, TemplateUpdate, templateApi } from '../services/api';
import './TopicEditor.css';

const { TextArea } = Input;
const { Text } = Typography;

const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [form] = Form.useForm();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      FontSize.configure({
        types: ['textStyle'],
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'resizable-image',
        },
      }),
    ],
    content: '',
  });

  const previewEditor = useEditor({
    extensions: [StarterKit, Bold, Italic, Underline, TextStyle, Color, FontSize, TextAlign, Table, TableRow, TableHeader, TableCell, Image],
    content: '',
    editable: false,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await templateApi.getAll();
      setTemplates(data);
    } catch (error) {
      message.error('템플릿을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedTemplate(null);
    form.resetFields();
    editor?.commands.setContent('');
    setIsModalOpen(true);
  };

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template);
    form.setFieldsValue({
      name: template.name,
      description: template.description,
      category: template.category,
    });
    editor?.commands.setContent(template.content);
    setIsModalOpen(true);
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
    previewEditor?.commands.setContent(template.content);
    setIsPreviewOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await templateApi.delete(id);
      message.success('템플릿이 삭제되었습니다.');
      loadTemplates();
    } catch (error) {
      message.error('템플릿 삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const content = editor?.getHTML() || '';
      
      if (!content.trim()) {
        message.error('템플릿 내용을 입력해주세요.');
        return;
      }

      if (selectedTemplate) {
        const updateData: TemplateUpdate = {
          ...values,
          content,
        };
        await templateApi.update(selectedTemplate.id!, updateData);
        message.success('템플릿이 수정되었습니다.');
      } else {
        const createData: TemplateCreate = {
          ...values,
          content,
        };
        await templateApi.create(createData);
        message.success('템플릿이 생성되었습니다.');
      }
      
      setIsModalOpen(false);
      loadTemplates();
    } catch (error) {
      message.error('저장에 실패했습니다.');
    }
  };

  const insertTable = () => {
    setIsTableModalOpen(true);
  };

  const createTable = () => {
    editor?.chain().focus().insertTable({ 
      rows: tableRows, 
      cols: tableCols, 
      withHeaderRow: false 
    }).run();
    setIsTableModalOpen(false);
  };

  const mergeCells = () => {
    editor?.chain().focus().mergeCells().run();
  };

  const splitCell = () => {
    editor?.chain().focus().splitCell().run();
  };

  const addColumnBefore = () => {
    editor?.chain().focus().addColumnBefore().run();
  };

  const addColumnAfter = () => {
    editor?.chain().focus().addColumnAfter().run();
  };

  const deleteColumn = () => {
    editor?.chain().focus().deleteColumn().run();
  };

  const addRowBefore = () => {
    editor?.chain().focus().addRowBefore().run();
  };

  const addRowAfter = () => {
    editor?.chain().focus().addRowAfter().run();
  };

  const deleteRow = () => {
    editor?.chain().focus().deleteRow().run();
  };

  const deleteTable = () => {
    editor?.chain().focus().deleteTable().run();
  };

  const setCellBackgroundColor = (color: string) => {
    editor?.chain().focus().setCellAttribute('style', `background-color: ${color}`).run();
  };

  const toggleHeader = () => {
    editor?.chain().focus().toggleHeaderRow().run();
  };

  const setRowHeight = (height: string) => {
    if (editor?.isActive('tableCell') || editor?.isActive('tableHeader')) {
      editor?.chain().focus().setCellAttribute('style', `height: ${height}px; min-height: ${height}px;`).run();
      message.success(`행 높이가 ${height}px로 설정되었습니다.`);
    } else {
      message.warning('표 내부의 셀을 선택한 후 사용해주세요.');
    }
  };

  const tableMenuItems = [
    {
      key: 'addRowBefore',
      label: '위에 행 추가',
      icon: <PlusIcon />,
      onClick: addRowBefore,
    },
    {
      key: 'addRowAfter',
      label: '아래에 행 추가',
      icon: <PlusIcon />,
      onClick: addRowAfter,
    },
    {
      key: 'deleteRow',
      label: '행 삭제',
      icon: <MinusOutlined />,
      onClick: deleteRow,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'addColumnBefore',
      label: '왼쪽에 열 추가',
      icon: <PlusIcon />,
      onClick: addColumnBefore,
    },
    {
      key: 'addColumnAfter',
      label: '오른쪽에 열 추가',
      icon: <PlusIcon />,
      onClick: addColumnAfter,
    },
    {
      key: 'deleteColumn',
      label: '열 삭제',
      icon: <MinusOutlined />,
      onClick: deleteColumn,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'toggleHeader',
      label: '헤더행 토글',
      onClick: toggleHeader,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'rowHeight',
      label: '행 높이',
      children: [
        {
          key: 'height-30',
          label: '작게 (30px)',
          onClick: () => setRowHeight('30'),
        },
        {
          key: 'height-40',
          label: '보통 (40px)',
          onClick: () => setRowHeight('40'),
        },
        {
          key: 'height-60',
          label: '크게 (60px)',
          onClick: () => setRowHeight('60'),
        },
        {
          key: 'height-auto',
          label: '자동',
          onClick: () => editor?.chain().focus().setCellAttribute('style', 'height: auto').run(),
        },
      ],
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'deleteTable',
      label: '표 삭제',
      icon: <MinusOutlined />,
      onClick: deleteTable,
      danger: true,
    },
  ];

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const url = event.target?.result as string;
          editor?.chain().focus().setImage({ src: url }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const resizeImage = (size: string) => {
    const { state } = editor!;
    const { selection } = state;
    const { node, pos } = selection as any;
    
    if (node && node.type.name === 'image') {
      let width = '';
      
      switch (size) {
        case 'small':
          width = '200px';
          break;
        case 'medium':
          width = '300px';
          break;
        case 'large':
          width = '500px';
          break;
        case 'full':
          width = '100%';
          break;
        default:
          width = '300px';
      }
      
      const tr = state.tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        style: `width: ${width}; height: auto;`,
      });
      
      editor?.view.dispatch(tr);
      message.success(`이미지 크기가 ${size}로 변경되었습니다.`);
    } else {
      message.warning('이미지를 클릭하여 선택한 후 사용해주세요.');
    }
  };

  const columns = [
    {
      title: '템플릿명',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: '카테고리',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => text ? <Tag color="blue">{text}</Tag> : '-',
    },
    {
      title: '생성일',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '액션',
      key: 'actions',
      render: (_: any, record: Template) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
            title="미리보기"
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="수정"
          />
          <Popconfirm
            title="정말로 이 템플릿을 삭제하시겠습니까?"
            onConfirm={() => handleDelete(record.id!)}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              title="삭제"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          새 템플릿 추가
        </Button>
      </div>

      <AntTable
        dataSource={templates}
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={selectedTemplate ? '템플릿 수정' : '새 템플릿 추가'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={1000}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            취소
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            {selectedTemplate ? '수정' : '추가'}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="템플릿명"
            rules={[{ required: true, message: '템플릿명을 입력해주세요' }]}
          >
            <Input placeholder="템플릿명을 입력하세요" />
          </Form.Item>

          <Form.Item name="description" label="설명">
            <TextArea 
              placeholder="템플릿 설명을 입력하세요 (선택사항)"
              rows={2}
            />
          </Form.Item>

          <Form.Item name="category" label="카테고리">
            <Input placeholder="카테고리를 입력하세요 (예: 정의, 비교, 프로세스)" />
          </Form.Item>

          <Form.Item label="템플릿 내용" required>
            <div style={{ marginBottom: 8, padding: 8, border: '1px solid #d9d9d9', borderRadius: 6, background: '#fafafa' }}>
              <Space wrap>
                <Button
                  size="small"
                  icon={<BoldOutlined />}
                  type={editor?.isActive('bold') ? 'primary' : 'default'}
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  title="굵게"
                />
                <Button
                  size="small"
                  icon={<ItalicOutlined />}
                  type={editor?.isActive('italic') ? 'primary' : 'default'}
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  title="기울임"
                />
                <Button
                  size="small"
                  icon={<UnderlineOutlined />}
                  type={editor?.isActive('underline') ? 'primary' : 'default'}
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  title="밑줄"
                />
                <div style={{ width: 1, height: 20, background: '#d9d9d9', margin: '0 4px' }} />
                <Button
                  size="small"
                  icon={<AlignLeftOutlined />}
                  type={editor?.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}
                  onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                  title="왼쪽 정렬"
                />
                <Button
                  size="small"
                  icon={<AlignCenterOutlined />}
                  type={editor?.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}
                  onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                  title="가운데 정렬"
                />
                <Button
                  size="small"
                  icon={<AlignRightOutlined />}
                  type={editor?.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}
                  onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                  title="오른쪽 정렬"
                />
                <div style={{ width: 1, height: 20, background: '#d9d9d9', margin: '0 4px' }} />
                <input
                  type="color"
                  onInput={(e) => editor?.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
                  value={editor?.getAttributes('textStyle').color || '#000000'}
                  style={{ 
                    width: 32, 
                    height: 24, 
                    border: '1px solid #d9d9d9', 
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                  title="텍스트 색상"
                />
                <Select
                  placeholder="크기"
                  style={{ width: 80 }}
                  size="small"
                  value={editor?.getAttributes('textStyle').fontSize || '14px'}
                  onChange={(value) => editor?.chain().focus().setFontSize(value).run()}
                  options={[
                    { label: '10px', value: '10px' },
                    { label: '12px', value: '12px' },
                    { label: '14px', value: '14px' },
                    { label: '16px', value: '16px' },
                    { label: '18px', value: '18px' },
                    { label: '20px', value: '20px' },
                    { label: '24px', value: '24px' },
                    { label: '28px', value: '28px' },
                    { label: '32px', value: '32px' },
                    { label: '36px', value: '36px' },
                  ]}
                />
                {editor?.isActive('table') && (
                  <input
                    type="color"
                    onInput={(e) => setCellBackgroundColor((e.target as HTMLInputElement).value)}
                    defaultValue="#ffffff"
                    style={{ 
                      width: 32, 
                      height: 24, 
                      border: '1px solid #d9d9d9', 
                      borderRadius: 4,
                      cursor: 'pointer',
                      marginLeft: 4
                    }}
                    title="셀 배경색"
                  />
                )}
                <div style={{ width: 1, height: 20, background: '#d9d9d9', margin: '0 4px' }} />
                <Button
                  size="small"
                  icon={<TableOutlined />}
                  onClick={insertTable}
                  title="표 삽입"
                />
                {editor?.isActive('table') && (
                  <>
                    <Button
                      size="small"
                      icon={<MergeCellsOutlined />}
                      onClick={mergeCells}
                      title="셀 병합"
                    />
                    <Button
                      size="small"
                      icon={<SplitCellsOutlined />}
                      onClick={splitCell}
                      title="셀 분할"
                    />
                    <Dropdown menu={{ items: tableMenuItems }} trigger={['click']} placement="bottomLeft">
                      <Button
                        size="small"
                        icon={<MenuOutlined />}
                        title="표 편집"
                      >
                        표 편집
                      </Button>
                    </Dropdown>
                  </>
                )}
                <Button
                  size="small"
                  icon={<PictureOutlined />}
                  onClick={addImage}
                  title="이미지 삽입"
                />
                {editor?.isActive('image') && (
                  <>
                    <Button
                      size="small"
                      onClick={() => resizeImage('small')}
                      title="작은 이미지 (200px)"
                    >
                      작게
                    </Button>
                    <Button
                      size="small"
                      onClick={() => resizeImage('medium')}
                      title="보통 이미지 (300px)"
                    >
                      보통
                    </Button>
                    <Button
                      size="small"
                      onClick={() => resizeImage('large')}
                      title="큰 이미지 (500px)"
                    >
                      크게
                    </Button>
                    <Button
                      size="small"
                      onClick={() => resizeImage('full')}
                      title="전체 너비"
                    >
                      전체
                    </Button>
                  </>
                )}
              </Space>
            </div>
            <div className="editor-container">
              <EditorContent editor={editor} />
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`템플릿 미리보기 - ${previewTemplate?.name}`}
        open={isPreviewOpen}
        onCancel={() => setIsPreviewOpen(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setIsPreviewOpen(false)}>
            닫기
          </Button>,
        ]}
      >
        {previewTemplate && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">설명: </Text>
              <Text>{previewTemplate.description || '없음'}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">카테고리: </Text>
              {previewTemplate.category ? (
                <Tag color="blue">{previewTemplate.category}</Tag>
              ) : (
                <Text>없음</Text>
              )}
            </div>
            <div style={{ border: '1px solid #f0f0f0', borderRadius: 4, padding: 16 }}>
              <EditorContent editor={previewEditor} />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="표 크기 선택"
        open={isTableModalOpen}
        onCancel={() => setIsTableModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsTableModalOpen(false)}>
            취소
          </Button>,
          <Button key="create" type="primary" onClick={createTable}>
            표 생성
          </Button>,
        ]}
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'inline-block', width: 80 }}>행 수:</label>
            <Input
              type="number"
              value={tableRows}
              onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: 100, marginLeft: 8 }}
              min={1}
              max={20}
            />
          </div>
          <div>
            <label style={{ display: 'inline-block', width: 80 }}>열 수:</label>
            <Input
              type="number"
              value={tableCols}
              onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: 100, marginLeft: 8 }}
              min={1}
              max={20}
            />
          </div>
          <div style={{ marginTop: 16, fontSize: '12px', color: '#666' }}>
            {tableRows}행 × {tableCols}열 표가 생성됩니다.
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default TemplateManager;