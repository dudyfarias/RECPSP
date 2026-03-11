import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';

// ============= Helpers =============
const AVATAR_COLORS = ['#b45309', '#9333ea', '#dc2626', '#0d9488', '#2563eb', '#c026d3', '#ea580c', '#16a34a'];
function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const d = new Date(dateStr + 'Z');
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d`;
  return `${Math.floor(diff / 2592000)}mo`;
}
function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
  return String(n);
}

// ============= Topic Type Icons =============
function DiscussionIcon({ active }) {
  return (
    <svg className="w-10 h-10" fill="none" stroke={active ? 'white' : '#9ca3af'} viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2z" />
      <path strokeLinecap="round" d="M8 8h8M8 11h5" />
    </svg>
  );
}

function QuestionIcon({ active }) {
  return (
    <svg className="w-10 h-10" fill="none" stroke={active ? 'white' : '#9ca3af'} viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01" />
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  );
}

function PollIcon({ active }) {
  return (
    <svg className="w-10 h-10" fill="none" stroke={active ? 'white' : '#9ca3af'} viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" d="M4 8h10M4 12h16M4 16h6" />
      <rect x="3" y="4" width="18" height="16" rx="2" strokeLinejoin="round" />
    </svg>
  );
}

function ImagesIcon({ active }) {
  return (
    <svg className="w-10 h-10" fill="none" stroke={active ? 'white' : '#9ca3af'} viewBox="0 0 24 24" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function VideoIcon({ active }) {
  return (
    <svg className="w-10 h-10" fill="none" stroke={active ? 'white' : '#9ca3af'} viewBox="0 0 24 24" strokeWidth="1.5">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M10 9l5 3-5 3V9z" fill={active ? 'white' : '#9ca3af'} stroke="none" />
    </svg>
  );
}

function OtherIcon({ active }) {
  return (
    <svg className="w-10 h-10" fill="none" stroke={active ? 'white' : '#9ca3af'} viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" d="M4 6h16M4 10h12M4 14h16M4 18h8" />
    </svg>
  );
}

const TOPIC_TYPES = [
  { key: 'discussion', label: 'Discussao', Icon: DiscussionIcon },
  { key: 'question', label: 'Pergunta', Icon: QuestionIcon },
  { key: 'poll', label: 'Votacao', Icon: PollIcon },
  { key: 'images', label: 'Imagens', Icon: ImagesIcon },
  { key: 'video', label: 'Video', Icon: VideoIcon },
  { key: 'other', label: 'Outro', Icon: OtherIcon },
];

// ============= Toolbar Button =============
function ToolbarBtn({ children, title }) {
  return (
    <button type="button" title={title}
      className="w-8 h-8 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition text-sm">
      {children}
    </button>
  );
}

// ============= Main Component =============
export default function NewTopic() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('discussion');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const MAX_TITLE = 99;

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch('/categories'),
  });

  const { data: topics } = useQuery({
    queryKey: ['topics'],
    queryFn: () => apiFetch('/topics'),
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Insira um titulo para o topico.'); return; }
    if (!categoryId) { setError('Selecione uma categoria.'); return; }
    if (!content.trim()) { setError('Escreva o conteudo do topico.'); return; }

    try {
      const tagList = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      const result = await apiFetch('/topics', {
        method: 'POST',
        body: JSON.stringify({ title, category_id: categoryId, content, tags: tagList, type }),
      }, token);
      navigate(`/topic/${result.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  // Not logged in
  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md mx-auto">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Acesso necessario</h2>
          <p className="text-sm text-gray-500 mb-4">Voce precisa estar logado para criar um topico.</p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-gray-600 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition">Entrar</Link>
            <Link to="/register" className="text-sm font-semibold text-white bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition">Inscrever</Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter related topics
  const filteredTopics = (topics || []).filter(t =>
    searchQuery ? t.title.toLowerCase().includes(searchQuery.toLowerCase()) : true
  ).slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Page title */}
      <h1 className="text-lg font-semibold text-gray-800 mb-1">Criar novo Topico</h1>
      <div className="border-b border-gray-200 mb-6"></div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg text-sm mb-5">
            {error}
          </div>
        )}

        {/* ====== Titulo ====== */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-red-500 mb-2">Titulo do topico</label>
          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value.slice(0, MAX_TITLE))}
              placeholder="Assunto do seu topico"
              className="w-full bg-gray-100 rounded-lg px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-300 pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
              {MAX_TITLE - title.length}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            Descreva bem o seu topico, enquanto mantem o assunto o mais resumido possivel.
          </p>
        </div>

        {/* ====== Tipo de topico ====== */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo de topico</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {TOPIC_TYPES.map(t => {
              const active = type === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setType(t.key)}
                  className={`flex flex-col items-center justify-center py-5 px-2 rounded-lg border-2 transition cursor-pointer ${
                    active
                      ? 'bg-red-500 border-red-500 text-white shadow-md'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <t.Icon active={active} />
                  <span className={`text-xs font-medium mt-2 ${active ? 'text-white' : 'text-gray-500'}`}>
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ====== Corpo do Topico ====== */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Corpo do Topico</label>

          {/* Toolbar */}
          <div className="flex items-center gap-0.5 mb-2 flex-wrap">
            <ToolbarBtn title="Preview">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            </ToolbarBtn>
            <ToolbarBtn title="Negrito"><strong className="text-sm">B</strong></ToolbarBtn>
            <ToolbarBtn title="Italico"><em className="text-sm">I</em></ToolbarBtn>
            <ToolbarBtn title="Link">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </ToolbarBtn>
            <ToolbarBtn title="Citacao"><span className="text-base leading-none font-serif">"</span></ToolbarBtn>
            <ToolbarBtn title="Codigo"><span className="font-mono text-xs">&lt;/&gt;</span></ToolbarBtn>
            <ToolbarBtn title="Upload">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </ToolbarBtn>
            <ToolbarBtn title="Lista">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </ToolbarBtn>
            <ToolbarBtn title="Titulo"><span className="font-bold text-sm">H</span></ToolbarBtn>
            <ToolbarBtn title="Separador"><span className="text-gray-300">—</span></ToolbarBtn>
            <ToolbarBtn title="Emoji">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </ToolbarBtn>
            <ToolbarBtn title="Configuracoes">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </ToolbarBtn>
            <ToolbarBtn title="Editar">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </ToolbarBtn>
          </div>

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Coloque sua duvida ou pensamento..."
            className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-300 h-36 resize-none placeholder-gray-400"
          />
        </div>

        {/* ====== Categoria & Tags ====== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-300 appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
            >
              <option value="">Selecionar</option>
              {categories?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="Use virgulas para separar as tags"
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-300 placeholder-gray-400"
            />
          </div>
        </div>

        {/* ====== Botoes ====== */}
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            className="bg-red-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition shadow-sm"
          >
            Perguntar para Especialista
          </button>
          <button
            type="submit"
            className="bg-red-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition shadow-sm"
          >
            Criar novo Post
          </button>
        </div>
      </form>

      {/* ====== Topicos Relacionados ====== */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <p className="text-sm font-medium text-gray-700">Topicos relacionados e que podem ser interessantes</p>
          <div className="relative">
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Procurar por topicos"
              className="bg-gray-100 rounded-lg pl-9 pr-3 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-300 w-56 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center py-2.5 px-4 text-xs text-gray-500 font-medium uppercase tracking-wider border-b border-gray-200 bg-gray-50">
            <div className="flex-1">Topicos</div>
            <div className="w-28 text-center hidden md:block">Categoria</div>
            <div className="w-20 text-center hidden sm:block">Curtidas</div>
            <div className="w-20 text-center font-bold text-gray-700">Respostas</div>
            <div className="w-24 text-center hidden sm:block">Visualizacoes</div>
          </div>

          {/* Rows */}
          {filteredTopics.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">Nenhum topico encontrado.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredTopics.map(topic => (
                <div key={topic.id} className="flex items-center py-3 px-4 hover:bg-gray-50 transition">
                  {/* Avatar */}
                  <div className="mr-3 flex-shrink-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: getAvatarColor(topic.username) }}
                    >
                      {topic.username[0].toUpperCase()}
                    </div>
                  </div>

                  {/* Titulo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {topic.pinned === 1 && <span className="text-gray-400 text-sm">&#x1F4CC;</span>}
                      {topic.locked === 1 && <span className="text-gray-400 text-sm">&#x1F512;</span>}
                      <Link
                        to={`/topic/${topic.id}`}
                        className="text-gray-800 font-medium text-sm hover:text-blue-600 transition truncate"
                      >
                        {topic.title}
                      </Link>
                    </div>
                  </div>

                  {/* Categoria badge */}
                  <div className="w-28 text-center hidden md:flex justify-center">
                    <span
                      className="text-xs text-white px-2.5 py-1 rounded-sm font-medium truncate"
                      style={{ backgroundColor: topic.category_color }}
                    >
                      {topic.category_name}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="w-20 text-center text-sm text-gray-500 hidden sm:block">{topic.like_count || 0}</div>
                  <div className="w-20 text-center text-sm font-bold text-gray-800">{topic.reply_count}</div>
                  <div className="w-24 text-center text-sm text-gray-500 hidden sm:block">{formatNumber(topic.views)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
