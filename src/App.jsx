import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownUp, CalendarDays, Check, CheckCheck, Circle, ClipboardList,
  Clock3, LayoutDashboard, ListTodo, MoreHorizontal, Pencil, Plus,
  Search, Sparkles, Trash2, X
} from 'lucide-react'

const STORAGE_KEY = 'taskflow-tasks-v1'

const initialTasks = [
  {
    id: 'sample-1',
    title: 'Definir objetivos da semana',
    description: 'Organizar as principais entregas e prioridades.',
    priority: 'high',
    dueDate: '',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    title: 'Revisar anotações da aula',
    description: 'Separar os pontos que precisam de mais atenção.',
    priority: 'medium',
    dueDate: '',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    title: 'Organizar arquivos do projeto',
    description: 'Limpar pastas e atualizar a documentação.',
    priority: 'low',
    dueDate: '',
    completed: true,
    createdAt: new Date().toISOString(),
  },
]

const filters = [
  { id: 'all', label: 'Todas' },
  { id: 'pending', label: 'Pendentes' },
  { id: 'completed', label: 'Concluídas' },
]

const emptyForm = { title: '', description: '', priority: 'medium', dueDate: '' }

function readTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : initialTasks
  } catch {
    return initialTasks
  }
}

function formatDate(value) {
  if (!value) return 'Sem prazo'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(`${value}T12:00:00`))
}

function isOverdue(task) {
  if (!task.dueDate || task.completed) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(`${task.dueDate}T00:00:00`) < today
}

