import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const d = new Date(dateStr + 'Z');
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d atrás`;
  return formatDate(dateStr);
}

const ROLE_LABELS = {
  user: 'Usuário',
  moderator: 'Moderador',
  admin: 'Admin',
};

const ROLE_STYLES = {
  user: 'bg-gray-100 text-gray-600',
  moderator: 'bg-blue-100 text-blue-700',
  admin: 'bg-yellow-100 text-yellow-700',
};

export default function Admin() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('moderation');

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'moderator') navigate('/');
  }, [user, navigate]);

  // ====== Usuarios (admin only) ======
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiFetch('/admin/users', {}, token),
    enabled: !!token && user?.role === 'admin',
  });

  // ====== Topicos pendentes (admin e moderador) ======
  const { data: pendingTopics, isLoading: pendingLoading, refetch: refetchPending } = useQuery({
    queryKey: ['admin-pending-topics'],
    queryFn: () => apiFetch('/admin/topics/pending', {}, token),
    enabled: !!token && (user?.role === 'admin' || user?.role === 'moderator'),
    refetchInterval: 15000,
  });

  async function handleBan(userId) {
    try { await apiFetch(`/admin/users/${userId}/ban`, { method: 'PUT' }, token); refetchUsers(); }
    catch (err) { alert(err.message); }
  }

  async function handleChangeRole(userId, newRole) {
    try {
      await apiFetch(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      }, token);
      refetchUsers();
    } catch (err) { alert(err.message); }
  }

  async function handleDelete(userId, username) {
    if (!window.confirm(`Tem certeza que deseja deletar o usuário "${username}"? Isso removerá todos os posts e dados.`)) return;
    try { await apiFetch(`/admin/users/${userId}`, { method: 'DELETE' }, token); refetchUsers(); }
    catch (err) { alert(err.message); }
  }

  async function handleApprove(topicId) {
    try {
      await apiFetch(`/admin/topics/${topicId}/approve`, { method: 'PUT' }, token);
      refetchPending();
    } catch (err) { alert(err.message); }
  }

  async function handleReject(topicId, title) {
    if (!window.confirm(`Tem certeza que deseja rejeitar o tópico "${title}"?`)) return;
    try {
      await apiFetch(`/admin/topics/${topicId}/reject`, { method: 'PUT' }, token);
      refetchPending();
    } catch (err) { alert(err.message); }
  }

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) return null;

  const pendingCount = pendingTopics?.length || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-800 mb-5">Administração</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition relative ${
            activeTab === 'moderation'
              ? 'bg-white border border-b-white border-gray-200 -mb-px text-gray-800'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Moderação
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-yellow-500 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>
        {user.role === 'admin' && (
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition ${
              activeTab === 'users'
                ? 'bg-white border border-b-white border-gray-200 -mb-px text-gray-800'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Usuários ({users?.length || 0})
          </button>
        )}
      </div>

      {/* ====== Aba Moderação ====== */}
      {activeTab === 'moderation' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tópicos Pendentes ({pendingCount})
            </span>
            {pendingCount === 0 && (
              <span className="text-xs text-green-600 font-medium">Nenhum tópico pendente</span>
            )}
          </div>

          {pendingLoading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Carregando...</div>
          ) : pendingCount === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-400">Todos os tópicos foram analisados</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingTopics.map(topic => (
                <div key={topic.id} className="p-5 hover:bg-gray-50 transition">
                  <div className="flex items-start gap-4">
                    {/* Info do tópico */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">
                          {topic.type === 'images' ? '📷 Imagem' : topic.type === 'video' ? '🎬 Vídeo' : topic.type}
                        </span>
                        <span
                          className="text-xs text-white px-2 py-0.5 rounded font-medium"
                          style={{ backgroundColor: topic.category_color }}
                        >
                          {topic.category_name}
                        </span>
                      </div>

                      <Link to={`/topic/${topic.id}`} className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition">
                        {topic.title}
                      </Link>

                      <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                        <span>por <Link to={`/user/${topic.user_id}`} className="font-medium text-gray-500 hover:text-blue-600">{topic.username}</Link></span>
                        <span>·</span>
                        <span>{timeAgo(topic.created_at)}</span>
                      </div>

                      {/* Preview do conteúdo */}
                      {topic.first_post_content && (
                        <p className="mt-2 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {topic.first_post_content.substring(0, 200)}{topic.first_post_content.length > 200 ? '...' : ''}
                        </p>
                      )}

                      {/* Preview da imagem */}
                      {topic.image_url && topic.image_url.startsWith('data:') && (
                        <div className="mt-2">
                          <img
                            src={topic.image_url}
                            alt="Preview"
                            className="max-h-32 rounded border border-gray-200 object-contain"
                          />
                        </div>
                      )}

                      {/* Preview do vídeo */}
                      {topic.video_url && (
                        <div className="mt-2 text-xs text-blue-500 truncate">
                          🔗 {topic.video_url}
                        </div>
                      )}
                    </div>

                    {/* Botões de ação */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(topic.id)}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition shadow-sm"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleReject(topic.id, topic.title)}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition shadow-sm"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Rejeitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====== Aba Usuários (admin only) ====== */}
      {activeTab === 'users' && user.role === 'admin' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Usuários ({users?.length || 0})
          </div>

          {usersLoading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Carregando...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-2.5">Usuário</th>
                  <th className="text-left px-5 py-2.5 hidden sm:table-cell">Email</th>
                  <th className="text-left px-5 py-2.5">Papel</th>
                  <th className="text-left px-5 py-2.5 hidden lg:table-cell">Categorias</th>
                  <th className="text-left px-5 py-2.5">Status</th>
                  <th className="text-left px-5 py-2.5 hidden sm:table-cell">Desde</th>
                  <th className="text-center px-5 py-2.5">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users?.map(u => (
                  <tr key={u.id} className={u.banned ? 'bg-red-50' : 'hover:bg-gray-50'}>
                    <td className="px-5 py-3">
                      <Link to={`/user/${u.id}`} className="flex items-center gap-2 hover:opacity-80 transition">
                        <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-xs">
                          {u.username[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800 hover:text-blue-600 transition">{u.username}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">{u.email}</td>
                    <td className="px-5 py-3">
                      {u.id !== user.id ? (
                        <select
                          value={u.role}
                          onChange={e => handleChangeRole(u.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded font-medium border-0 cursor-pointer outline-none ${ROLE_STYLES[u.role] || ROLE_STYLES.user}`}
                        >
                          <option value="user">Usuário</option>
                          <option value="moderator">Moderador</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${ROLE_STYLES[u.role]}`}>
                          {ROLE_LABELS[u.role]}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {u.categories?.length > 0 ? (
                          u.categories.map(cat => (
                            <span key={cat.id} className="text-[10px] font-medium text-white px-1.5 py-0.5 rounded-sm" style={{ backgroundColor: cat.color }}>
                              {cat.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${u.banned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {u.banned ? 'Banido' : 'Ativo'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 hidden sm:table-cell">{formatDate(u.created_at)}</td>
                    <td className="px-5 py-3">
                      {u.id !== user.id ? (
                        <div className="flex items-center justify-center gap-2">
                          {/* Ban/Unban toggle */}
                          <button
                            onClick={() => handleBan(u.id)}
                            title={u.banned ? 'Desbanir' : 'Banir'}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition ${
                              u.banned
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-orange-500 hover:bg-orange-50'
                            }`}
                          >
                            {u.banned ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            )}
                          </button>

                          {/* Delete (trash) */}
                          <button
                            onClick={() => handleDelete(u.id, u.username)}
                            title="Deletar usuário"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="text-xs text-gray-400">Você</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
