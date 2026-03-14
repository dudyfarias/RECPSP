import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import RichTextEditor from '../components/RichTextEditor';

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

function ImageIcon({ active }) {
  return (
    <svg className="w-10 h-10" fill="none" stroke={active ? 'white' : '#9ca3af'} viewBox="0 0 24 24" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
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

const TOPIC_TYPES = [
  { key: 'discussion', label: 'Discussão', Icon: DiscussionIcon, desc: 'Dissertação ou debate' },
  { key: 'poll', label: 'Votação', Icon: PollIcon, desc: 'Enquete com alternativas' },
  { key: 'images', label: 'Imagem', Icon: ImageIcon, desc: 'Texto + imagem' },
  { key: 'video', label: 'Vídeo', Icon: VideoIcon, desc: 'Vídeo ou link externo' },
];

// ============= Helpers =============
const AVATAR_COLORS = ['#b45309', '#9333ea', '#dc2626', '#0d9488', '#2563eb', '#c026d3', '#ea580c', '#16a34a'];
function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
  return String(n);
}

// ============= Helper: detectar embed de vídeo =============
function getVideoEmbed(url) {
  if (!url) return null;
  // YouTube
  let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  // Vimeo
  match = url.match(/vimeo\.com\/(\d+)/);
  if (match) return `https://player.vimeo.com/video/${match[1]}`;
  return null;
}

// ============= Main Component =============
export default function NewTopic() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('discussion');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(false);

  // Poll state
  const [pollOptions, setPollOptions] = useState(['', '']);

  // Image state
  const [imagePreview, setImagePreview] = useState(null);
  const [imageData, setImageData] = useState('');

  // Video state
  const [videoUrl, setVideoUrl] = useState('');

  const MAX_TITLE = 99;
  const MAX_QUESTION = 100;

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch('/categories'),
  });

  const { data: allTags } = useQuery({
    queryKey: ['tags'],
    queryFn: () => apiFetch('/tags'),
  });

  const { data: allTopics } = useQuery({
    queryKey: ['topics'],
    queryFn: () => apiFetch('/topics'),
  });

  // ====== Poll handlers ======
  function addPollOption() {
    if (pollOptions.length < 10) {
      setPollOptions([...pollOptions, '']);
    }
  }

  function removePollOption(index) {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  }

  function updatePollOption(index, value) {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  }

  // ====== Image handler ======
  function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setError('Imagem muito grande. Máximo 4MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
      setImageData(ev.target.result);
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImagePreview(null);
    setImageData('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // ====== Reset type-specific data when changing type ======
  function handleTypeChange(newType) {
    setType(newType);
    setError('');
  }

  // ====== Submit ======
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!title.trim()) { setError('Insira um título para o tópico.'); return; }
    if (!categoryId) { setError('Selecione uma categoria.'); return; }

    // Validações por tipo
    if (type === 'question') {
      if (!content.trim()) { setError('Escreva sua pergunta.'); return; }
      if (content.length > MAX_QUESTION) { setError(`Pergunta deve ter no máximo ${MAX_QUESTION} caracteres.`); return; }
    } else if (type === 'poll') {
      if (!content.trim()) { setError('Escreva a explicação ou pergunta da votação.'); return; }
      const validOptions = pollOptions.filter(o => o.trim());
      if (validOptions.length < 2) { setError('Adicione pelo menos 2 alternativas para a votação.'); return; }
    } else if (type === 'images') {
      if (!content.trim()) { setError('Escreva uma explicação para a imagem.'); return; }
      if (!imageData) { setError('Selecione uma imagem para enviar.'); return; }
    } else if (type === 'video') {
      if (!content.trim()) { setError('Escreva uma explicação para o vídeo.'); return; }
      if (!videoUrl.trim()) { setError('Insira o link do vídeo.'); return; }
    } else {
      if (!content.trim()) { setError('Escreva o conteúdo do tópico.'); return; }
    }

    setSubmitting(true);
    try {
      const tagList = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      const body = {
        title,
        category_id: categoryId,
        content,
        tags: tagList,
        type,
      };

      if (type === 'poll') {
        body.poll_options = pollOptions.filter(o => o.trim());
      }
      if (type === 'images' && imageData) {
        body.image_url = imageData;
      }
      if (type === 'video' && videoUrl) {
        body.video_url = videoUrl;
      }

      const result = await apiFetch('/topics', {
        method: 'POST',
        body: JSON.stringify(body),
      }, token);

      // Se o topico ficou pendente (imagem/video de usuario comum), mostrar mensagem
      if (result.status === 'pending') {
        setPendingMessage(true);
        setTimeout(() => navigate('/forum'), 5000);
        return;
      }

      navigate(`/topic/${result.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
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
          <h2 className="text-lg font-bold text-gray-800 mb-2">Acesso necessário</h2>
          <p className="text-sm text-gray-500 mb-4">É necessário criar uma conta ou fazer login para criar um tópico.</p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-gray-600 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition">Entrar</Link>
            <Link to="/register" className="text-sm font-semibold text-white bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition">Inscrever</Link>
          </div>
        </div>
      </div>
    );
  }

  const videoEmbed = getVideoEmbed(videoUrl);

  // Mensagem de tópico pendente
  if (pendingMessage) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-lg border border-yellow-200 p-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Tópico enviado para análise</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            Seu tópico foi enviado e está em análise. Ele será publicado após aprovação de um moderador.
          </p>
          <p className="text-xs text-gray-400">Redirecionando para o fórum em alguns segundos...</p>
          <Link to="/forum" className="inline-block mt-4 text-sm font-semibold text-red-500 hover:text-red-600 transition">
            Voltar ao fórum →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Page title */}
      <h1 className="text-lg font-semibold text-gray-800 mb-1">Criar novo Tópico</h1>
      <div className="border-b border-gray-200 mb-6"></div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg text-sm mb-5">
            {error}
          </div>
        )}

        {/* ====== Tipo de tópico ====== */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo de tópico</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {TOPIC_TYPES.map(t => {
              const active = type === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => handleTypeChange(t.key)}
                  className={`flex flex-col items-center justify-center py-4 px-2 rounded-lg border-2 transition cursor-pointer ${
                    active
                      ? 'bg-red-500 border-red-500 text-white shadow-md'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <t.Icon active={active} />
                  <span className={`text-xs font-medium mt-1.5 ${active ? 'text-white' : 'text-gray-600'}`}>
                    {t.label}
                  </span>
                  <span className={`text-[10px] mt-0.5 ${active ? 'text-red-100' : 'text-gray-400'}`}>
                    {t.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ====== Título ====== */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-red-500 mb-2">Título do tópico</label>
          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value.slice(0, MAX_TITLE))}
              placeholder="Assunto do seu tópico"
              className="w-full bg-gray-100 rounded-lg px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-300 pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
              {MAX_TITLE - title.length}
            </span>
          </div>
        </div>

        {/* ====== Conteúdo dinâmico por tipo ====== */}

        {/* --- DISCUSSÃO --- */}
        {type === 'discussion' && (
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sua dissertação</label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Escreva sua dissertação... (use **negrito**, *itálico*, > citação)"
              rows={8}
            />
            <p className="text-xs text-gray-400 mt-1">Sem limite de caracteres. Escreva livremente.</p>
          </div>
        )}

        {/* --- PERGUNTA --- */}
        {type === 'question' && (
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sua pergunta</label>
            <div className="relative">
              <input
                type="text"
                value={content}
                onChange={e => setContent(e.target.value.slice(0, MAX_QUESTION))}
                placeholder="Digite sua pergunta aqui..."
                className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-300 pr-16"
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${
                content.length >= MAX_QUESTION ? 'text-red-500' : 'text-gray-400'
              }`}>
                {MAX_QUESTION - content.length}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Máximo de {MAX_QUESTION} caracteres. Seja objetivo.</p>
          </div>
        )}

        {/* --- VOTAÇÃO --- */}
        {type === 'poll' && (
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Explicação ou pergunta da votação</label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Descreva o contexto da votação..."
              rows={4}
            />

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Alternativas
                <span className="text-xs text-gray-400 font-normal ml-2">Mínimo 2, máximo 10</span>
              </label>
              <div className="space-y-2">
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={e => updatePollOption(index, e.target.value)}
                      placeholder={`Alternativa ${index + 1}`}
                      className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-300"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePollOption(index)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                        title="Remover alternativa"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {pollOptions.length < 10 && (
                <button
                  type="button"
                  onClick={addPollOption}
                  className="mt-2 flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Adicionar alternativa
                </button>
              )}
            </div>
          </div>
        )}

        {/* --- IMAGEM --- */}
        {type === 'images' && (
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Explicação</label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Descreva o contexto da imagem..."
              rows={4}
            />

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Imagem</label>

              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition"
                >
                  <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                  <p className="text-sm text-gray-500">Clique para selecionar uma imagem</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG ou GIF (máx. 4MB)</p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-80 object-contain rounded-lg border border-gray-200 bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition shadow-lg"
                    title="Remover imagem"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* --- VÍDEO --- */}
        {type === 'video' && (
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Explicação</label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Descreva o contexto do vídeo..."
              rows={4}
            />

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Link do vídeo</label>
              <input
                type="url"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
                className="w-full bg-gray-100 rounded-lg px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-300 placeholder-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1">Cole o link do YouTube, Vimeo ou outra plataforma de vídeo.</p>

              {/* Preview do embed */}
              {videoEmbed && (
                <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                  <iframe
                    src={videoEmbed}
                    title="Preview do vídeo"
                    className="w-full aspect-video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {videoUrl && !videoEmbed && (
                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
                  <p className="font-medium">Link detectado</p>
                  <p className="text-xs mt-0.5">O vídeo será exibido como link externo. Para preview automático, use YouTube ou Vimeo.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====== Categoria & Tags ====== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
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
              placeholder="Use vírgulas para separar as tags"
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-300 placeholder-gray-400"
            />
            {allTags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {allTags.map(t => (
                  <button key={t.id} type="button"
                    onClick={() => {
                      const currentTags = tags ? tags.split(',').map(s => s.trim()) : [];
                      if (!currentTags.includes(t.name)) setTags([...currentTags, t.name].filter(Boolean).join(', '));
                    }}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded hover:bg-gray-200 transition">
                    + {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ====== Botões ====== */}
        <div className="flex items-center justify-end pt-3 border-t border-gray-100 mb-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-100 text-gray-600 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-red-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Publicando...' : 'Publicar Tópico'}
            </button>
          </div>
        </div>
      </form>

      {/* ====== Tópicos Relacionados ====== */}
      {(() => {
        const userTagList = tags ? tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [];
        const stopwords = ['como','para','que','com','por','das','dos','uma','uns','mais','entre','sobre','qual','quais','pode','deve','todas','todos','este','esta','esse','essa','novo','nova','são','tem','ser','ter','foi','sua','seu','ele','ela','nas','nos','sem','feito','fazer'];
        const titleWords = title.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .split(/\s+/)
          .filter(w => w.length >= 3 && !stopwords.includes(w));

        const scored = (allTopics || []).map(t => {
          let score = 0;
          // Pontuação por palavras-chave do título (peso 3 cada)
          if (titleWords.length > 0) {
            const topicTitle = t.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            for (const word of titleWords) {
              if (topicTitle.includes(word)) score += 3;
            }
          }
          // Pontuação por tags em comum (peso 2 cada)
          if (userTagList.length > 0 && t.tags?.length > 0) {
            for (const tag of t.tags) {
              if (userTagList.includes(tag.toLowerCase())) score += 2;
            }
          }
          // Pontuação por mesma categoria (peso 1)
          if (categoryId && String(t.category_id) === String(categoryId)) score += 1;
          return { ...t, score };
        }).filter(t => t.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 8);

        const relatedTopics = scored;

        if (relatedTopics.length === 0) return null;

        return (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-gray-700">
                Tópicos relacionados que podem ser interessantes
              </p>
              <span className="text-xs text-gray-400">— Verifique se sua dúvida já foi respondida</span>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="flex items-center py-2.5 px-4 text-xs text-gray-500 font-medium uppercase tracking-wider border-b border-gray-200 bg-gray-50">
                <div className="flex-1">Tópico</div>
                <div className="w-28 text-center hidden md:block">Categoria</div>
                <div className="w-20 text-center font-bold text-gray-700">Respostas</div>
                <div className="w-24 text-center hidden sm:block">Visualizações</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-50">
                {relatedTopics.map(topic => (
                  <div key={topic.id} className="flex items-center py-3 px-4 hover:bg-gray-50 transition">
                    <div className="mr-3 flex-shrink-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: getAvatarColor(topic.username) }}
                      >
                        {topic.username[0].toUpperCase()}
                      </div>
                    </div>
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
                      {topic.tags?.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {topic.tags.map(tag => (
                            <span key={tag} className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-sm font-medium">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="w-28 text-center hidden md:flex justify-center">
                      <span
                        className="text-xs text-white px-2.5 py-1 rounded-sm font-medium truncate"
                        style={{ backgroundColor: topic.category_color }}
                      >
                        {topic.category_name}
                      </span>
                    </div>
                    <div className="w-20 text-center text-sm font-bold text-gray-800">{topic.reply_count}</div>
                    <div className="w-24 text-center text-sm text-gray-500 hidden sm:block">{formatNumber(topic.views)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
