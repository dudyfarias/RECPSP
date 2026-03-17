import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import { getAvatarColor, timeAgo, formatNumber } from '../utils/formatters';
import { useState } from 'react';

const SORT_OPTIONS = [
  { key: 'new', label: 'Novos' },
  { key: 'top', label: 'Mais Curtidos' },
  { key: 'views', label: 'Mais Visualizados' },
  { key: 'replies', label: 'Mais Respondidos' },
];

export default function Home() {
  const { user, token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = searchParams.get('sort') || '';
  const categoryFilter = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [showGuestBanner, setShowGuestBanner] = useState(() => sessionStorage.getItem('guestBannerDismissed') !== 'true');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch('/categories'),
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['topics', sort, categoryFilter, page, !!token],
    queryFn: () => {
      const params = new URLSearchParams();
      if (sort) params.set('sort', sort);
      if (categoryFilter) params.set('category_id', categoryFilter);
      if (page > 1) params.set('page', page);
      const qs = params.toString();
      return apiFetch(`/topics${qs ? `?${qs}` : ''}`, {}, token);
    },
  });

  const topics = data?.topics;
  const totalPages = data?.totalPages || 1;

  function handleSort(newSort) {
    const params = new URLSearchParams(searchParams);
    if (newSort) params.set('sort', newSort);
    else params.delete('sort');
    params.delete('page');
    setSearchParams(params);
  }

  function handleCategoryChange(catId) {
    const params = new URLSearchParams(searchParams);
    if (catId) params.set('category', catId);
    else params.delete('category');
    params.delete('page');
    setSearchParams(params);
  }

  function handlePageChange(newPage) {
    const params = new URLSearchParams(searchParams);
    if (newPage > 1) params.set('page', newPage);
    else params.delete('page');
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleLock(topicId) {
    try {
      await apiFetch(`/topics/${topicId}/lock`, { method: 'PUT' }, token);
      refetch();
    } catch (err) { alert(err.message); }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-0">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mt-4 mb-2 px-4">
        <Link to="/" className="hover:text-blue-600">Início</Link>
        <span className="mx-2 text-gray-300">/</span>
        <span className="font-medium text-gray-700">Fórum</span>
      </div>

      {/* Barra de filtros */}
      <div className="flex items-center justify-between py-3 px-4 border-b border-gray-200 bg-white flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => handleSort(opt.key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition ${
                sort === opt.key
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <select
          value={categoryFilter}
          onChange={e => handleCategoryChange(e.target.value)}
          aria-label="Filtrar por categoria"
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-red-300"
        >
          <option value="">Todas as Categorias</option>
          {categories?.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Header da tabela */}
      <div className="flex items-center py-2.5 px-4 text-xs text-gray-500 font-medium uppercase tracking-wider border-b border-gray-200 bg-gray-50">
        <div className="flex-1">Tópico</div>
        <div className="w-28 text-right hidden md:block mr-4">Categoria</div>
        <div className="w-20 text-center font-bold text-gray-700 mr-4">Respostas</div>
        <div className="w-28 text-center hidden sm:block">Visualizações</div>
      </div>

      {/* Lista de tópicos */}
      <div className="divide-y divide-gray-100">
        {topics?.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            Nenhum tópico ainda. Seja o primeiro a criar!
          </div>
        )}

        {topics?.map((topic, i) => (
          <div key={topic.id}>
            {/* Banner de convidado - aparece depois do 5º tópico */}
            {i === 5 && !user && showGuestBanner && (
              <div className="flex items-center justify-between bg-gray-700 text-white px-5 py-3 -mx-0">
                <span className="text-sm font-bold">Parece que você é novo aqui. Registre-se de graça, aprenda e contribua!</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link to="/login" className="text-sm px-4 py-1.5 rounded border border-gray-400 hover:bg-gray-600 transition">
                    Entrar
                  </Link>
                  <Link to="/register" className="text-sm px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 transition font-medium">
                    Inscrever
                  </Link>
                  <button onClick={() => { sessionStorage.setItem('guestBannerDismissed', 'true'); setShowGuestBanner(false); }} aria-label="Fechar banner" className="text-gray-400 hover:text-white ml-1 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Linha do tópico */}
            <div className={`flex items-center py-3 px-4 hover:bg-gray-50 transition group ${
              topic.status === 'pending' ? 'opacity-70 bg-yellow-50/50' : ''
            }`}>
              {/* Avatar */}
              <div className="mr-3 flex-shrink-0">
                <Link to={`/user/${topic.user_id}`}>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm hover:opacity-80 transition"
                    style={{ backgroundColor: getAvatarColor(topic.username) }}
                  >
                    {topic.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                </Link>
              </div>

              {/* Título + tags */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {topic.pinned === 1 && <span className="text-gray-400 text-sm" title="Fixado">&#x1F4CC;</span>}
                  {topic.locked === 1 && (
                    user?.role === 'admin' ? (
                      <button onClick={() => handleLock(topic.id)} title="Desbloquear tópico" className="text-gray-400 hover:text-green-500 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </button>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" title="Bloqueado">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )
                  )}
                  {/* Admin lock button for unlocked topics */}
                  {topic.locked !== 1 && user?.role === 'admin' && (
                    <button onClick={() => handleLock(topic.id)} title="Bloquear tópico"
                      className="text-gray-200 hover:text-red-400 transition opacity-0 group-hover:opacity-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    </button>
                  )}
                  <Link
                    to={`/topic/${topic.id}`}
                    className={`font-medium text-sm hover:text-blue-600 transition truncate ${
                      topic.status === 'pending' ? 'text-gray-500' : 'text-gray-800'
                    }`}
                  >
                    {topic.title}
                  </Link>
                  {topic.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex-shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Em análise
                    </span>
                  )}
                </div>
                {topic.tags?.length > 0 && (
                  <div className="flex gap-1.5 mt-1">
                    {topic.tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Categoria badge */}
              <div className="w-28 hidden md:flex justify-end mr-4">
                <Link
                  to={`/category/${topic.category_id}`}
                  className="text-xs text-white px-2.5 py-1 rounded-sm font-medium truncate"
                  style={{ backgroundColor: topic.category_color }}
                >
                  {topic.category_name}
                </Link>
              </div>

              {/* Respostas */}
              <div className="w-20 text-center text-sm font-bold text-gray-800 mr-4">
                {topic.reply_count}
              </div>

              {/* Views */}
              <div className="w-28 text-center text-sm text-gray-500 hidden sm:block">
                {formatNumber(topic.views)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-200">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
              acc.push(p);
              return acc;
            }, [])
            .map((item, idx) =>
              item === '...' ? (
                <span key={`dot-${idx}`} className="px-2 text-gray-400 text-sm">...</span>
              ) : (
                <button
                  key={item}
                  onClick={() => handlePageChange(item)}
                  className={`w-8 h-8 text-sm rounded-lg transition ${
                    page === item
                      ? 'bg-red-500 text-white font-bold'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item}
                </button>
              )
            )}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Próximo
          </button>
        </div>
      )}
    </div>
  );
}
