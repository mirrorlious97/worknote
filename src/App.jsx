import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Building2, 
  FileText, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Bell, 
  Plus, 
  MoreVertical,
  Briefcase,
  ChevronDown,
  Search,
  Trash2,
  Share,
  Download,
  Pin,
  FolderPlus,
  ArrowRight,
  Clock,
  SortAsc,
  Globe,
  Heart,
  Zap,
  Coffee,
  GraduationCap,
  Music,
  Camera,
  Edit3,
  ChevronRight,
  Menu,
  Save,
  Undo,
  LayoutList,
  ChevronUp,
  ChevronDown as ChevronDownIcon
} from 'lucide-react';

// 图标映射表
const IconMap = { 
  building: Building2, 
  briefcase: Briefcase, 
  folder: FolderPlus,
  globe: Globe,
  heart: Heart,
  zap: Zap,
  coffee: Coffee,
  school: GraduationCap,
  music: Music,
  camera: Camera
};

const AVAILABLE_ICONS = Object.keys(IconMap);

// --- 自动撑开高度的无缝文本框 (用于合并长文视图) ---
const AutoResizeTextarea = ({ value, onChange, className, ...props }) => {
  const ref = useRef(null);
  
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <textarea 
      ref={ref}
      value={value || ''} 
      onChange={onChange} 
      className={className} 
      style={{ overflow: 'hidden', resize: 'none' }}
      rows={1}
      {...props} 
    />
  );
};

