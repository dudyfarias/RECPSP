import { Link } from 'react-router-dom';

const sections = [
  {
    title: 'Fórum',
    description: 'Discussões, dúvidas e troca de experiências sobre contratações públicas',
    to: '/forum',
    color: 'from-orange-500 to-red-500',
    available: true,
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
  },
  {
    title: 'Modelos de Documentos',
    description: 'Editais, termos de referência, contratos e outros modelos prontos',
    to: '/documentos',
    color: 'from-blue-500 to-indigo-500',
    available: false,
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Vade Mecum',
    description: 'Legislação atualizada sobre licitações e contratos administrativos',
    to: '/vademecum',
    color: 'from-emerald-500 to-teal-500',
    available: false,
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: 'Capacitação',
    description: 'Cursos, treinamentos e materiais para formação de agentes públicos',
    to: '/capacitacao',
    color: 'from-purple-500 to-pink-500',
    available: false,
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
      </svg>
    ),
  },
];

export default function Portal() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-10 text-center">
        <img src="/logo-recpsp.svg" alt="RECPSP" className="h-24 mx-auto mb-4" />
        <p className="text-gray-500 text-sm max-w-md">Rede de Conhecimento em Contratações Públicas</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full">
        {sections.map((section) => (
          <div key={section.title} className="relative">
            {section.available ? (
              <Link
                to={section.to}
                className={`block bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group`}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${section.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {section.icon}
                </div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">{section.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{section.description}</p>
              </Link>
            ) : (
              <div className="block bg-white rounded-2xl border border-gray-200 p-8 opacity-60 cursor-not-allowed">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${section.color} text-white mb-4`}>
                  {section.icon}
                </div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">{section.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{section.description}</p>
                <span className="inline-block mt-3 text-xs font-semibold bg-gray-100 text-gray-400 px-3 py-1 rounded-full">Em breve</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
