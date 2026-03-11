import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

const ROLE_LABELS = {
  user: 'Usuario',
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

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/');
  }, [user, navigate]);

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiFetch('/admin/users', {}, token),
    enabled: !!token,
  });

  async function handleBan(userId) {
    try { await apiFetch(`/admin/users/${userId}/ban`, { method: 'PUT' }, token); refetch(); }
    catch (err) { alert(err.message); }
  }

  async function handleChangeRole(userId, newRole) {
    try {
      await apiFetch(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      }, token);
      refetch();
    } catch (err) { alert(err.message); }
  }

  async function handleDelete(userId, username) {
    if (!window.confirm(`Tem certeza que deseja deletar o usuario "${username}"? Isso removera todos os posts e dados.`)) return;
    try { await apiFetch(`/admin/users/${userId}`, { method: 'DELETE' }, token); refetch(); }
    catch (err) { alert(err.message); }
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-800 mb-5">Administracao</h1>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
          Usuarios ({users?.length || 0})
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-400 text-sm">Carregando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-5 py-2.5">Usuario</th>
                <th className="text-left px-5 py-2.5 hidden sm:table-cell">Email</th>
                <th className="text-left px-5 py-2.5">Papel</th>
                <th className="text-left px-5 py-2.5">Status</th>
                <th className="text-left px-5 py-2.5 hidden sm:table-cell">Desde</th>
                <th className="text-center px-5 py-2.5">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users?.map(u => (
                <tr key={u.id} className={u.banned ? 'bg-red-50' : 'hover:bg-gray-50'}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-xs">
                        {u.username[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">{u.email}</td>
                  <td className="px-5 py-3">
                    {u.id !== user.id ? (
                      <select
                        value={u.role}
                        onChange={e => handleChangeRole(u.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded font-medium border-0 cursor-pointer outline-none ${ROLE_STYLES[u.role] || ROLE_STYLES.user}`}
                      >
                        <option value="user">Usuario</option>
                        <option value="moderator">Moderador</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${ROLE_STYLES[u.role]}`}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    )}
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
                          title="Deletar usuario"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-xs text-gray-400">Voce</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