// --- 稳定的原生日期选择按钮 ---
const DatePickerButton = ({ value, onChange, className }) => {
  const inputRef = useRef(null);
  return (
    <div 
      className={`relative overflow-hidden cursor-pointer ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        if (inputRef.current) {
          try { inputRef.current.showPicker(); } catch (err) {}
        }
      }}
    >
      <Calendar size={12} className="print:hidden pointer-events-none"/> 
      <span className="pointer-events-none">{value.slice(5)}</span>
      <input 
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={e => e.stopPropagation()}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
};

// --- 可右滑删除的任务组件 (右侧提醒栏使用) ---
const SwipeableTask = ({ task, onToggle, onDelete, onUpdateDeadline, isUrgent }) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    startX.current = e.clientX - offsetX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    let newOffset = e.clientX - startX.current;
    newOffset = Math.max(0, Math.min(newOffset, 80));
    setOffsetX(newOffset);
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (offsetX > 40) {
      setOffsetX(80);
    } else {
      setOffsetX(0);
    }
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden touch-pan-y group print:hidden">
      <div 
        className="absolute inset-0 bg-red-500 flex items-center justify-start pl-6 cursor-pointer"
        onClick={() => onDelete(task.noteId, task.id)}
      >
        <Trash2 size={18} className="text-white" />
      </div>
      <div
        className="bg-white p-3.5 border border-slate-200 shadow-sm group-hover:shadow-md cursor-grab active:cursor-grabbing relative z-10 select-none"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="flex items-start gap-3">
          <button 
            onPointerDown={(e) => e.stopPropagation()} 
            onClick={() => onToggle(task.noteId, task.id)} 
            className="mt-0.5 shrink-0 relative z-20"
          >
            <Circle size={16} className="text-slate-300 hover:text-blue-500 transition-colors" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-800 mb-1 leading-snug whitespace-pre-wrap pointer-events-none">{task.text}</div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <DatePickerButton 
                value={task.deadline}
                onChange={(newDate) => onUpdateDeadline && onUpdateDeadline(task.noteId, task.id, newDate)}
                className={`flex items-center gap-1 font-medium rounded px-1 -ml-1 hover:bg-slate-100 transition-colors ${isUrgent ? 'text-red-500' : 'text-slate-500'}`}
              />
              <span className="text-slate-300 pointer-events-none">|</span>
              <span className="text-slate-500 truncate flex items-center gap-1 pointer-events-none">
                <FileText size={12} />
                {task.noteTitle}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 预设初始数据 ---
const initialData = {
  notebooks: [
    { id: 'nb1', name: 'Mirrorli 的笔记本' }
  ],
  workspaces: [
    { id: 'w1', notebookId: 'nb1', name: 'A 科技公司 (驻场)', iconType: 'building', sortOrder: 'time' },
    { id: 'w2', notebookId: 'nb1', name: 'B 银行 (外包)', iconType: 'briefcase', sortOrder: 'time' },
  ],
  notes: [
    {
      id: 'n1', workspaceId: 'w1', title: '0402 需求对接会议纪要', isPinned: true, createdAt: 1712025000000,
      content: '今日与客户确认了第一期核心功能范围。\n\n重点结论：\n1. 用户登录体系需要对接他们原有的 OA 系统。\n2. 数据看板先不做复杂图表，优先保证数据导出功能。\n3. 下周三需要给出完整的 UI 交互稿。', updatedAt: '今天 10:30',
      tasks: [
        { id: 't1', text: '申请 OA 系统测试账号', deadline: '2026-04-03', completed: true },
        { id: 't2', text: '梳理登录流程图发给后端', deadline: '2026-04-04', completed: false },
        { id: 't3', text: '完成第一版 UI 设计稿', deadline: '2026-04-08', completed: false },
      ]
    },
    {
      id: 'n2', workspaceId: 'w1', title: '系统部署准备清单', isPinned: false, createdAt: 1711938600000,
      content: '正式环境部署前需要确认的各项配置信息...', updatedAt: '昨天 16:00',
      tasks: [{ id: 't4', text: '获取正式服务器 IP 网段', deadline: '2026-04-02', completed: false }]
    },
    {
      id: 'n3', workspaceId: 'w2', title: '季度报表优化方案', isPinned: false, createdAt: 1711679400000,
      content: '客户反馈目前的报表导出速度太慢，需要优化 SQL 查询。', updatedAt: '上周五',
      tasks: [{ id: 't5', text: '排查慢查询日志', deadline: '2026-04-05', completed: false }]
    }
  ]
};

export default function App() {
  const [notebooks, setNotebooks] = useState(() => {
    const saved = localStorage.getItem('my_notes_notebooks');
    return saved ? JSON.parse(saved) : initialData.notebooks;
  });

  const [workspaces, setWorkspaces] = useState(() => {
    const saved = localStorage.getItem('my_notes_workspaces');
    let parsed = saved ? JSON.parse(saved) : initialData.workspaces;
    return parsed.map(ws => ws.notebookId ? ws : { ...ws, notebookId: notebooks[0]?.id || 'nb1' });
  });

  const [notesData, setNotesData] = useState(() => {
    const saved = localStorage.getItem('my_notes_data');
    return saved ? JSON.parse(saved) : initialData.notes;
  });
  
  const [activeNotebookId, setActiveNotebookId] = useState(notebooks[0]?.id || 'nb1');
  const currentNotebookWorkspaces = workspaces.filter(w => w.notebookId === activeNotebookId);
  const [activeWorkspace, setActiveWorkspace] = useState(currentNotebookWorkspaces[0]?.id || null);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // ====== 重点修复：拖拽调整面板比例的底层逻辑 (使用 Pointer Capture API) ======
  const [contentHeight, setContentHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef({ startY: 0, startHeight: 0 });

  useEffect(() => {
    // 拖拽时修改全局光标和禁止选中，防止体验卡顿
    if (isResizing) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'row-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing]);

  const handleResizePointerDown = useCallback((e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId); // 强制捕获指针
    setIsResizing(true);
    resizeRef.current = {
      startY: e.clientY,
      startHeight: contentHeight
    };
  }, [contentHeight]);

  const handleResizePointerMove = useCallback((e) => {
    if (!isResizing) return;
    const delta = e.clientY - resizeRef.current.startY;
    let newHeight = resizeRef.current.startHeight + delta;
    
    // 边界限制：最小 100px，最大为屏幕高度减去顶部和底部的一些预留空间
    if (newHeight < 100) newHeight = 100;
    if (newHeight > window.innerHeight - 250) newHeight = window.innerHeight - 250;
    
    setContentHeight(newHeight);
  }, [isResizing]);

  const handleResizePointerUp = useCallback((e) => {
    if (!isResizing) return;
    setIsResizing(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId); // 释放指针
    } catch (err) {}
  }, [isResizing]);
  // ===========================================================================

  useEffect(() => {
    const validWorkspaces = workspaces.filter(w => w.notebookId === activeNotebookId);
    if (validWorkspaces.length > 0 && !validWorkspaces.find(w => w.id === activeWorkspace)) {
      setActiveWorkspace(validWorkspaces[0].id);
    } else if (validWorkspaces.length === 0) {
      setActiveWorkspace(null);
    }
  }, [activeNotebookId, workspaces]);

  useEffect(() => {
    if (activeWorkspace) {
      const currentWsNotes = notesData.filter(n => n.workspaceId === activeWorkspace);
      if (currentWsNotes.length > 0 && !currentWsNotes.find(n => n.id === activeNoteId)) {
        setActiveNoteId(currentWsNotes[0].id);
      }
    } else {
      setActiveNoteId(null);
    }
  }, [activeWorkspace, notesData]);

  const [isMergedView, setIsMergedView] = useState(false);
  const [scrollToNoteId, setScrollToNoteId] = useState(null);
  const [scrollToWorkspaceId, setScrollToWorkspaceId] = useState(null);

  const [editingId, setEditingId] = useState(null); 
  const [tempName, setTempName] = useState('');
  
  const [draggedNoteId, setDraggedNoteId] = useState(null);
  const [draggedWorkspaceId, setDraggedWorkspaceId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null); 
  const [subMenu, setSubMenu] = useState(null);
  const longPressTimerRef = useRef(null);

  const [isNoteMenuOpen, setIsNoteMenuOpen] = useState(false);
  const [pastStates, setPastStates] = useState([]);
  const textSnapshotRef = useRef(null);
  const [toastMessage, setToastMessage] = useState(null);
  
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [isNotebookMenuOpen, setIsNotebookMenuOpen] = useState(false);
  
  const currentNotebook = notebooks.find(nb => nb.id === activeNotebookId) || notebooks[0];

  useEffect(() => {
    localStorage.setItem('my_notes_notebooks', JSON.stringify(notebooks));
    localStorage.setItem('my_notes_workspaces', JSON.stringify(workspaces));
    localStorage.setItem('my_notes_data', JSON.stringify(notesData));
  }, [notebooks, workspaces, notesData]);

  useEffect(() => {
    if (isMergedView) {
      if (scrollToNoteId) {
        document.getElementById(`note-${scrollToNoteId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setScrollToNoteId(null);
      } else if (scrollToWorkspaceId) {
        document.getElementById(`workspace-${scrollToWorkspaceId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setScrollToWorkspaceId(null);
      }
    }
  }, [isMergedView, scrollToNoteId, scrollToWorkspaceId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const commitToHistory = useCallback(() => {
    setPastStates(prev => {
      if (!notesData || !workspaces) return prev; 
      const newState = {
        notes: JSON.parse(JSON.stringify(notesData)),
        workspaces: JSON.parse(JSON.stringify(workspaces))
      };
      const newPast = [...prev, newState];
      if (newPast.length > 50) newPast.shift(); 
      return newPast;
    });
  }, [notesData, workspaces]);

  const handleUndo = useCallback(() => {
    setPastStates(prev => {
      if (prev.length === 0) return prev;
      const previousState = prev[prev.length - 1];
      if (previousState.notes && previousState.workspaces) {
        setNotesData(previousState.notes);
        setWorkspaces(previousState.workspaces);
      }
      showToast('已撤销上一步操作 ↩');
      return prev.slice(0, -1);
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
          document.activeElement.blur();
        }
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
          document.activeElement.blur();
        }
        showToast('文档已保存');
      }
    };
    const handleClickOutside = () => {
      setContextMenu(null);
      setSubMenu(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [handleUndo]);

  const openContextMenu = (e, type, targetId) => {
    e.preventDefault();
    e.stopPropagation();
    setSubMenu(null);
    setContextMenu({ x: e.clientX || e.touches?.[0]?.clientX, y: e.clientY || e.touches?.[0]?.clientY, type, targetId });
  };

  const handleTouchStart = (e, type, targetId) => {
    e.stopPropagation();
    longPressTimerRef.current = setTimeout(() => {
      openContextMenu(e, type, targetId);
    }, 600); 
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
  };

  const handleExportPDF = () => {
    setIsNoteMenuOpen(false);
    setTimeout(() => window.print(), 100);
  };

  const startEditing = (id, currentName) => {
    setEditingId(id);
    setTempName(currentName);
    setContextMenu(null);
  };

  const saveRename = () => {
    if (!editingId) return;
    commitToHistory();
    const wsExists = workspaces.find(w => w.id === editingId);
    const nbExists = notebooks.find(nb => nb.id === editingId);

    if (wsExists) {
      setWorkspaces(prev => prev.map(w => w.id === editingId ? { ...w, name: tempName.trim() || '未命名分区' } : w));
    } else if (nbExists) {
      setNotebooks(prev => prev.map(nb => nb.id === editingId ? { ...nb, name: tempName.trim() || '未命名笔记本' } : nb));
    } else {
      setNotesData(prev => prev.map(n => n.id === editingId ? { ...n, title: tempName.trim() || '无标题文档' } : n));
    }
    setEditingId(null);
  };

  const createNotebook = () => {
    const newNb = { id: `nb_${Date.now()}`, name: `新笔记本 ${notebooks.length + 1}` };
    setNotebooks(prev => [...prev, newNb]);
    setActiveNotebookId(newNb.id);
    showToast(`已新建笔记本`);
    setTimeout(() => startEditing(newNb.id, newNb.name), 100);
  };

  const createWorkspace = () => {
    commitToHistory();
    const newWs = { 
      id: `ws_${Date.now()}`, 
      name: `新公司/项目 ${currentNotebookWorkspaces.length + 1}`, 
      iconType: 'building', 
      sortOrder: 'time',
      notebookId: activeNotebookId
    };
    setWorkspaces(prev => [...prev, newWs]);
    setActiveWorkspace(newWs.id);
    if (isMergedView) setScrollToWorkspaceId(newWs.id);
    setContextMenu(null);
    showToast(`已新建分区`);
    setTimeout(() => startEditing(newWs.id, newWs.name), 100);
  };

  const updateWorkspaceIcon = (wsId, iconType) => {
    commitToHistory();
    setWorkspaces(prev => prev.map(ws => ws.id === wsId ? { ...ws, iconType } : ws));
    setContextMenu(null);
    setSubMenu(null);
  };

  const updateWorkspaceSort = (wsId, sortType) => {
    commitToHistory();
    setWorkspaces(prev => prev.map(ws => ws.id === wsId ? { ...ws, sortOrder: sortType } : ws));
    showToast(sortType === 'time' ? '已按时间倒序' : '已按首字母排序');
  };

  const deleteWorkspace = (wsId) => {
    commitToHistory();
    setWorkspaces(prev => prev.filter(w => w.id !== wsId));
    setNotesData(prev => prev.filter(n => n.workspaceId !== wsId));
    showToast('分区已删除');
  };

  const handleNoteDragStart = (e, noteId) => {
    setDraggedNoteId(noteId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('dragType', 'note'); 
    e.dataTransfer.setData('noteId', noteId); 
  };

  const handleWorkspaceDragStart = (e, wsId) => {
    if (editingId === wsId) { e.preventDefault(); return; }
    setDraggedWorkspaceId(wsId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('dragType', 'workspace');
    e.dataTransfer.setData('wsId', wsId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetWsId) => {
    e.preventDefault();
    const dragType = e.dataTransfer.getData('dragType');

    if (dragType === 'note') {
      const noteId = e.dataTransfer.getData('noteId');
      if (noteId) {
        commitToHistory();
        setNotesData(prev => prev.map(n => n.id === noteId ? { ...n, workspaceId: targetWsId } : n));
        setActiveWorkspace(targetWsId);
        setActiveNoteId(noteId);
        if (isMergedView) setScrollToNoteId(noteId);
        showToast('已移动文档');
      }
      setDraggedNoteId(null);
    } 
    else if (dragType === 'workspace') {
      const sourceWsId = e.dataTransfer.getData('wsId');
      if (sourceWsId && sourceWsId !== targetWsId) {
        commitToHistory();
        setWorkspaces(prev => {
          const sourceIndex = prev.findIndex(w => w.id === sourceWsId);
          const targetIndex = prev.findIndex(w => w.id === targetWsId);
          if (sourceIndex === -1 || targetIndex === -1) return prev;
          const newWorkspaces = [...prev];
          const [movedWs] = newWorkspaces.splice(sourceIndex, 1);
          newWorkspaces.splice(targetIndex, 0, movedWs);
          return newWorkspaces;
        });
      }
      setDraggedWorkspaceId(null);
    }
  };

  const createNewNote = (wsId = activeWorkspace) => {
    if (!wsId) { showToast('请先新建一个分区'); return; }
    commitToHistory();
    const newNote = {
      id: `n_${Date.now()}`, workspaceId: wsId, title: '', content: '', updatedAt: '刚刚', createdAt: Date.now(), isPinned: false, tasks: []
    };
    setNotesData(prev => [newNote, ...(prev || [])]);
    setActiveNoteId(newNote.id);
    if (isMergedView) setScrollToNoteId(newNote.id);
    setTimeout(() => startEditing(newNote.id, ''), 100);
    setIsLeftSidebarOpen(false); 
  };

  const deleteNote = (noteId) => {
    commitToHistory();
    setNotesData(prev => prev.filter(n => n.id !== noteId));
    if (activeNoteId === noteId) setActiveNoteId(null);
    showToast('文档已删除 (可按 Ctrl+Z 撤销)');
  };

  const togglePinNote = (noteId) => {
    commitToHistory();
    setNotesData(prev => prev.map(n => n.id === noteId ? { ...n, isPinned: !n.isPinned } : n));
  };

  const updateWorkspaceField = (id, field, value) => {
    setWorkspaces(prev => prev.map(ws => ws.id === id ? { ...ws, [field]: value } : ws));
  };

  const updateNoteField = (id, field, value) => {
    setNotesData(prev => (prev || []).map(note => note.id === id ? { ...note, [field]: value, updatedAt: '刚刚' } : note));
  };

  const handleTextFocus = () => { if (notesData) textSnapshotRef.current = JSON.stringify({notes: notesData, workspaces}); };
  const handleTextBlur = () => {
    if (!notesData) return;
    const currentStr = JSON.stringify({notes: notesData, workspaces});
    if (textSnapshotRef.current && textSnapshotRef.current !== currentStr) {
      setPastStates(prev => [...prev, JSON.parse(textSnapshotRef.current)]);
    }
    textSnapshotRef.current = null;
  };

  const toggleTask = (noteId, taskId) => {
    commitToHistory();
    setNotesData(prev => prev.map(note => note.id === noteId ? { ...note, updatedAt: '刚刚', tasks: note.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) } : note));
  };
  const updateTaskText = (noteId, taskId, newText) => {
    setNotesData(prev => prev.map(note => note.id === noteId ? { ...note, tasks: note.tasks.map(t => t.id === taskId ? { ...t, text: newText } : t) } : note));
  };
  const updateTaskDeadline = (noteId, taskId, newDate) => {
    if (!newDate) return;
    commitToHistory();
    setNotesData(prev => prev.map(note => note.id === noteId ? { ...note, updatedAt: '刚刚', tasks: note.tasks.map(t => t.id === taskId ? { ...t, deadline: newDate } : t) } : note));
  };
  const addTask = (noteId) => {
    if (!newTaskText.trim()) return;
    commitToHistory();
    const newTask = { id: `t_${Date.now()}`, text: newTaskText.trim(), deadline: new Date().toISOString().split('T')[0], completed: false };
    setNotesData(prev => prev.map(note => note.id === noteId ? { ...note, tasks: [...(note.tasks || []), newTask] } : note));
    setNewTaskText('');
  };
  const deleteTask = (noteId, taskId) => {
    commitToHistory();
    setNotesData(prev => prev.map(note => note.id === noteId ? { ...note, tasks: note.tasks.filter(t => t.id !== taskId) } : note));
  };
  const moveTask = (noteId, taskId, direction) => {
    commitToHistory();
    setNotesData(prev => prev.map(note => {
      if (note.id !== noteId) return note;
      const tasks = [...(note.tasks || [])];
      const index = tasks.findIndex(t => t.id === taskId);
      if (index === -1) return note;
      
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= tasks.length) return note;
      
      [tasks[index], tasks[newIndex]] = [tasks[newIndex], tasks[index]];
      return { ...note, updatedAt: '刚刚', tasks };
    }));
  };

  const safeNotesData = Array.isArray(notesData) ? notesData : [];
  const currentNote = safeNotesData.find(n => n.id === activeNoteId);

  const getSortedNotes = (wsId) => {
    const ws = workspaces.find(w => w.id === wsId);
    let notes = safeNotesData.filter(n => n.workspaceId === wsId);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      notes = notes.filter(n => 
        (n.title && n.title.toLowerCase().includes(query)) ||
        (n.content && n.content.toLowerCase().includes(query)) ||
        (n.tasks && n.tasks.some(t => t.text.toLowerCase().includes(query)))
      );
    }

    notes.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      if (ws?.sortOrder === 'alpha') {
        return (a.title || '无标题文档').localeCompare(b.title || '无标题文档', 'zh');
      } else {
        return b.createdAt - a.createdAt;
      }
    });
    return notes;
  };

  const filteredWorkspaces = currentNotebookWorkspaces.filter(ws => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    if (ws.name.toLowerCase().includes(query)) return true;
    const hasMatchingNotes = safeNotesData.some(n => n.workspaceId === ws.id && (
      (n.title && n.title.toLowerCase().includes(query)) ||
      (n.content && n.content.toLowerCase().includes(query)) ||
      (n.tasks && n.tasks.some(t => t.text.toLowerCase().includes(query)))
    ));
    return hasMatchingNotes;
  });

  const currentWsIds = currentNotebookWorkspaces.map(w => w.id);
  const allPendingTasks = safeNotesData
    .filter(n => currentWsIds.includes(n.workspaceId))
    .flatMap(note => (note.tasks || []).filter(t => !t.completed).map(t => ({ ...t, noteTitle: note.title || '无标题文档', workspaceId: note.workspaceId, noteId: note.id })))
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  return (
    <div 
      className="flex h-screen bg-white text-slate-800 font-sans overflow-hidden relative select-none w-full print:h-auto print:overflow-visible"
      onContextMenu={(e) => { if (e.clientX < 256 && window.innerWidth >= 768) openContextMenu(e, 'empty', null); }}
      onTouchStart={(e) => { if (e.touches[0].clientX < 256 && window.innerWidth >= 768) handleTouchStart(e, 'empty', null); }}
      onTouchEnd={handleTouchEnd}
    >
      
      {/* 注入全局纤细滚动条样式 */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />

      {/* 撤销提示 Toast */}
      <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-5 py-2.5 rounded-full shadow-lg text-sm z-[300] transition-all duration-300 print:hidden ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        {toastMessage}
      </div>

      {/* 自定义右键菜单层 */}
      {contextMenu && (
        <div 
          className="fixed bg-white border border-slate-200 rounded-lg shadow-xl z-[400] py-1.5 w-48 text-sm print:hidden"
          style={{ left: Math.min(contextMenu.x, window.innerWidth - 200), top: Math.min(contextMenu.y, window.innerHeight - 250) }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'empty' && (
            <div className="px-3 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-2" onClick={createWorkspace}>
              <FolderPlus size={14} /> 新建公司/分区
            </div>
          )}

          {contextMenu.type === 'workspace' && (
            <>
              <div 
                className="px-3 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-2" 
                onClick={() => startEditing(contextMenu.targetId, workspaces.find(w => w.id === contextMenu.targetId).name)}
              >
                <Edit3 size={14} /> 重命名
              </div>
              <div 
                className="px-3 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center justify-between relative"
                onMouseEnter={() => setSubMenu('icon')}
                onMouseLeave={() => setSubMenu(null)}
              >
                <div className="flex items-center gap-2"><Camera size={14} /> 修改头像</div>
                <ChevronRight size={14} />
                {subMenu === 'icon' && (
                  <div className="absolute left-full top-0 w-48 bg-white border border-slate-200 rounded-lg shadow-xl p-2 grid grid-cols-4 gap-1 ml-1">
                    {AVAILABLE_ICONS.map(icon => {
                      const IconComp = IconMap[icon];
                      return (
                        <button 
                          key={icon} 
                          onClick={() => updateWorkspaceIcon(contextMenu.targetId, icon)} 
                          className="p-2 hover:bg-slate-100 rounded-md text-slate-500 flex justify-center items-center"
                        >
                          <IconComp size={16} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="h-px bg-slate-100 my-1"></div>
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">排序方式</div>
              <div className="px-3 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-2" onClick={() => { updateWorkspaceSort(contextMenu.targetId, 'time'); setContextMenu(null); }}>
                <Clock size={14} /> 按创建时间倒序
                {workspaces.find(w => w.id === contextMenu.targetId)?.sortOrder === 'time' && <CheckCircle2 size={12} className="ml-auto text-blue-500" />}
              </div>
              <div className="px-3 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-2" onClick={() => { updateWorkspaceSort(contextMenu.targetId, 'alpha'); setContextMenu(null); }}>
                <SortAsc size={14} /> 按首字母 A-Z
                {workspaces.find(w => w.id === contextMenu.targetId)?.sortOrder === 'alpha' && <CheckCircle2 size={12} className="ml-auto text-blue-500" />}
              </div>
              <div className="h-px bg-slate-100 my-1"></div>
              <div className="px-3 py-2 text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-2 font-medium" onClick={() => { deleteWorkspace(contextMenu.targetId); setContextMenu(null); }}>
                <Trash2 size={14} /> 删除此分区
              </div>
            </>
          )}

          {contextMenu.type === 'note' && (
            <>
              <div 
                className="px-3 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-2" 
                onClick={() => startEditing(contextMenu.targetId, safeNotesData.find(n => n.id === contextMenu.targetId).title)}
              >
                <Edit3 size={14} /> 重命名
              </div>
              <div className="px-3 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-2" onClick={() => { togglePinNote(contextMenu.targetId); setContextMenu(null); }}>
                <Pin size={14} className={safeNotesData.find(n => n.id === contextMenu.targetId)?.isPinned ? "fill-slate-700" : ""} /> 
                {safeNotesData.find(n => n.id === contextMenu.targetId)?.isPinned ? '取消置顶' : '置顶文档'}
              </div>
              
              <div 
                className="px-3 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center justify-between relative"
                onMouseEnter={() => setSubMenu('move')}
                onMouseLeave={() => setSubMenu(null)}
              >
                <div className="flex items-center gap-2"><ArrowRight size={14} /> 移动分区</div>
                <ChevronRight size={14} />
                {subMenu === 'move' && (
                  <div className="absolute left-full top-0 w-40 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 ml-1">
                    {currentNotebookWorkspaces.map(ws => (
                      <div key={ws.id} className="px-3 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer truncate" onClick={() => { moveNoteToWorkspace(contextMenu.targetId, ws.id); setContextMenu(null); }}>{ws.name}</div>
                    ))}
                  </div>
                )}
              </div>
              <div className="h-px bg-slate-100 my-1"></div>
              <div className="px-3 py-2 text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-2 font-medium" onClick={() => { deleteNote(contextMenu.targetId); setContextMenu(null); }}><Trash2 size={14} /> 删除此文档</div>
            </>
          )}
        </div>
      )}

      {/* --- 手机端抽屉遮罩 (左) --- */}
      {isLeftSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden print:hidden" 
          onClick={() => setIsLeftSidebarOpen(false)}
        />
      )}

      {/* 1. 左侧导航：公司与文件夹 */}
      <div 
        className={`absolute inset-y-0 left-0 md:relative flex-shrink-0 w-64 bg-slate-50 border-r border-slate-200 flex flex-col z-50 select-none transform transition-transform duration-300 print:hidden ${isLeftSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} md:translate-x-0 md:shadow-none`}
      >
        <div className="p-4 border-b border-slate-200">
          <div className="relative z-50">
            <div 
              onClick={() => setIsNotebookMenuOpen(!isNotebookMenuOpen)}
              className="flex items-center gap-2 mb-4 cursor-pointer hover:bg-slate-200 p-1.5 rounded-md transition-colors"
            >
              <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center text-sm font-medium shrink-0">
                {currentNotebook?.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-sm flex-1 truncate">{currentNotebook?.name}</span>
              <ChevronDown size={14} className={`text-slate-500 shrink-0 transition-transform ${isNotebookMenuOpen ? 'rotate-180' : ''}`} />
            </div>

            {isNotebookMenuOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setIsNotebookMenuOpen(false)} />
                <div className="absolute top-10 left-0 w-full bg-white border border-slate-200 rounded-lg shadow-lg py-1 overflow-hidden">
                  <div className="px-3 py-2 text-sm text-slate-400">切换笔记本</div>
                  {notebooks.map(nb => (
                    <div
                      key={nb.id}
                      onClick={(e) => { 
                        e.stopPropagation();
                        if (activeNotebookId === nb.id && editingId !== nb.id) {
                          startEditing(nb.id, nb.name);
                        } else {
                          setActiveNotebookId(nb.id); 
                          setIsNotebookMenuOpen(false); 
                        }
                      }}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 flex items-center gap-2 ${activeNotebookId === nb.id ? 'text-blue-600 font-medium' : 'text-slate-700'}`}
                    >
                      <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-xs text-slate-500 shrink-0">{nb.name.charAt(0).toUpperCase()}</div>
                      
                      {editingId === nb.id ? (
                        <input 
                          autoFocus 
                          value={tempName} 
                          onChange={e => setTempName(e.target.value)} 
                          onBlur={saveRename} 
                          onKeyDown={e => { if (e.key === 'Enter') { saveRename(); setIsNotebookMenuOpen(false); } if (e.key === 'Escape') setEditingId(null); }}
                          onClick={e => e.stopPropagation()}
                          className="bg-white border border-blue-500 rounded px-1 w-full outline-none text-slate-800 font-normal"
                        />
                      ) : (
                        <span className="truncate flex-1">{nb.name}</span>
                      )}
                    </div>
                  ))}
                  <div className="h-px bg-slate-100 my-1"></div>
                  <div 
                    onClick={(e) => { e.stopPropagation(); createNotebook(); }}
                    className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer flex items-center gap-2 transition-colors"
                  >
                    <Plus size={14} /> 新建笔记本...
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索标题、内容或待办..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-200/50 text-sm rounded-md border-none focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-1 pb-10 custom-scrollbar">
          {filteredWorkspaces.map(ws => {
            const IconComponent = IconMap[ws.iconType] || FolderPlus;
            const isNoteDragOver = draggedNoteId && safeNotesData.find(n => n.id === draggedNoteId)?.workspaceId !== ws.id;
            const isWsDragOver = draggedWorkspaceId && draggedWorkspaceId !== ws.id;
            const isExpanded = activeWorkspace === ws.id || searchQuery.trim() !== '' || isMergedView;

            return (
              <div 
                key={ws.id} 
                draggable={editingId !== ws.id && !searchQuery}
                onDragStart={(e) => handleWorkspaceDragStart(e, ws.id)}
                onDragEnd={() => setDraggedWorkspaceId(null)}
                className={`mb-4 rounded-lg transition-colors ${(isNoteDragOver || isWsDragOver) ? 'bg-blue-50/50 outline outline-1 outline-blue-200' : ''} ${draggedWorkspaceId === ws.id ? 'opacity-50' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, ws.id)}
              >
                <div 
                  className={`px-3 py-1.5 flex items-center gap-2 text-sm font-medium cursor-pointer rounded-md ${activeWorkspace === ws.id ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                  onClick={(e) => { 
                    e.stopPropagation();
                    if (activeWorkspace === ws.id && editingId !== ws.id) {
                      startEditing(ws.id, ws.name);
                    } else {
                      setActiveWorkspace(ws.id); 
                      if (isMergedView) setScrollToWorkspaceId(ws.id);
                      const firstNote = getSortedNotes(ws.id)[0]; 
                      if (firstNote && !searchQuery) {
                        setActiveNoteId(firstNote.id);
                        if (!isMergedView) setIsLeftSidebarOpen(false); 
                      }
                    }
                  }}
                  onContextMenu={(e) => openContextMenu(e, 'workspace', ws.id)}
                  onTouchStart={(e) => handleTouchStart(e, 'workspace', ws.id)}
                >
                  <IconComponent size={16} className={activeWorkspace === ws.id ? 'text-blue-600' : 'text-slate-400'} />
                  {editingId === ws.id ? (
                    <AutoResizeTextarea 
                      autoFocus 
                      value={tempName} 
                      onChange={e => setTempName(e.target.value)} 
                      onBlur={saveRename} 
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveRename(); } if (e.key === 'Escape') setEditingId(null); }}
                      onClick={e => e.stopPropagation()}
                      className="bg-white border border-blue-500 rounded px-1 w-full outline-none text-slate-800 font-normal"
                    />
                  ) : (
                    <span className="flex-1 whitespace-pre-wrap break-words">
                      {ws.name}
                      {searchQuery && <span className="ml-2 text-xs bg-slate-200 text-slate-500 px-1.5 rounded-full">{getSortedNotes(ws.id).length}</span>}
                    </span>
                  )}
                </div>
                
                {isExpanded && (
                  <div className="mt-1">
                    {getSortedNotes(ws.id).map(note => (
                      <div 
                        key={note.id}
                        draggable
                        onDragStart={(e) => handleNoteDragStart(e, note.id)}
                        onDragEnd={() => setDraggedNoteId(null)}
                        onClick={(e) => { 
                          e.stopPropagation();
                          if (activeNoteId === note.id && editingId !== note.id) {
                            startEditing(note.id, note.title);
                          } else {
                            setActiveWorkspace(ws.id);
                            setActiveNoteId(note.id);
                            if (isMergedView) setScrollToNoteId(note.id);
                            if (!isMergedView) setIsLeftSidebarOpen(false); 
                          }
                        }}
                        onContextMenu={(e) => openContextMenu(e, 'note', note.id)}
                        onTouchStart={(e) => handleTouchStart(e, 'note', note.id)}
                        className={`pl-8 pr-3 py-1.5 text-sm cursor-grab active:cursor-grabbing flex items-center gap-2 rounded-md mx-2 ${activeNoteId === note.id ? 'bg-blue-100/50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        {note.isPinned ? <Pin size={14} className="text-amber-500 fill-amber-500 shrink-0" /> : <FileText size={14} className={activeNoteId === note.id ? 'text-blue-500' : 'text-slate-400'} />}
                        {editingId === note.id ? (
                          <AutoResizeTextarea 
                            autoFocus 
                            value={tempName} 
                            onChange={e => setTempName(e.target.value)} 
                            onBlur={saveRename} 
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveRename(); } if (e.key === 'Escape') setEditingId(null); }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white border border-blue-500 rounded px-1 w-full outline-none text-slate-800 font-normal"
                          />
                        ) : (
                          <span className="flex-1 whitespace-pre-wrap break-words">{note.title || '无标题文档'}</span>
                        )}
                      </div>
                    ))}
                    {!searchQuery && (
                      <div 
                        onClick={() => createNewNote(ws.id)}
                        className="pl-8 pr-3 py-1.5 text-sm text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer flex items-center gap-2 mt-1 rounded-md mx-2 transition-colors"
                      >
                        <Plus size={14} /> 新建文档...
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {!searchQuery && (
            <div 
              onClick={createWorkspace}
              className="px-3 py-2 mt-2 text-sm text-slate-400 hover:text-blue-600 cursor-pointer flex items-center gap-2 transition-colors"
            >
              <FolderPlus size={16} /> 新建分区...
            </div>
          )}
          {searchQuery && filteredWorkspaces.length === 0 && (
            <div className="px-4 py-6 text-sm text-slate-400 text-center">无搜索结果</div>
          )}
        </div>
      </div>

      {/* 2. 中间主区域：文档与任务编辑器 */}
      <div className="flex-1 flex flex-col min-w-0 bg-white z-0 relative w-full print:w-full print:block print:m-0 print:p-0">
        
        {/* 顶部工具栏 (打印时隐藏) */}
        <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4 md:px-8 relative bg-white z-10 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsLeftSidebarOpen(true)} className="md:hidden p-1.5 text-slate-400 hover:bg-slate-100 rounded-md transition-colors">
              <Menu size={20} />
            </button>
            {!isMergedView && <div className="text-xs text-slate-400 hidden sm:block">最后更新于 {currentNote?.updatedAt || '刚刚'}</div>}
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <button 
              onClick={handleUndo}
              title="撤销 (Ctrl+Z)"
              disabled={pastStates.length === 0}
              className={`p-1.5 md:p-2 rounded-md transition-colors ${pastStates.length > 0 ? 'text-slate-500 hover:bg-slate-100 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}
            >
              <Undo size={18} />
            </button>

            <button 
              onClick={() => {
                if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                  document.activeElement.blur();
                }
                showToast('文档已保存');
              }}
              title="保存 (Ctrl+S)"
              className="p-1.5 md:p-2 rounded-md text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <Save size={18} />
            </button>
            
            <div className="w-px h-4 bg-slate-200 mx-1"></div>

            <button 
              onClick={() => setIsMergedView(!isMergedView)} 
              title={isMergedView ? "退出全局长文模式" : "合并视图 (全局长文模式)"}
              className={`p-1.5 md:p-2 rounded-md transition-colors ${isMergedView ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <LayoutList size={18} />
            </button>

            {!isMergedView && (
              <button 
                onClick={() => setIsRightSidebarOpen(true)} 
                className="md:hidden relative p-1.5 md:p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
              >
                <Bell size={18} />
                {allPendingTasks.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />}
              </button>
            )}

            <div className="relative">
              <button onClick={() => setIsNoteMenuOpen(!isNoteMenuOpen)} className={`p-1.5 md:p-2 rounded-md transition-colors ${isNoteMenuOpen ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
                <MoreVertical size={18} />
              </button>
              {isNoteMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNoteMenuOpen(false)} />
                  <div className="absolute right-0 top-10 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1.5 text-sm">
                    {currentNote && !isMergedView && (
                      <div className="px-3 py-2 text-slate-600 hover:bg-slate-50 cursor-pointer flex items-center gap-2" onClick={() => { togglePinNote(currentNote.id); setIsNoteMenuOpen(false); }}>
                        <Pin size={14} className={currentNote.isPinned ? "fill-slate-600" : ""} /> {currentNote.isPinned ? '取消置顶' : '置顶文档'}
                      </div>
                    )}
                    <div className="px-3 py-2 text-slate-600 hover:bg-slate-50 cursor-pointer flex items-center gap-2"><Share size={14} /> 复制分享链接</div>
                    <div className="px-3 py-2 text-slate-600 hover:bg-slate-50 cursor-pointer flex items-center gap-2" onClick={handleExportPDF}><Download size={14} /> 导出为 PDF (打印)</div>
                    
                    {currentNote && !isMergedView && (
                      <>
                        <div className="h-px bg-slate-100 my-1"></div>
                        <div className="px-3 py-2 text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-2 font-medium" onClick={() => { deleteNote(currentNote.id); setIsNoteMenuOpen(false); }}><Trash2 size={14} /> 删除此文档</div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ========== 模式A：合并长文模式 ========== */}
        {isMergedView && (
          <div className="flex-1 overflow-y-auto px-5 py-6 md:px-12 md:py-12 max-w-4xl mx-auto w-full custom-scrollbar print:w-full print:max-w-full print:overflow-visible print:p-0">
            {currentNotebookWorkspaces.map(ws => (
              <div key={ws.id} id={`workspace-${ws.id}`} className="mb-24 print:break-after-page">
                <AutoResizeTextarea
                  value={ws.name}
                  onChange={e => updateWorkspaceField(ws.id, 'name', e.target.value)}
                  onFocus={handleTextFocus} 
                  onBlur={handleTextBlur}
                  className="w-full text-4xl md:text-5xl font-black text-slate-800 border-none outline-none mb-10 bg-transparent print:text-black break-words"
                  placeholder="公司/分区名称"
                />
                
                {getSortedNotes(ws.id).length === 0 && (
                  <div className="text-slate-400 italic mb-8">此分区下暂无文档...</div>
                )}

                {getSortedNotes(ws.id).map(note => (
                  <div key={note.id} id={`note-${note.id}`} className="mb-16 pb-12 border-b border-slate-100 last:border-0 print:break-inside-avoid">
                    <AutoResizeTextarea 
                      value={note.title} 
                      onChange={(e) => updateNoteField(note.id, 'title', e.target.value)}
                      onFocus={handleTextFocus} onBlur={handleTextBlur}
                      className="w-full text-2xl md:text-3xl font-semibold text-slate-800 border-none outline-none mb-6 bg-transparent placeholder-slate-300 print:text-black print:mb-4 break-words" 
                      placeholder="无标题文档"
                    />
                    <AutoResizeTextarea 
                      value={note.content} onChange={(e) => updateNoteField(note.id, 'content', e.target.value)}
                      onFocus={handleTextFocus} onBlur={handleTextBlur}
                      className="w-full min-h-[100px] text-base md:text-lg text-slate-600 leading-relaxed outline-none bg-transparent mb-8 print:text-black" 
                      placeholder="在这里记录想法、会议纪要或需求细节..."
                    />

                    {/* 任务清单 (合并视图) */}
                    <div className="mt-8 pb-4 print:break-inside-avoid">
                      <div className="flex items-center gap-2 mb-4 text-slate-800 font-medium"><CheckCircle2 size={18} className="text-slate-400 print:text-black" /><span>任务清单 (To-Do)</span></div>
                      <div className="space-y-2">
                        {(note.tasks || []).map((task, index) => (
                          <div key={task.id} className="flex items-center group gap-2 md:gap-3 p-2 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-all print:border-none print:p-1">
                            <button onClick={() => toggleTask(note.id, task.id)} className="focus:outline-none shrink-0 print:hidden">
                              {task.completed ? <CheckCircle2 size={18} className="text-blue-500" /> : <Circle size={18} className="text-slate-300 group-hover:text-slate-400" />}
                            </button>
                            <span className="hidden print:inline-block shrink-0 mr-2 text-slate-800">
                              {task.completed ? '[ x ]' : '[   ]'}
                            </span>
                            <AutoResizeTextarea 
                              value={task.text} onChange={(e) => updateTaskText(note.id, task.id, e.target.value)}
                              onFocus={handleTextFocus} onBlur={handleTextBlur}
                              className={`flex-1 bg-transparent border-none outline-none text-sm ${task.completed ? 'text-slate-400 line-through print:text-slate-500' : 'text-slate-700 print:text-black'}`}
                            />
                            <DatePickerButton 
                              value={task.deadline}
                              onChange={(newDate) => updateTaskDeadline(note.id, task.id, newDate)}
                              className="flex items-center gap-1 px-1.5 py-1 md:gap-1.5 md:px-2 bg-slate-100 rounded text-xs text-slate-500 hover:bg-slate-200 transition-colors shrink-0 print:bg-transparent print:text-slate-800"
                            />
                            
                            {/* 手机端常驻显示排序按钮，并阻断事件冒泡防止激活输入框 */}
                            <div className="flex items-center gap-0.5 shrink-0 print:hidden ml-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-slate-400">
                              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveTask(note.id, task.id, -1); }} disabled={index === 0} className="p-1.5 hover:text-blue-500 disabled:opacity-20 rounded transition-all"><ChevronUp size={16} /></button>
                              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveTask(note.id, task.id, 1); }} disabled={index === (note.tasks || []).length - 1} className="p-1.5 hover:text-blue-500 disabled:opacity-20 rounded transition-all"><ChevronDownIcon size={16} /></button>
                              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteTask(note.id, task.id); }} className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded transition-all"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        ))}
                        
                        <div className="flex items-center gap-3 p-2 text-slate-400 mt-2 hover:bg-slate-50 rounded-lg transition-colors print:hidden">
                          <button onClick={() => addTask(note.id)} className="hover:text-blue-500 transition-colors focus:outline-none shrink-0" title="点击添加"><Plus size={18} /></button>
                          <input 
                            type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); addTask(note.id); } }}
                            placeholder="输入完毕按 Enter 添加新待办..." className="bg-transparent border-none outline-none flex-1 text-sm text-slate-700 placeholder-slate-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ========== 模式B：单文档常规模式 (还原独立的滚动条与区隔) ========== */}
        {!isMergedView && currentNote ? (
          <div className="flex-1 flex flex-col min-h-0 max-w-4xl mx-auto w-full print:w-full print:max-w-full print:overflow-visible print:p-0">
            
            {/* 上部分：正文白板区 (带有独立滚动条，高度动态可调) */}
            <div className="flex flex-col px-5 pt-6 md:px-12 md:pt-10 shrink-0 print:h-auto" style={{ height: `${contentHeight}px` }}>
              <AutoResizeTextarea 
                value={currentNote.title} onChange={(e) => updateNoteField(currentNote.id, 'title', e.target.value)}
                onFocus={handleTextFocus} onBlur={handleTextBlur}
                className="shrink-0 w-full text-2xl md:text-3xl font-semibold text-slate-800 border-none outline-none mb-6 bg-transparent placeholder-slate-300 print:text-black print:mb-4 break-words" placeholder="无标题文档"
              />
              <textarea 
                value={currentNote.content} onChange={(e) => updateNoteField(currentNote.id, 'content', e.target.value)}
                onFocus={handleTextFocus} onBlur={handleTextBlur}
                className="flex-1 min-h-0 overflow-y-auto w-full text-base md:text-lg text-slate-600 leading-relaxed resize-none outline-none bg-transparent custom-scrollbar print:text-black print:h-auto print:overflow-visible" 
                placeholder="在这里记录想法、会议纪要或需求细节..."
              />
            </div>

            {/* 可拖拽调整高度的分割线 */}
            <div 
              className={`py-2 -my-2 flex items-center justify-center cursor-row-resize group print:hidden relative z-10 mx-5 md:mx-12 shrink-0 ${isResizing ? 'bg-slate-50/50' : ''}`}
              onPointerDown={handleResizePointerDown}
              onPointerMove={handleResizePointerMove}
              onPointerUp={handleResizePointerUp}
              onPointerCancel={handleResizePointerUp}
              title="上下拖动调整面板大小"
            >
              <div className={`w-full h-px transition-colors ${isResizing ? 'bg-blue-400' : 'bg-slate-100 group-hover:bg-blue-300'}`} />
              <div className={`absolute w-8 h-1 rounded-full transition-colors ${isResizing ? 'bg-blue-500' : 'bg-slate-200 group-hover:bg-blue-400'}`} />
            </div>

            {/* 下部分：任务清单区 (占据剩余高度，带独立滚动条) */}
            <div className="flex-1 min-h-[150px] overflow-y-auto custom-scrollbar px-5 md:px-12 pt-6 pb-10 md:pb-6 print:break-inside-avoid print:overflow-visible">
              <div className="flex items-center gap-2 mb-4 text-slate-800 font-medium"><CheckCircle2 size={18} className="text-slate-400 print:text-black" /><span>任务清单 (To-Do)</span></div>
              <div className="space-y-2">
                {(currentNote.tasks || []).map((task, index) => (
                  <div key={task.id} className="flex items-center group gap-2 md:gap-3 p-2 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-all print:border-none print:p-1">
                    <button onClick={() => toggleTask(currentNote.id, task.id)} className="focus:outline-none shrink-0 print:hidden">
                      {task.completed ? <CheckCircle2 size={18} className="text-blue-500" /> : <Circle size={18} className="text-slate-300 group-hover:text-slate-400" />}
                    </button>
                    <span className="hidden print:inline-block shrink-0 mr-2 text-slate-800">
                      {task.completed ? '[ x ]' : '[   ]'}
                    </span>
                    <AutoResizeTextarea 
                      value={task.text} onChange={(e) => updateTaskText(currentNote.id, task.id, e.target.value)}
                      onFocus={handleTextFocus} onBlur={handleTextBlur}
                      className={`flex-1 bg-transparent border-none outline-none text-sm ${task.completed ? 'text-slate-400 line-through print:text-slate-500' : 'text-slate-700 print:text-black'}`}
                    />
                    <DatePickerButton 
                      value={task.deadline}
                      onChange={(newDate) => updateTaskDeadline(currentNote.id, task.id, newDate)}
                      className="flex items-center gap-1 px-1.5 py-1 md:gap-1.5 md:px-2 bg-slate-100 rounded text-xs text-slate-500 hover:bg-slate-200 transition-colors shrink-0 print:bg-transparent print:text-slate-800"
                    />

                    {/* 手机端常驻显示，电脑端悬停显示，并拦截冒泡 */}
                    <div className="flex items-center gap-0.5 shrink-0 print:hidden ml-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-slate-400">
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveTask(currentNote.id, task.id, -1); }} disabled={index === 0} className="p-1.5 hover:text-blue-500 disabled:opacity-20 rounded transition-all"><ChevronUp size={16} /></button>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveTask(currentNote.id, task.id, 1); }} disabled={index === (currentNote.tasks || []).length - 1} className="p-1.5 hover:text-blue-500 disabled:opacity-20 rounded transition-all"><ChevronDownIcon size={16} /></button>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteTask(currentNote.id, task.id); }} className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
                
                <div className="flex items-center gap-3 p-2 text-slate-400 mt-2 hover:bg-slate-50 rounded-lg transition-colors print:hidden">
                  <button onClick={() => addTask(currentNote.id)} className="hover:text-blue-500 transition-colors focus:outline-none shrink-0" title="点击添加"><Plus size={18} /></button>
                  <input 
                    type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); addTask(currentNote.id); } }}
                    placeholder="输入完毕按 Enter 添加新待办..." className="bg-transparent border-none outline-none flex-1 text-sm text-slate-700 placeholder-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : !isMergedView && (
          <div className="flex-1 flex items-center justify-center text-slate-400 relative print:hidden">
            <button onClick={() => setIsLeftSidebarOpen(true)} className="absolute top-4 left-4 md:hidden p-2 bg-slate-100 rounded-lg"><Menu size={20}/></button>
            左侧还没有文档，点击「新建文档...」开始记录
          </div>
        )}
      </div>

      {/* --- 手机端抽屉遮罩 (右) --- */}
      {isRightSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden print:hidden" 
          onClick={() => setIsRightSidebarOpen(false)}
        />
      )}

      {/* 右侧提醒栏 (增加电脑端收缩隐藏功能) */}
      {!isMergedView && (
        <>
          <div 
            className={`absolute inset-y-0 right-0 md:relative flex-shrink-0 bg-slate-50 border-l border-slate-200 flex flex-col shadow-[inset_1px_0_0_0_rgba(0,0,0,0.02)] z-50 transition-all duration-300 print:hidden 
            ${isRightSidebarOpen ? 'translate-x-0 w-80 shadow-[0_0_40px_rgba(0,0,0,0.1)]' : 'translate-x-full md:translate-x-0 w-80'} 
            ${isRightSidebarCollapsed ? 'md:w-0 md:border-none md:opacity-0 md:overflow-hidden' : 'md:w-80'}
            `}
          >
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white z-10 shrink-0">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-blue-600" />
                <span className="font-semibold text-slate-800 text-sm">即将到来</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 text-xs py-0.5 px-2 rounded-full font-medium">{allPendingTasks.length}</span>
                {/* 电脑端收起按钮 */}
                <button onClick={() => setIsRightSidebarCollapsed(true)} className="hidden md:flex p-1 text-slate-400 hover:bg-slate-100 rounded-md transition-colors" title="收起提醒侧栏">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-10 custom-scrollbar">
              {allPendingTasks.length > 0 ? (
                allPendingTasks.map(task => (
                  <SwipeableTask key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} onUpdateDeadline={updateTaskDeadline} isUrgent={task.deadline === new Date().toISOString().split('T')[0]} />
                ))
              ) : (
                <div className="text-center text-slate-400 text-sm py-10">太棒了！所有任务已清空 🎉</div>
              )}
            </div>
          </div>

          {/* 侧栏收缩后悬浮在边缘的精致小铃铛 */}
          {isRightSidebarCollapsed && (
            <button 
              onClick={() => setIsRightSidebarCollapsed(false)}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-slate-200 border-r-0 shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-l-xl p-2 flex-col items-center gap-2 z-40 hover:bg-slate-50 transition-colors group"
              title="展开提醒中心"
            >
              <Bell size={18} className="text-blue-500 group-hover:animate-bounce" />
              <span className="bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded-full font-bold">{allPendingTasks.length}</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}