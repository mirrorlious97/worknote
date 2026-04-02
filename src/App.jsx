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
  Menu
} from 'lucide-react';

// 图标映射表：扩展了更多可选头像
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

// 可供选择的图标类型列表
const AVAILABLE_ICONS = Object.keys(IconMap);

// --- 可右滑删除的任务组件 ---
const SwipeableTask = ({ task, onToggle, onDelete, isUrgent }) => {
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
    <div className="relative w-full rounded-xl overflow-hidden touch-pan-y group">
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
          <div className="flex-1 min-w-0 pointer-events-none">
            <div className="text-sm font-medium text-slate-800 mb-1 leading-snug">{task.text}</div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`flex items-center gap-1 font-medium ${isUrgent ? 'text-red-500' : 'text-slate-500'}`}>
                <Calendar size={12} />
                {task.deadline}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 truncate flex items-center gap-1">
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

// --- Mock Data ---
const initialData = {
  workspaces: [
    { id: 'w1', name: 'A 科技公司 (驻场)', iconType: 'building', sortOrder: 'time' },
    { id: 'w2', name: 'B 银行 (外包)', iconType: 'briefcase', sortOrder: 'time' },
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
  // --- 核心数据状态 ---
  const [workspaces, setWorkspaces] = useState(initialData.workspaces);
  const [notesData, setNotesData] = useState(initialData.notes);
  
  const [activeWorkspace, setActiveWorkspace] = useState('w1');
  const [activeNoteId, setActiveNoteId] = useState('n1');
  const [newTaskText, setNewTaskText] = useState('');
  
  // --- 重命名状态 ---
  const [editingId, setEditingId] = useState(null); 
  const [tempName, setTempName] = useState('');
  
  // --- 拖拽与右键菜单状态 ---
  const [draggedNoteId, setDraggedNoteId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null); 
  const [subMenu, setSubMenu] = useState(null); // 'icon' | 'move'
  const longPressTimerRef = useRef(null);

  // --- UI 与历史状态 ---
  const [isNoteMenuOpen, setIsNoteMenuOpen] = useState(false);
  const [pastStates, setPastStates] = useState([]);
  const textSnapshotRef = useRef(null);
  const [toastMessage, setToastMessage] = useState(null);
  
  // --- 移动端抽屉控制状态 ---
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  const [notebooks, setNotebooks] = useState([{ id: 'nb1', name: 'Mirrorli 的笔记本' }]);
  const [activeNotebookId, setActiveNotebookId] = useState('nb1');
  const [isNotebookMenuOpen, setIsNotebookMenuOpen] = useState(false);
  
  const currentNotebook = notebooks.find(nb => nb.id === activeNotebookId) || notebooks[0];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // --- 撤销逻辑 ---
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

  // --- 重命名逻辑 ---
  const startEditing = (id, currentName) => {
    setEditingId(id);
    setTempName(currentName);
    setContextMenu(null);
  };

  const saveRename = () => {
    if (!editingId) return;
    commitToHistory();
    const wsExists = workspaces.find(w => w.id === editingId);
    if (wsExists) {
      setWorkspaces(prev => prev.map(w => w.id === editingId ? { ...w, name: tempName.trim() || '未命名分区' } : w));
    } else {
      setNotesData(prev => prev.map(n => n.id === editingId ? { ...n, title: tempName.trim() || '无标题文档' } : n));
    }
    setEditingId(null);
  };

  // --- 公司(Workspace)操作 ---
  const createWorkspace = () => {
    commitToHistory();
    const newWs = { 
      id: `ws_${Date.now()}`, 
      name: `新公司/项目 ${workspaces.length + 1}`, 
      iconType: 'building', 
      sortOrder: 'time' 
    };
    setWorkspaces(prev => [...prev, newWs]);
    setActiveWorkspace(newWs.id);
    setContextMenu(null);
    showToast(`已新建分区`);
    // 延迟自动进入编辑状态
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

  // 2. 文档(Note)操作
  const createNewNote = (wsId = activeWorkspace) => {
    commitToHistory();
    const newNote = {
      id: `n_${Date.now()}`,
      workspaceId: wsId,
      title: '', content: '', updatedAt: '刚刚', createdAt: Date.now(),
      isPinned: false, tasks: []
    };
    setNotesData(prev => [newNote, ...(prev || [])]);
    setActiveNoteId(newNote.id);
    setTimeout(() => startEditing(newNote.id, ''), 100);
    setIsLeftSidebarOpen(false); // 手机端创建后自动收起侧边栏
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

  const moveNoteToWorkspace = (noteId, targetWsId) => {
    commitToHistory();
    setNotesData(prev => prev.map(n => n.id === noteId ? { ...n, workspaceId: targetWsId } : n));
    setActiveWorkspace(targetWsId);
    setActiveNoteId(noteId);
    showToast('已移动文档');
  };

  const handleDragStart = (e, noteId) => {
    setDraggedNoteId(noteId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', noteId); 
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetWsId) => {
    e.preventDefault();
    if (draggedNoteId) {
      moveNoteToWorkspace(draggedNoteId, targetWsId);
      setDraggedNoteId(null);
    }
  };

  const updateNoteField = (id, field, value) => {
    setNotesData(prev => (prev || []).map(note => note.id === id ? { ...note, [field]: value, updatedAt: '刚刚' } : note));
  };

  const handleTextFocus = () => { if (notesData) textSnapshotRef.current = JSON.stringify(notesData); };
  const handleTextBlur = () => {
    if (!notesData) return;
    const currentStr = JSON.stringify(notesData);
    if (textSnapshotRef.current && textSnapshotRef.current !== currentStr) {
      setPastStates(prev => [...prev, { notes: JSON.parse(textSnapshotRef.current), workspaces }]);
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
  const addTask = (noteId) => {
    if (!newTaskText.trim()) return;
    commitToHistory();
    const newTask = { id: `t_${Date.now()}`, text: newTaskText.trim(), deadline: new Date().toISOString().split('T')[0], completed: false };
    setNotesData(prev => prev.map(note => note.id === noteId ? { ...note, tasks: [...note.tasks, newTask] } : note));
    setNewTaskText('');
  };
  const deleteTask = (noteId, taskId) => {
    commitToHistory();
    setNotesData(prev => prev.map(note => note.id === noteId ? { ...note, tasks: note.tasks.filter(t => t.id !== taskId) } : note));
  };

  const safeNotesData = Array.isArray(notesData) ? notesData : [];
  const currentNote = safeNotesData.find(n => n.id === activeNoteId);

  const allPendingTasks = safeNotesData
    .flatMap(note => (note.tasks || []).filter(t => !t.completed).map(t => ({ ...t, noteTitle: note.title || '无标题文档', workspaceId: note.workspaceId, noteId: note.id })))
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const getSortedNotes = (wsId) => {
    const ws = workspaces.find(w => w.id === wsId);
    let notes = safeNotesData.filter(n => n.workspaceId === wsId);
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

  return (
    <div 
      className="flex h-screen bg-white text-slate-800 font-sans overflow-hidden relative select-none w-full"
      onContextMenu={(e) => { if (e.clientX < 256 && window.innerWidth >= 768) openContextMenu(e, 'empty', null); }}
      onTouchStart={(e) => { if (e.touches[0].clientX < 256 && window.innerWidth >= 768) handleTouchStart(e, 'empty', null); }}
      onTouchEnd={handleTouchEnd}
    >
      
      {/* 撤销提示 Toast */}
      <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-5 py-2.5 rounded-full shadow-lg text-sm z-[200] transition-all duration-300 ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        {toastMessage}
      </div>

      {/* 自定义右键菜单层 */}
      {contextMenu && (
        <div 
          className="fixed bg-white border border-slate-200 rounded-lg shadow-xl z-[300] py-1.5 w-48 text-sm"
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
                    {workspaces.map(ws => (
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
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsLeftSidebarOpen(false)}
        />
      )}

      {/* 1. 左侧导航：公司与文件夹 */}
      <div 
        className={`absolute inset-y-0 left-0 md:relative flex-shrink-0 w-64 bg-slate-50 border-r border-slate-200 flex flex-col z-50 select-none transform transition-transform duration-300 ${isLeftSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} md:translate-x-0 md:shadow-none`}
      >
        <div className="p-4 border-b border-slate-200">
          <div className="relative z-50">
            <div 
              onClick={() => setIsNotebookMenuOpen(!isNotebookMenuOpen)}
              className="flex items-center gap-2 mb-4 cursor-pointer hover:bg-slate-200 p-1.5 rounded-md transition-colors"
            >
              <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center text-sm font-medium shrink-0">
                {currentNotebook.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-sm flex-1 truncate">{currentNotebook.name}</span>
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
                      onClick={() => { setActiveNotebookId(nb.id); setIsNotebookMenuOpen(false); }}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 flex items-center gap-2 ${activeNotebookId === nb.id ? 'text-blue-600 font-medium' : 'text-slate-700'}`}
                    >
                      <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-xs text-slate-500 shrink-0">{nb.name.charAt(0).toUpperCase()}</div>
                      <span className="truncate flex-1">{nb.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" placeholder="搜索关键字..." 
              className="w-full pl-8 pr-3 py-1.5 bg-slate-200/50 text-sm rounded-md border-none focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-1 pb-10">
          {workspaces.map(ws => {
            const IconComponent = IconMap[ws.iconType] || FolderPlus;
            const isDragOver = draggedNoteId && safeNotesData.find(n => n.id === draggedNoteId)?.workspaceId !== ws.id;

            return (
              <div 
                key={ws.id} 
                className={`mb-4 rounded-lg transition-colors ${isDragOver ? 'bg-blue-50/50 outline outline-1 outline-blue-200' : ''}`}
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
                      const firstNote = getSortedNotes(ws.id)[0]; 
                      if (firstNote) {
                        setActiveNoteId(firstNote.id);
                        setIsLeftSidebarOpen(false); // 手机端点选后自动收起
                      }
                    }
                  }}
                  onContextMenu={(e) => openContextMenu(e, 'workspace', ws.id)}
                  onTouchStart={(e) => handleTouchStart(e, 'workspace', ws.id)}
                >
                  <IconComponent size={16} className={activeWorkspace === ws.id ? 'text-blue-600' : 'text-slate-400'} />
                  {editingId === ws.id ? (
                    <input 
                      autoFocus 
                      value={tempName} 
                      onChange={e => setTempName(e.target.value)} 
                      onBlur={saveRename} 
                      onKeyDown={e => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') setEditingId(null); }}
                      onClick={e => e.stopPropagation()}
                      className="bg-white border border-blue-500 rounded px-1 w-full outline-none text-slate-800 font-normal"
                    />
                  ) : (
                    <span className="truncate flex-1">{ws.name}</span>
                  )}
                </div>
                
                {activeWorkspace === ws.id && (
                  <div className="mt-1">
                    {getSortedNotes(ws.id).map(note => (
                      <div 
                        key={note.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, note.id)}
                        onDragEnd={() => setDraggedNoteId(null)}
                        onClick={(e) => { 
                          e.stopPropagation();
                          if (activeNoteId === note.id && editingId !== note.id) {
                            startEditing(note.id, note.title);
                          } else {
                            setActiveNoteId(note.id);
                            setIsLeftSidebarOpen(false); // 手机端点选后自动收起
                          }
                        }}
                        onContextMenu={(e) => openContextMenu(e, 'note', note.id)}
                        onTouchStart={(e) => handleTouchStart(e, 'note', note.id)}
                        className={`pl-8 pr-3 py-1.5 text-sm cursor-grab active:cursor-grabbing flex items-center gap-2 rounded-md mx-2 ${activeNoteId === note.id ? 'bg-blue-100/50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        {note.isPinned ? <Pin size={14} className="text-amber-500 fill-amber-500 shrink-0" /> : <FileText size={14} className={activeNoteId === note.id ? 'text-blue-500' : 'text-slate-400'} />}
                        {editingId === note.id ? (
                          <input 
                            autoFocus 
                            value={tempName} 
                            onChange={e => setTempName(e.target.value)} 
                            onBlur={saveRename} 
                            onKeyDown={e => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') setEditingId(null); }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white border border-blue-500 rounded px-1 w-full outline-none text-slate-800 font-normal"
                          />
                        ) : (
                          <span className="truncate">{note.title || '无标题文档'}</span>
                        )}
                      </div>
                    ))}
                    <div 
                      onClick={() => createNewNote(ws.id)}
                      className="pl-8 pr-3 py-1.5 text-sm text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer flex items-center gap-2 mt-1 rounded-md mx-2 transition-colors"
                    >
                      <Plus size={14} /> 新建文档...
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div 
            onClick={createWorkspace}
            className="px-3 py-2 mt-2 text-sm text-slate-400 hover:text-blue-600 cursor-pointer flex items-center gap-2 transition-colors"
          >
            <FolderPlus size={16} /> 新建分区...
          </div>
        </div>
      </div>

      {/* 2. 中间主区域：文档与任务编辑器 */}
      <div className="flex-1 flex flex-col min-w-0 bg-white z-0 relative w-full">
        {currentNote ? (
          <>
            {/* 顶部工具栏适配了移动端呼出按钮 */}
            <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4 md:px-8 relative bg-white z-10 shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsLeftSidebarOpen(true)} className="md:hidden p-1.5 text-slate-400 hover:bg-slate-100 rounded-md transition-colors">
                  <Menu size={20} />
                </button>
                <div className="text-xs text-slate-400 hidden sm:block">最后更新于 {currentNote.updatedAt}</div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleUndo}
                  title="撤销 (Ctrl+Z)"
                  disabled={pastStates.length === 0}
                  className={`text-sm px-2 py-1.5 md:px-3 md:py-1.5 rounded-md transition-colors ${pastStates.length > 0 ? 'text-slate-500 hover:bg-slate-100 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}
                >撤销</button>
                
                <button 
                  onClick={() => setIsRightSidebarOpen(true)} 
                  className="md:hidden relative p-1.5 text-slate-400 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <Bell size={20} />
                  {allPendingTasks.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />}
                </button>

                <div className="relative">
                  <button onClick={() => setIsNoteMenuOpen(!isNoteMenuOpen)} className={`p-1.5 rounded-md transition-colors ${isNoteMenuOpen ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
                    <MoreVertical size={18} />
                  </button>
                  {isNoteMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsNoteMenuOpen(false)} />
                      <div className="absolute right-0 top-10 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1.5 text-sm">
                        <div className="px-3 py-2 text-slate-600 hover:bg-slate-50 cursor-pointer flex items-center gap-2" onClick={() => { togglePinNote(currentNote.id); setIsNoteMenuOpen(false); }}>
                          <Pin size={14} className={currentNote.isPinned ? "fill-slate-600" : ""} /> {currentNote.isPinned ? '取消置顶' : '置顶文档'}
                        </div>
                        <div className="px-3 py-2 text-slate-600 hover:bg-slate-50 cursor-pointer flex items-center gap-2"><Share size={14} /> 复制分享链接</div>
                        <div className="px-3 py-2 text-slate-600 hover:bg-slate-50 cursor-pointer flex items-center gap-2"><Download size={14} /> 导出为 PDF / MD</div>
                        <div className="h-px bg-slate-100 my-1"></div>
                        <div className="px-3 py-2 text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-2 font-medium" onClick={() => { deleteNote(currentNote.id); setIsNoteMenuOpen(false); }}><Trash2 size={14} /> 删除此文档</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 md:px-8 md:py-10 max-w-3xl mx-auto w-full">
              <input 
                type="text" value={currentNote.title} onChange={(e) => updateNoteField(currentNote.id, 'title', e.target.value)}
                onFocus={handleTextFocus} onBlur={handleTextBlur}
                className="w-full text-2xl md:text-3xl font-semibold text-slate-800 border-none outline-none mb-6 bg-transparent placeholder-slate-300" placeholder="无标题文档"
              />
              <textarea 
                value={currentNote.content} onChange={(e) => updateNoteField(currentNote.id, 'content', e.target.value)}
                onFocus={handleTextFocus} onBlur={handleTextBlur}
                className="w-full min-h-[120px] text-base md:text-lg text-slate-600 leading-relaxed resize-none outline-none bg-transparent mb-8" placeholder="在这里记录想法、会议纪要或需求细节..."
              />

              <div className="mt-8 pb-10 md:pb-0">
                <div className="flex items-center gap-2 mb-4 text-slate-800 font-medium"><CheckCircle2 size={18} className="text-slate-400" /><span>本质任务清单 (To-Do)</span></div>
                <div className="space-y-2">
                  {(currentNote.tasks || []).map(task => (
                    <div key={task.id} className="flex items-center group gap-2 md:gap-3 p-2 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-all">
                      <button onClick={() => toggleTask(currentNote.id, task.id)} className="focus:outline-none shrink-0">
                        {task.completed ? <CheckCircle2 size={18} className="text-blue-500" /> : <Circle size={18} className="text-slate-300 group-hover:text-slate-400" />}
                      </button>
                      <input 
                        type="text" value={task.text} onChange={(e) => updateTaskText(currentNote.id, task.id, e.target.value)}
                        onFocus={handleTextFocus} onBlur={handleTextBlur}
                        className={`flex-1 bg-transparent border-none outline-none text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}
                      />
                      <div className="flex items-center gap-1 px-1.5 py-1 md:gap-1.5 md:px-2 bg-slate-100 rounded text-xs text-slate-500 cursor-pointer hover:bg-slate-200 transition-colors shrink-0">
                        <Calendar size={12} /> {task.deadline.slice(5)} {/* 手机上略微精简日期显示 */}
                      </div>
                      <button onClick={() => deleteTask(currentNote.id, task.id)} className="opacity-0 md:group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all shrink-0"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  
                  <div className="flex items-center gap-3 p-2 text-slate-400 mt-2 hover:bg-slate-50 rounded-lg transition-colors">
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 relative">
            <button onClick={() => setIsLeftSidebarOpen(true)} className="absolute top-4 left-4 md:hidden p-2 bg-slate-100 rounded-lg"><Menu size={20}/></button>
            左侧还没有文档，点击「新建文档...」开始记录
          </div>
        )}
      </div>

      {/* --- 手机端抽屉遮罩 (右) --- */}
      {isRightSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsRightSidebarOpen(false)}
        />
      )}

      {/* 右侧提醒栏 */}
      <div 
        className={`absolute inset-y-0 right-0 md:relative flex-shrink-0 w-80 bg-slate-50 border-l border-slate-200 flex flex-col shadow-[inset_1px_0_0_0_rgba(0,0,0,0.02)] z-50 transform transition-transform duration-300 ${isRightSidebarOpen ? 'translate-x-0 shadow-[0_0_40px_rgba(0,0,0,0.1)]' : 'translate-x-full'} md:translate-x-0 md:shadow-none`}
      >
        <div className="p-5 border-b border-slate-200 flex items-center gap-2 bg-white z-10 shrink-0">
          <Bell size={18} className="text-blue-600" />
          <span className="font-semibold text-slate-800 text-sm">即将到来 (提醒)</span>
          <span className="ml-auto bg-blue-100 text-blue-700 text-xs py-0.5 px-2 rounded-full font-medium">{allPendingTasks.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-10">
          {allPendingTasks.length > 0 ? (
            allPendingTasks.map(task => (
              <SwipeableTask key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} isUrgent={task.deadline === new Date().toISOString().split('T')[0]} />
            ))
          ) : (
            <div className="text-center text-slate-400 text-sm py-10">太棒了！所有任务已清空 🎉</div>
          )}
        </div>
      </div>
    </div>
  );
}