import { Link } from 'react-router-dom';

const sections = [
  {
    title: 'Fórum',
    description: 'Discussões, dúvidas e troca de experiências sobre contratações públicas',
    to: '/forum',
    accent: '#FF161F',
    available: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
  },
  {
    title: 'Modelos de Documentos',
    description: 'Editais, termos de referência, contratos e outros modelos prontos',
    to: 'https://compras.sp.gov.br/agente-publico/toolkits-documentos-padronizados/',
    accent: '#034EA2',
    available: true,
    external: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Vade Mecum',
    description: 'Legislação atualizada sobre licitações e contratos administrativos',
    to: 'https://vademecum.lablogsp.org',
    accent: '#0B9247',
    available: true,
    external: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: 'Capacitação',
    description: 'Cursos, treinamentos e materiais para formação de agentes públicos',
    to: 'https://compras.sp.gov.br/agente-publico/capacitacao/',
    accent: '#233254',
    available: true,
    external: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
      </svg>
    ),
  },
];

function PortalCard({ section }) {
  const cardStyle = {
    borderTop: `3px solid ${section.accent}`,
    borderRadius: '8px',
  };
  const iconStyle = {
    backgroundColor: section.accent,
    color: '#ffffff',
  };

  const inner = (
    <div
      className="block h-full bg-white border border-gray-200 p-6 gov-card"
      style={cardStyle}
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className="inline-flex items-center justify-center w-9 h-9 flex-shrink-0"
          style={{ ...iconStyle, borderRadius: '6px' }}
        >
          {section.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-montserrat text-base font-bold text-gray-900 leading-snug">
            {section.title}
          </h2>
        </div>
      </div>
      <p className="text-sm text-gray-500 leading-relaxed mb-5">
        {section.description}
      </p>
      <div
        className="text-xs font-semibold transition-colors"
        style={{ color: section.accent }}
      >
        Acessar →
      </div>
    </div>
  );

  if (!section.available) {
    return (
      <div className="relative h-full opacity-60 cursor-not-allowed" style={{ borderRadius: '8px' }}>
        {inner}
        <span className="absolute top-4 right-4 text-xs font-semibold bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
          Em breve
        </span>
      </div>
    );
  }

  if (section.external) {
    return (
      <a href={section.to} target="_blank" rel="noopener noreferrer" className="block h-full">
        {inner}
      </a>
    );
  }

  return <Link to={section.to} className="block h-full">{inner}</Link>;
}

export default function Portal() {
  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-12 max-w-xl">
        <img
          src="/gif-recpsp.gif"
          alt="RECPSP — Rede Estadual de Compras Públicas de São Paulo"
          className="h-28 mx-auto mb-5"
        />

        <p className="text-sm text-gray-500 leading-relaxed">
          Plataforma integrada de apoio às contratações públicas do Estado de São Paulo.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl w-full">
        {sections.map(section => (
          <PortalCard key={section.title} section={section} />
        ))}
      </div>
    </div>
  );
}