function App() {
  const [tasks, setTasks] = useState(readTasks)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [menuId, setMenuId] = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length
    const pending = tasks.length - completed
    const overdue = tasks.filter(isOverdue).length
    return {
      total: tasks.length,
      completed,
      pending,
      overdue,
      rate: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
    }
  }, [tasks])

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase()
    return tasks
      .filter((task) => {
        if (filter === 'pending' && task.completed) return false
        if (filter === 'completed' && !task.completed) return false
        return !query || `${task.title} ${task.description}`.toLowerCase().includes(query)
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed)
        const priority = { high: 0, medium: 1, low: 2 }
        if (priority[a.priority] !== priority[b.priority]) return priority[a.priority] - priority[b.priority]
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
        if (a.dueDate) return -1
        if (b.dueDate) return 1
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
  }, [tasks, filter, search])

  function openNewTask() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEditTask(task) {
    setEditingId(task.id)
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate || '',
    })
    setShowForm(true)
    setMenuId(null)
  }

  function saveTask(event) {
    event.preventDefault()
    const title = form.title.trim()
    if (!title) return

    if (editingId) {
      setTasks((current) => current.map((task) =>
        task.id === editingId ? { ...task, ...form, title } : task
      ))
    } else {
      setTasks((current) => [{
        id: crypto.randomUUID(),
        ...form,
        title,
        completed: false,
        createdAt: new Date().toISOString(),
      }, ...current])
    }
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  function toggleTask(id) {
    setTasks((current) => current.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id))
    setMenuId(null)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="TaskFlow início">
          <span className="brand-mark"><CheckCheck size={19} /></span>
          <span>taskflow<span className="brand-dot">.</span></span>
        </a>

        <div className="sidebar-label">MENU PRINCIPAL</div>
        <nav className="side-nav" aria-label="Menu principal">
          <button className="nav-item active" type="button">
            <LayoutDashboard size={18} /> Visão geral
          </button>
          <button className="nav-item" type="button" onClick={() => setFilter('all')}>
            <ListTodo size={18} /> Minhas tarefas
            <span className="nav-count">{stats.total}</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <div className="note-icon"><Sparkles size={16} /></div>
            <p>Pequenos passos também levam a grandes resultados.</p>
          </div>
          <div className="profile">
            <div className="avatar">TF</div>
            <div className="profile-copy">
              <strong>Meu espaço</strong>
              <span>Área pessoal</span>
            </div>
            <MoreHorizontal size={18} className="profile-more" />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>Visão geral</strong></div>
          <div className="topbar-right"><span className="status-dot" /> Seus dados ficam neste dispositivo</div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow">SEU PAINEL DE CONTROLE</div>
              <h1>Visão geral</h1>
              <p className="page-subtitle">Acompanhe suas tarefas e mantenha o foco no que importa.</p>
            </div>
            <button className="primary-button" onClick={openNewTask} type="button">
              <Plus size={18} /> Nova tarefa
            </button>
          </section>

          <section className="stats-grid" aria-label="Resumo das tarefas">
            <article className="stat-card">
              <div className="stat-top"><span>Total de tarefas</span><span className="stat-icon"><ClipboardList size={18} /></span></div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-foot">Tarefas no seu espaço</div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span>Pendentes</span><span className="stat-icon"><Clock3 size={18} /></span></div>
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-foot">Aguardando conclusão</div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span>Concluídas</span><span className="stat-icon"><Check size={18} /></span></div>
              <div className="stat-value">{stats.completed}</div>
              <div className="stat-foot">Tarefas finalizadas</div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span>Em atraso</span><span className="stat-icon"><CalendarDays size={18} /></span></div>
              <div className="stat-value">{stats.overdue}</div>
              <div className="stat-foot">Precisam de atenção</div>
            </article>
          </section>

          <section className="progress-panel">
            <div className="progress-copy">
              <div>
                <span className="section-kicker">SEU DESEMPENHO</span>
                <h2>Progresso geral</h2>
                <p>Você concluiu <strong>{stats.completed}</strong> de {stats.total} tarefas.</p>
              </div>
              <div className="progress-percent">{stats.rate}<span>%</span></div>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${stats.rate}%` }} /></div>
          </section>

          <section className="tasks-section">
            <div className="tasks-heading">
              <div>
                <span className="section-kicker">ORGANIZAÇÃO</span>
                <h2>Minhas tarefas</h2>
              </div>
              <div className="task-tools">
                <label className="search-box">
                  <Search size={17} />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar tarefa..." aria-label="Buscar tarefa" />
                  {search && <button type="button" onClick={() => setSearch('')} aria-label="Limpar busca"><X size={15} /></button>}
                </label>
                <span className="sort-indicator"><ArrowDownUp size={15} /> Prioridade</span>
              </div>
            </div>

            <div className="filter-tabs" role="tablist" aria-label="Filtrar tarefas">
              {filters.map((item) => (
                <button
                  className={filter === item.id ? 'filter-tab selected' : 'filter-tab'}
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  type="button"
                  role="tab"
                  aria-selected={filter === item.id}
                >
                  {item.label}
                  <span>{item.id === 'all' ? stats.total : item.id === 'pending' ? stats.pending : stats.completed}</span>
                </button>
              ))}
            </div>

            <div className="task-list">
              {visibleTasks.length ? visibleTasks.map((task) => (
                <article className={task.completed ? 'task-row is-completed' : 'task-row'} key={task.id}>
                  <button className="complete-button" type="button" onClick={() => toggleTask(task.id)} aria-label={task.completed ? 'Reabrir tarefa' : 'Concluir tarefa'}>
                    {task.completed ? <Check size={15} /> : <Circle size={19} />}
                  </button>
                  <div className="task-main">
                    <div className="task-title-line">
                      <h3>{task.title}</h3>
                      <span className={`priority priority-${task.priority}`}>{task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}</span>
                    </div>
                    {task.description && <p>{task.description}</p>}
                    <div className={isOverdue(task) ? 'task-date overdue' : 'task-date'}>
                      <CalendarDays size={14} /> {isOverdue(task) ? 'Atrasada · ' : ''}{formatDate(task.dueDate)}
                    </div>
                  </div>
                  <div className="task-actions">
                    <button className="icon-button" type="button" onClick={() => openEditTask(task)} aria-label="Editar tarefa"><Pencil size={16} /></button>
                    <div className="menu-wrap">
                      <button className="icon-button" type="button" onClick={() => setMenuId(menuId === task.id ? null : task.id)} aria-label="Mais opções"><MoreHorizontal size={18} /></button>
                      {menuId === task.id && (
                        <div className="action-menu">
                          <button type="button" onClick={() => openEditTask(task)}><Pencil size={14} /> Editar</button>
                          <button type="button" onClick={() => deleteTask(task.id)} className="delete-action"><Trash2 size={14} /> Excluir</button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              )) : (
                <div className="empty-state">
                  <div className="empty-icon"><ListTodo size={24} /></div>
                  <h3>Nenhuma tarefa encontrada</h3>
                  <p>{search ? 'Tente buscar por outro termo.' : 'Adicione uma tarefa para começar a organizar seu dia.'}</p>
                  {!search && <button type="button" className="text-button" onClick={openNewTask}><Plus size={16} /> Criar primeira tarefa</button>}
                </div>
              )}
            </div>
            <div className="list-footer"><span>Exibindo {visibleTasks.length} de {stats.total} tarefas</span><span><span className="footer-dot" /> Sincronizado localmente</span></div>
          </section>

          <footer className="page-footer">TASKFLOW <span>·</span> ORGANIZE. PRIORIZE. CONCLUA.</footer>
        </div>
      </main>

      {showForm && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowForm(false)}>
          <section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-header">
              <div><span className="section-kicker">{editingId ? 'ATUALIZE OS DETALHES' : 'ADICIONE À SUA LISTA'}</span><h2 id="modal-title">{editingId ? 'Editar tarefa' : 'Nova tarefa'}</h2></div>
              <button className="icon-button" type="button" onClick={() => setShowForm(false)} aria-label="Fechar"><X size={19} /></button>
            </div>
            <form onSubmit={saveTask}>
              <label className="field-label">Título <span>*</span>
                <input autoFocus maxLength={90} required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Ex.: Estudar para a avaliação" />
              </label>
              <label className="field-label">Descrição
                <textarea rows="3" maxLength={240} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Adicione mais detalhes (opcional)" />
              </label>
              <div className="form-grid">
                <label className="field-label">Prioridade
                  <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </label>
                <label className="field-label">Prazo
                  <input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
                </label>
              </div>
              <div className="modal-actions">
                <button className="secondary-button" type="button" onClick={() => setShowForm(false)}>Cancelar</button>
                <button className="primary-button" type="submit">{editingId ? 'Salvar alterações' : 'Criar tarefa'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default App