import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Tag,
  message,
} from 'antd';
import { 
  PlusOutlined, 
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
} from '@ant-design/icons';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontSize } from '@tiptap/extension-font-size';
import { Extension } from '@tiptap/core';
import '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import Image from '@tiptap/extension-image';
import { Topic, TopicCreate, TopicUpdate, topicApi, Category, categoryApi, Template, templateApi } from '../services/api';
import './TopicEditor.css';

const { Option } = Select;

interface TopicEditorProps {
  open: boolean;
  topic: Topic | null;
  onClose: () => void;
  onSave: () => void;
}

const TopicEditor: React.FC<TopicEditorProps> = ({
  open,
  topic,
  onClose,
  onSave,
}) => {
  const [form] = Form.useForm();
  const [keywords, setKeywords] = useState<string[]>([]);
  const [inputKeyword, setInputKeyword] = useState('');
  const [mnemonics, setMnemonics] = useState<{ mnemonic: string; full_text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true,
        },
      }),
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
      Extension.create({
        name: 'fontSize',
        addGlobalAttributes() {
          return [
            {
              types: ['textStyle'],
              attributes: {
                fontSize: {
                  default: null,
                  parseHTML: element => element.style.fontSize.replace('px', ''),
                  renderHTML: attributes => {
                    if (!attributes.fontSize) {
                      return {}
                    }
                    return {
                      style: `font-size: ${attributes.fontSize}px`,
                    }
                  },
                },
              },
            },
          ]
        },
        addCommands() {
          return {
            setFontSize: fontSize => ({ chain }) => {
              return chain()
                .setMark('textStyle', { fontSize: fontSize.replace('px', '') })
                .run()
            },
            unsetFontSize: () => ({ chain }) => {
              return chain()
                .setMark('textStyle', { fontSize: null })
                .removeEmptyTextStyle()
                .run()
            },
          }
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'listItem'],
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
      }),
    ],
    content: topic?.content || '',
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryTree = await categoryApi.getTree();
        setCategories(categoryTree);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setCategories([]);
      }
    };
    
    const loadTemplates = async () => {
      try {
        const templateList = await templateApi.getAll();
        setTemplates(templateList);
      } catch (error) {
        console.error('Failed to load templates:', error);
        setTemplates([]);
      }
    };
    
    loadCategories();
    loadTemplates();
  }, []);

  useEffect(() => {
    if (topic) {
      form.setFieldsValue({
        title: topic.title,
        category: topic.category,
      });
      setKeywords(topic.keywords?.map((k) => k.keyword) || []);
      setMnemonics(
        topic.mnemonics?.map((m) => ({
          mnemonic: m.mnemonic,
          full_text: m.full_text,
        })) || []
      );
      editor?.commands.setContent(topic.content || '');
    } else {
      form.resetFields();
      setKeywords([]);
      setMnemonics([]);
      editor?.commands.setContent('');
    }
  }, [topic, form, editor]);

  const handleAddKeyword = () => {
    if (inputKeyword && !keywords.includes(inputKeyword)) {
      setKeywords([...keywords, inputKeyword]);
      setInputKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleAddMnemonic = () => {
    setMnemonics([...mnemonics, { mnemonic: '', full_text: '' }]);
  };

  const handleMnemonicChange = (index: number, field: string, value: string) => {
    const newMnemonics = [...mnemonics];
    newMnemonics[index] = { ...newMnemonics[index], [field]: value };
    setMnemonics(newMnemonics);
  };

  const handleRemoveMnemonic = (index: number) => {
    setMnemonics(mnemonics.filter((_, i) => i !== index));
  };

  const insertTable = () => {
    setIsTableModalOpen(true);
  };

  const createTable = () => {
    editor?.chain().focus().insertTable({ 
      rows: tableRows, 
      cols: tableCols, 
      withHeaderRow: true 
    }).run();
    setIsTableModalOpen(false);
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const url = event.target?.result as string;
          
          const img = document.createElement('img');
          img.onload = () => {
            let finalWidth = img.width;
            // let finalHeight = img.height;
            const editorWidth = editor?.view.dom.clientWidth || 800;
            const maxWidth = editorWidth - 40;
            
            if (finalWidth > maxWidth) {
              finalWidth = maxWidth;
            }
            
            editor?.chain().focus().setImage({ src: url }).run();
          };
          img.src = url;
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const renderCategoryOptions = (cats: Category[], level = 0): React.ReactElement[] => {
    return cats.flatMap((cat) => [
      <Option key={cat.id} value={cat.name}>
        {'  '.repeat(level) + cat.name}
      </Option>,
      ...(cat.children ? renderCategoryOptions(cat.children, level + 1) : []),
    ]);
  };

  const handleSave = async () => {
    if (!editor) return;

    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const htmlContent = editor.getHTML();
      console.log('Saving content:', htmlContent); // Debug log
      
      const topicData = {
        title: values.title,
        content: htmlContent,
        category: values.category,
        keywords: keywords,
        mnemonics: mnemonics.filter(m => m.mnemonic.trim()),
      };

      if (topic) {
        await topicApi.update(topic.id!, topicData as unknown as TopicUpdate);
        message.success('토픽이 수정되었습니다.');
      } else {
        await topicApi.create(topicData as unknown as TopicCreate);
        message.success('토픽이 생성되었습니다.');
      }
      
      onSave();
    } catch (error) {
      message.error('토픽 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const colorOptions = [
    { label: '기본', value: '#000000' },
    { label: '빨강', value: '#ff0000' },
    { label: '파랑', value: '#0000ff' },
    { label: '녹색', value: '#008000' },
    { label: '보라', value: '#800080' },
  ];

  return (
    <>
      <Modal
        title={topic ? '토픽 수정' : '새 토픽 생성'}
        open={open}
        onCancel={onClose}
        width={1200}
        footer={[
          <Button key="cancel" onClick={onClose}>
            취소
          </Button>,
          <Button key="save" type="primary" loading={loading} onClick={handleSave}>
            저장
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="제목"
            rules={[{ required: true, message: '제목을 입력하세요' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="category" label="카테고리">
            <Select placeholder="카테고리를 선택하세요" allowClear>
              {renderCategoryOptions(categories)}
            </Select>
          </Form.Item>


          <Form.Item label="키워드">
            <div>
              <Input.Group compact>
                <Input
                  style={{ width: 'calc(100% - 59px)' }}
                  value={inputKeyword}
                  onChange={(e) => setInputKeyword(e.target.value)}
                  placeholder="키워드 입력"
                  onPressEnter={handleAddKeyword}
                />
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleAddKeyword}
                  style={{ width: '59px' }}
                />
              </Input.Group>
              <div style={{ marginTop: 8 }}>
                {keywords.map((keyword) => (
                  <Tag
                    key={keyword}
                    closable
                    onClose={() => handleRemoveKeyword(keyword)}
                    style={{ marginBottom: 4 }}
                  >
                    {keyword}
                  </Tag>
                ))}
              </div>
            </div>
          </Form.Item>

          <Form.Item label="암기법">
            <div>
              {mnemonics.map((mnemonic, index) => (
                <div key={index} style={{ marginBottom: 8 }}>
                  <Input.Group compact>
                    <Input
                      style={{ width: '30%' }}
                      placeholder="암기법"
                      value={mnemonic.mnemonic}
                      onChange={(e) =>
                        handleMnemonicChange(index, 'mnemonic', e.target.value)
                      }
                    />
                    <Input
                      style={{ width: '60%' }}
                      placeholder="전체 텍스트"
                      value={mnemonic.full_text}
                      onChange={(e) =>
                        handleMnemonicChange(index, 'full_text', e.target.value)
                      }
                    />
                    <Button
                      style={{ width: '10%' }}
                      icon={<MinusOutlined />}
                      onClick={() => handleRemoveMnemonic(index)}
                    />
                  </Input.Group>
                </div>
              ))}
              <Button
                type="dashed"
                onClick={handleAddMnemonic}
                icon={<PlusOutlined />}
                style={{ width: '100%' }}
              >
                암기법 추가
              </Button>
            </div>
          </Form.Item>

          <Form.Item label="내용">
            <div>
              <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px 6px 0 0', padding: '8px', backgroundColor: '#fafafa' }}>
                <Space size="small" wrap>
                  <Button
                    size="small"
                    icon={<BoldOutlined />}
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    type={editor?.isActive('bold') ? 'primary' : 'default'}
                  />
                  <Button
                    size="small"
                    icon={<ItalicOutlined />}
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    type={editor?.isActive('italic') ? 'primary' : 'default'}
                  />
                  <Button
                    size="small"
                    icon={<UnderlineOutlined />}
                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                    type={editor?.isActive('underline') ? 'primary' : 'default'}
                  />
                  
                  <Button
                    size="small"
                    icon={<AlignLeftOutlined />}
                    onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                    type={editor?.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}
                  />
                  <Button
                    size="small"
                    icon={<AlignCenterOutlined />}
                    onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                    type={editor?.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}
                  />
                  <Button
                    size="small"
                    icon={<AlignRightOutlined />}
                    onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                    type={editor?.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}
                  />

                  <Select
                    placeholder="색상"
                    style={{ width: 80 }}
                    size="small"
                    onChange={(value) => editor?.chain().focus().setColor(value).run()}
                  >
                    {colorOptions.map((color) => (
                      <Option key={color.value} value={color.value}>
                        <span style={{ color: color.value }}>{color.label}</span>
                      </Option>
                    ))}
                  </Select>

                  <Select
                    placeholder="크기"
                    style={{ width: 80 }}
                    size="small"
                    defaultValue="14px"
                    onChange={(value) => editor?.chain().focus().setFontSize(value).run()}
                  >
                    <Option value="12px">12px</Option>
                    <Option value="14px">14px</Option>
                    <Option value="16px">16px</Option>
                    <Option value="18px">18px</Option>
                    <Option value="20px">20px</Option>
                    <Option value="24px">24px</Option>
                    <Option value="28px">28px</Option>
                    <Option value="32px">32px</Option>
                  </Select>

                  <Select
                    placeholder="템플릿"
                    style={{ width: 120 }}
                    size="small"
                    allowClear
                    onChange={(templateId) => {
                      if (templateId) {
                        const template = templates.find(t => t.id === templateId);
                        if (template) {
                          editor?.commands.setContent(template.content);
                        }
                      }
                    }}
                  >
                    {templates.map((template) => (
                      <Option key={template.id} value={template.id}>
                        {template.name}
                      </Option>
                    ))}
                  </Select>


                  <Button
                    size="small"
                    icon={<PictureOutlined />}
                    onClick={addImage}
                  >
                    이미지
                  </Button>
                  <Button
                    size="small"
                    icon={<TableOutlined />}
                    onClick={insertTable}
                  >
                    표
                  </Button>

                  {editor?.isActive('table') && (
                    <>
                      <Button
                        size="small"
                        icon={<PlusIcon />}
                        onClick={() => editor?.chain().focus().addColumnAfter().run()}
                      >
                        열+
                      </Button>
                      <Button
                        size="small"
                        icon={<MinusOutlined />}
                        onClick={() => editor?.chain().focus().deleteColumn().run()}
                      >
                        열-
                      </Button>
                      <Button
                        size="small"
                        icon={<PlusIcon />}
                        onClick={() => editor?.chain().focus().addRowAfter().run()}
                      >
                        행+
                      </Button>
                      <Button
                        size="small"
                        icon={<MinusOutlined />}
                        onClick={() => editor?.chain().focus().deleteRow().run()}
                      >
                        행-
                      </Button>
                      <Button
                        size="small"
                        icon={<MergeCellsOutlined />}
                        onClick={() => editor?.chain().focus().mergeCells().run()}
                      >
                        병합
                      </Button>
                      <Button
                        size="small"
                        icon={<SplitCellsOutlined />}
                        onClick={() => editor?.chain().focus().splitCell().run()}
                      >
                        분할
                      </Button>
                    </>
                  )}
                </Space>
              </div>
              <div className="editor-container">
                <EditorContent editor={editor} />
              </div>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="표 삽입"
        open={isTableModalOpen}
        onCancel={() => setIsTableModalOpen(false)}
        onOk={createTable}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label>행 수: </label>
            <Select
              value={tableRows}
              onChange={(value) => setTableRows(value)}
              style={{ width: 100, marginLeft: 8 }}
            >
              {[...Array(10)].map((_, i) => (
                <Option key={i + 1} value={i + 1}>{i + 1}</Option>
              ))}
            </Select>
          </div>
          <div>
            <label>열 수: </label>
            <Select
              value={tableCols}
              onChange={(value) => setTableCols(value)}
              style={{ width: 100, marginLeft: 8 }}
            >
              {[...Array(10)].map((_, i) => (
                <Option key={i + 1} value={i + 1}>{i + 1}</Option>
              ))}
            </Select>
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default TopicEditor;