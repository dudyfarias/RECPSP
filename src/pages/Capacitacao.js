import { useState } from 'react';
import { Link } from 'react-router-dom';

const PORTAL_OFICIAL = 'https://compras.sp.gov.br/agente-publico/capacitacao/';

const indicadores = [
  {
    valor: '42',
    label: 'Cursos disponíveis',
    color: '#FF161F',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    ),
  },
  {
    valor: '8',
    label: 'Trilhas de aprendizagem',
    color: '#034EA2',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    ),
  },
  {
    valor: '9',
    label: 'Eventos previstos',
    color: '#0B9247',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
  },
  {
    valor: '120',
    label: 'Materiais de apoio',
    color: '#4297D3',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
  },
  {
    valor: '7',
    label: 'Instituições parceiras',
    color: '#233254',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    ),
  },
];

const cursos = [
  { titulo: 'Lei nº 14.133/2021', tema: 'Legislação', carga: '40h', modalidade: 'EAD', instituicao: 'ENAP', accent: '#FF161F' },
  { titulo: 'Plano de Contratações Anual (PCA)', tema: 'Planejamento', carga: '20h', modalidade: 'EAD', instituicao: 'Escola Virtual.Gov', accent: '#034EA2' },
  { titulo: 'Estudo Técnico Preliminar', tema: 'Planejamento', carga: '15h', modalidade: 'EAD', instituicao: 'ENAP', accent: '#0B9247' },
  { titulo: 'Termo de Referência', tema: 'Instrução Processual', carga: '20h', modalidade: 'EAD', instituicao: 'Escola Virtual.Gov', accent: '#233254' },
  { titulo: 'Pesquisa de Preços', tema: 'Instrução Processual', carga: '12h', modalidade: 'EAD', instituicao: 'ENAP', accent: '#4297D3' },
  { titulo: 'Gestão Contratual', tema: 'Gestão de Contratos', carga: '30h', modalidade: 'Híbrido', instituicao: 'TCE-SP', accent: '#94AA5A' },
  { titulo: 'Sanções Administrativas', tema: 'Gestão de Contratos', carga: '16h', modalidade: 'EAD', instituicao: 'ENAP', accent: '#FF161F' },
  { titulo: 'Compras Sustentáveis', tema: 'Sustentabilidade', carga: '12h', modalidade: 'EAD', instituicao: 'Escola Virtual.Gov', accent: '#0B9247' },
  { titulo: 'Inteligência Artificial aplicada às Contratações', tema: 'Inovação', carga: '8h', modalidade: 'Online ao vivo', instituicao: 'Prodesp', accent: '#034EA2' },
  { titulo: 'Linguagem Simples', tema: 'Comunicação', carga: '6h', modalidade: 'EAD', instituicao: 'Escola Virtual.Gov', accent: '#4297D3' },
];

const trilhas = [
  {
    id: 'agente-contratacao',
    titulo: 'Agente de Contratação',
    descricao: 'Formação completa para conduzir todas as etapas do processo de contratação sob a Nova Lei de Licitações.',
    nivel: 'Intermediário',
    carga: '90h',
    accent: '#FF161F',
    jornada: [
      'Fundamentos da Lei nº 14.133/2021',
      'Planejamento da contratação',
      'Estudo Técnico Preliminar',
      'Termo de Referência',
      'Pesquisa de Preços',
      'Gestão de Riscos',
      'Seleção do fornecedor',
      'Gestão e fiscalização contratual',
    ],
  },
  {
    id: 'pregoeiro',
    titulo: 'Pregoeiro',
    descricao: 'Domine a condução do pregão eletrônico, do edital à adjudicação, com segurança jurídica.',
    nivel: 'Intermediário',
    carga: '70h',
    accent: '#034EA2',
    jornada: [
      'Fundamentos da Lei nº 14.133/2021',
      'Modalidade Pregão na prática',
      'Elaboração do edital',
      'Condução da sessão pública (PNCP)',
      'Julgamento e classificação de propostas',
      'Habilitação e diligências',
      'Recursos, adjudicação e homologação',
    ],
  },
  {
    id: 'equipe-planejamento',
    titulo: 'Equipe de Planejamento',
    descricao: 'Estruture a fase de planejamento das contratações, do PCA ao Termo de Referência.',
    nivel: 'Introdutório',
    carga: '55h',
    accent: '#0B9247',
    jornada: [
      'Plano de Contratações Anual (PCA)',
      'Levantamento de necessidades',
      'Estudo Técnico Preliminar',
      'Mapa de Riscos',
      'Termo de Referência',
      'Pesquisa de Preços',
    ],
  },
  {
    id: 'gestor-contratos',
    titulo: 'Gestor de Contratos',
    descricao: 'Coordene a execução contratual, alterações, reequilíbrio e encerramento com governança.',
    nivel: 'Avançado',
    carga: '65h',
    accent: '#233254',
    jornada: [
      'Fundamentos da gestão contratual',
      'Acompanhamento da execução',
      'Alterações contratuais e aditivos',
      'Reequilíbrio econômico-financeiro',
      'Sanções administrativas',
      'Encerramento e prestação de contas',
    ],
  },
  {
    id: 'fiscal-contratos',
    titulo: 'Fiscal de Contratos',
    descricao: 'Atue na fiscalização técnica e administrativa da execução dos contratos administrativos.',
    nivel: 'Intermediário',
    carga: '50h',
    accent: '#4297D3',
    jornada: [
      'Papel do fiscal de contratos',
      'Fiscalização técnica e administrativa',
      'Registro de ocorrências',
      'Medição e ateste',
      'Gestão de Riscos na execução',
      'Aplicação de penalidades',
    ],
  },
  {
    id: 'servidor-municipal',
    titulo: 'Servidor Municipal',
    descricao: 'Primeiros passos nas contratações públicas para servidores de municípios.',
    nivel: 'Introdutório',
    carga: '40h',
    accent: '#94AA5A',
    jornada: [
      'Introdução às contratações públicas',
      'Fundamentos da Lei nº 14.133/2021',
      'Governança nas contratações',
      'Linguagem Simples no serviço público',
      'Ética e integridade',
    ],
  },
  {
    id: 'gestor-publico',
    titulo: 'Gestor Público',
    descricao: 'Visão estratégica de governança, riscos e resultados nas contratações públicas.',
    nivel: 'Avançado',
    carga: '60h',
    accent: '#FF161F',
    jornada: [
      'Governança e liderança nas contratações',
      'Planejamento estratégico de compras',
      'Gestão de riscos institucional',
      'Controle e transparência',
      'Indicadores e gestão por resultados',
      'Inovação e IA nas contratações',
    ],
  },
  {
    id: 'compras-sustentaveis',
    titulo: 'Compras Sustentáveis',
    descricao: 'Incorpore critérios ESG e sustentabilidade ao ciclo das contratações públicas.',
    nivel: 'Intermediário',
    carga: '35h',
    accent: '#0B9247',
    jornada: [
      'Fundamentos das compras sustentáveis',
      'Critérios ESG em licitações',
      'Especificações e rótulos ambientais',
      'Ciclo de vida e economia circular',
      'Boas práticas e casos de sucesso',
    ],
  },
];

const eventos = [
  {
    nome: 'II Fórum de Contratações Públicas',
    formato: 'Presencial',
    data: '14 de agosto de 2026',
    instituicao: 'RECPSP',
    descricao: 'Painéis e debates sobre os avanços da Nova Lei de Licitações e as boas práticas da Rede.',
    accent: '#FF161F',
  },
  {
    nome: 'Oficina de Linguagem Simples nas Contratações Públicas',
    formato: 'Online',
    data: '3 de setembro de 2026',
    instituicao: 'LILP',
    descricao: 'Oficina prática para tornar editais e documentos mais claros e acessíveis à sociedade.',
    accent: '#034EA2',
  },
  {
    nome: 'Workshop de IA aplicada às Compras Públicas',
    formato: 'Híbrido',
    data: '22 de setembro de 2026',
    instituicao: 'RECPSP · Prodesp',
    descricao: 'Casos de uso, ferramentas e limites da inteligência artificial nas contratações.',
    accent: '#233254',
  },
  {
    nome: 'Seminário de Sustentabilidade nas Contratações',
    formato: 'Presencial',
    data: '8 de outubro de 2026',
    instituicao: 'Secretaria de Meio Ambiente',
    descricao: 'Critérios ESG, economia circular e experiências de sustentabilidade no setor público.',
    accent: '#0B9247',
  },
  {
    nome: 'Encontro da Rede Estadual de Compras Públicas',
    formato: 'Híbrido',
    data: '29 de outubro de 2026',
    instituicao: 'RECPSP',
    descricao: 'Encontro anual da Rede para troca de experiências e alinhamento da agenda estadual.',
    accent: '#4297D3',
  },
];

const materiais = [
  { tipo: 'Guia', titulo: 'Guia prático da Lei nº 14.133/2021', tema: 'Legislação', descricao: 'Referência sobre os principais dispositivos e mudanças da Nova Lei de Licitações.', accent: '#FF161F' },
  { tipo: 'Checklist', titulo: 'Checklist para Estudo Técnico Preliminar', tema: 'Planejamento', descricao: 'Passo a passo para elaborar um ETP consistente e bem fundamentado.', accent: '#034EA2' },
  { tipo: 'Modelo', titulo: 'Modelo de Termo de Referência', tema: 'Instrução Processual', descricao: 'Modelo editável para estruturar o Termo de Referência da contratação.', accent: '#0B9247' },
  { tipo: 'Cartilha', titulo: 'Cartilha de Pesquisa de Preços', tema: 'Instrução Processual', descricao: 'Orientações práticas para conduzir a pesquisa de preços com segurança.', accent: '#4297D3' },
  { tipo: 'Guia', titulo: 'Guia de Gestão e Fiscalização Contratual', tema: 'Gestão de Contratos', descricao: 'Boas práticas de acompanhamento, fiscalização e aplicação de sanções.', accent: '#233254' },
  { tipo: 'Manual', titulo: 'Manual de Compras Sustentáveis', tema: 'Sustentabilidade', descricao: 'Critérios e exemplos para inserir sustentabilidade nas compras públicas.', accent: '#0B9247' },
  { tipo: 'Apresentação', titulo: 'Apresentação sobre PCA', tema: 'Planejamento', descricao: 'Slides sobre a elaboração e o acompanhamento do Plano de Contratações Anual.', accent: '#94AA5A' },
  { tipo: 'Webinar', titulo: 'Webinar sobre IA aplicada às Contratações', tema: 'Inovação', descricao: 'Gravação com casos de uso de IA nas contratações e os cuidados necessários.', accent: '#034EA2' },
];

function Icon({ children, className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
      {children}
    </svg>
  );
}

function StatTile({ item, index }) {
  return (
    <div
      className="gov-card gov-reveal bg-white border border-gray-200 rounded-lg px-4 py-5 flex flex-col items-center text-center"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
        style={{ backgroundColor: `${item.color}14`, color: item.color }}
      >
        <Icon className="w-5 h-5">{item.icon}</Icon>
      </div>
      <div className="font-montserrat text-2xl font-bold text-gray-900 leading-none">{item.valor}</div>
      <div className="text-xs text-gray-500 mt-1.5 leading-snug">{item.label}</div>
    </div>
  );
}

function CourseCard({ curso, index }) {
  return (
    <div
      className="gov-card gov-reveal bg-white border border-gray-200 flex flex-col"
      style={{ borderTop: `3px solid ${curso.accent}`, borderRadius: '8px', animationDelay: `${index * 50}ms` }}
    >
      <div className="p-5 flex flex-col flex-1">
        <span
          className="self-start text-[11px] font-semibold px-2 py-0.5 rounded-full mb-3"
          style={{ backgroundColor: `${curso.accent}14`, color: curso.accent }}
        >
          {curso.tema}
        </span>

        <h3 className="font-montserrat text-base font-bold text-gray-900 leading-snug mb-4">
          {curso.titulo}
        </h3>

        <div className="mt-auto space-y-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-gray-400 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </Icon>
            <span>{curso.carga} de carga horária</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-gray-400 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </Icon>
            <span>{curso.modalidade}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-gray-400 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </Icon>
            <span>{curso.instituicao}</span>
          </div>
        </div>
      </div>

      <a
        href={PORTAL_OFICIAL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm font-semibold transition-colors hover:bg-gray-50"
        style={{ color: curso.accent }}
      >
        Ver curso
        <Icon className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </Icon>
      </a>
    </div>
  );
}

const NIVEL_COLOR = {
  'Introdutório': '#0B9247',
  'Intermediário': '#034EA2',
  'Avançado': '#FF161F',
};

function NivelBadge({ nivel }) {
  const c = NIVEL_COLOR[nivel] || '#034EA2';
  return (
    <span
      className="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ backgroundColor: `${c}14`, color: c }}
    >
      {nivel}
    </span>
  );
}

function TrilhaCard({ trilha, index, isSelected, onSelect }) {
  return (
    <div
      className="gov-card gov-reveal bg-white border rounded-lg p-5 flex gap-4"
      style={{ animationDelay: `${index * 50}ms`, borderColor: isSelected ? trilha.accent : '#e5e7eb' }}
    >
      <div
        className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: trilha.accent, color: '#fff' }}
      >
        <Icon className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </Icon>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-montserrat text-base font-bold text-gray-900 leading-snug">{trilha.titulo}</h3>
          <NivelBadge nivel={trilha.nivel} />
        </div>
        <p className="text-sm text-gray-500 leading-relaxed mb-3">{trilha.descricao}</p>
        <div className="flex items-center gap-4 mb-3">
          <span className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700">{trilha.jornada.length}</span> cursos
          </span>
          <span className="w-px h-3 bg-gray-200" />
          <span className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700">{trilha.carga}</span> no total
          </span>
        </div>
        <button
          onClick={onSelect}
          aria-expanded={isSelected}
          className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
          style={{ color: trilha.accent }}
        >
          Ver trilha
          <Icon className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </Icon>
        </button>
      </div>
    </div>
  );
}

function TrilhaJornada({ trilha, onClose }) {
  return (
    <div
      id="jornada"
      className="mt-8 bg-white border border-gray-200 rounded-xl shadow-card p-6 sm:p-8 gov-reveal scroll-mt-24"
      style={{ borderTop: `3px solid ${trilha.accent}` }}
    >
      {/* Header da jornada */}
      <div className="flex items-start justify-between gap-4 mb-7">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: trilha.accent }}>
              Jornada da trilha
            </span>
            <NivelBadge nivel={trilha.nivel} />
          </div>
          <h3 className="font-montserrat text-xl sm:text-2xl font-bold text-gray-900 leading-snug">{trilha.titulo}</h3>
          <p className="text-xs text-gray-500 mt-1.5">
            {trilha.jornada.length} cursos · {trilha.carga} de carga horária total
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition p-1"
          aria-label="Fechar jornada"
        >
          <Icon className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </Icon>
        </button>
      </div>

      {/* Etapas numeradas com linha de progresso */}
      <ol className="relative">
        {trilha.jornada.map((step, i) => {
          const isLast = i === trilha.jornada.length - 1;
          return (
            <li key={i} className="relative pl-14 pb-4 last:pb-0">
              {!isLast && (
                <span
                  className="absolute left-[17px] top-10 bottom-0 w-0.5"
                  style={{ backgroundColor: '#E8EAF0' }}
                  aria-hidden="true"
                />
              )}
              <span
                className="absolute left-0 top-1 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: trilha.accent }}
              >
                {i + 1}
              </span>
              <div className="bg-[#F8F9FB] border border-gray-200 rounded-lg px-4 py-3">
                <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Etapa {i + 1}</div>
                <div className="text-sm font-medium text-gray-800 leading-snug">{step}</div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Rodapé da jornada */}
      <div className="mt-7 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-gray-500">
          Ao concluir todas as etapas, você finaliza a trilha <span className="font-semibold text-gray-700">{trilha.titulo}</span>.
        </p>
        <a
          href={PORTAL_OFICIAL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-white font-semibold px-4 py-2 rounded transition-opacity hover:opacity-90"
          style={{ backgroundColor: trilha.accent }}
        >
          Começar trilha
          <Icon className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </Icon>
        </a>
      </div>
    </div>
  );
}

const FORMATO_COLOR = {
  'Presencial': '#0B9247',
  'Online': '#034EA2',
  'Híbrido': '#233254',
};

function FormatoBadge({ formato }) {
  const c = FORMATO_COLOR[formato] || '#034EA2';
  return (
    <span
      className="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ backgroundColor: `${c}14`, color: c }}
    >
      {formato}
    </span>
  );
}

function EventoCard({ evento, index }) {
  return (
    <div
      className="gov-card gov-reveal bg-white border border-gray-200 flex flex-col"
      style={{ borderTop: `3px solid ${evento.accent}`, borderRadius: '8px', animationDelay: `${index * 50}ms` }}
    >
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <FormatoBadge formato={evento.formato} />
          <span className="text-xs text-gray-500 flex items-center gap-1.5">
            <Icon className="w-4 h-4 text-gray-400 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </Icon>
            {evento.data}
          </span>
        </div>
        <h3 className="font-montserrat text-base font-bold text-gray-900 leading-snug mb-2">{evento.nome}</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{evento.descricao}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Icon className="w-4 h-4 text-gray-400 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </Icon>
          {evento.instituicao}
        </div>
      </div>
      <a
        href={PORTAL_OFICIAL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm font-semibold transition-colors hover:bg-gray-50"
        style={{ color: evento.accent }}
      >
        Ver detalhes
        <Icon className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </Icon>
      </a>
    </div>
  );
}

const MATERIAL_ICON = {
  'Guia': <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
  'Manual': <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
  'Cartilha': <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
  'Checklist': <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
  'Modelo': <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  'Apresentação': <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
  'Webinar': <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />,
};

function MaterialCard({ material, index }) {
  return (
    <div
      className="gov-card gov-reveal bg-white border border-gray-200 rounded-lg p-5 flex flex-col"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${material.accent}14`, color: material.accent }}
        >
          <Icon className="w-5 h-5">{MATERIAL_ICON[material.tipo]}</Icon>
        </div>
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">{material.tipo}</div>
          <h3 className="font-montserrat text-sm font-bold text-gray-900 leading-snug">{material.titulo}</h3>
        </div>
      </div>
      <span
        className="self-start text-[11px] font-semibold px-2 py-0.5 rounded-full mb-3"
        style={{ backgroundColor: `${material.accent}14`, color: material.accent }}
      >
        {material.tema}
      </span>
      <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{material.descricao}</p>
      <a
        href={PORTAL_OFICIAL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
        style={{ color: material.accent }}
      >
        Acessar material
        <Icon className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 6H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </Icon>
      </a>
    </div>
  );
}

export default function Capacitacao() {
  const [selectedTrilha, setSelectedTrilha] = useState(null);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSelectTrilha = (id) => {
    setSelectedTrilha(id);
    setTimeout(() => scrollTo('jornada'), 60);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mt-4 mb-4 px-1">
        <Link to="/" className="hover:text-[#034EA2]">Início</Link>
        <span className="mx-2 text-gray-300">/</span>
        <span className="font-medium text-gray-700">Capacitação</span>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-white border border-gray-200 rounded-xl shadow-card px-6 sm:px-10 py-10 sm:py-12 mb-10 gov-reveal">
        {/* Decorative network motif */}
        <svg
          className="hidden md:block absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none"
          width="260" height="200" viewBox="0 0 260 200" fill="none" aria-hidden="true"
          style={{ opacity: 0.08 }}
        >
          <g stroke="#034EA2" strokeWidth="2">
            <line x1="40" y1="60" x2="120" y2="40" />
            <line x1="120" y1="40" x2="200" y2="70" />
            <line x1="120" y1="40" x2="150" y2="120" />
            <line x1="150" y1="120" x2="60" y2="150" />
            <line x1="150" y1="120" x2="220" y2="150" />
            <line x1="40" y1="60" x2="60" y2="150" />
          </g>
          <g fill="#034EA2">
            <circle cx="40" cy="60" r="8" /><circle cx="120" cy="40" r="10" />
            <circle cx="200" cy="70" r="7" /><circle cx="150" cy="120" r="9" />
            <circle cx="60" cy="150" r="7" /><circle cx="220" cy="150" r="6" />
          </g>
          <circle cx="120" cy="40" r="10" fill="#FF161F" />
        </svg>

        <div className="relative max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#034EA2' }}>
            Rede Estadual de Compras Públicas · SP
          </span>
          <h1 className="font-montserrat text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3 mb-4 leading-tight">
            Centro de Capacitação
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-7">
            Desenvolva suas competências em contratações públicas por meio de cursos, trilhas de
            aprendizagem, eventos e conteúdos produzidos pelas instituições parceiras da Rede
            Estadual de Compras Públicas de São Paulo.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => scrollTo('cursos')}
              className="text-sm text-white font-semibold px-5 py-2.5 rounded transition"
              style={{ backgroundColor: '#FF161F' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#CC111A')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FF161F')}
            >
              Explorar cursos
            </button>
            <button
              onClick={() => scrollTo('trilhas')}
              className="text-sm font-semibold px-5 py-2.5 rounded border transition"
              style={{ color: '#034EA2', borderColor: '#034EA2' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#034EA2'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#034EA2'; }}
            >
              Ver trilhas
            </button>
          </div>
        </div>
      </section>

      {/* Indicadores */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-14">
        {indicadores.map((item, i) => (
          <StatTile key={item.label} item={item} index={i} />
        ))}
      </section>

      {/* Cursos em destaque */}
      <section id="cursos" className="mb-16 scroll-mt-24">
        <div className="mb-6">
          <h2 className="font-montserrat text-2xl font-bold text-gray-900">Cursos em destaque</h2>
          <p className="text-sm text-gray-500 mt-1">
            Formações selecionadas para agentes públicos que atuam em contratações.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cursos.map((curso, i) => (
            <CourseCard key={curso.titulo} curso={curso} index={i} />
          ))}
        </div>
      </section>

      {/* Trilhas de aprendizagem */}
      <section id="trilhas" className="mb-16 scroll-mt-24">
        <div className="mb-6">
          <h2 className="font-montserrat text-2xl font-bold text-gray-900">Trilhas de aprendizagem</h2>
          <p className="text-sm text-gray-500 mt-1">
            Percursos organizados por perfil profissional. Escolha o seu e visualize a jornada completa.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {trilhas.map((trilha, i) => (
            <TrilhaCard
              key={trilha.id}
              trilha={trilha}
              index={i}
              isSelected={selectedTrilha === trilha.id}
              onSelect={() => handleSelectTrilha(trilha.id)}
            />
          ))}
        </div>

        {selectedTrilha && (
          <TrilhaJornada
            trilha={trilhas.find((t) => t.id === selectedTrilha)}
            onClose={() => setSelectedTrilha(null)}
          />
        )}
      </section>

      {/* Próximos Eventos */}
      <section id="eventos" className="mb-16 scroll-mt-24">
        <div className="mb-6">
          <h2 className="font-montserrat text-2xl font-bold text-gray-900">Próximos eventos</h2>
          <p className="text-sm text-gray-500 mt-1">
            Fóruns, oficinas e encontros promovidos pela Rede e por instituições parceiras.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {eventos.map((evento, i) => (
            <EventoCard key={evento.nome} evento={evento} index={i} />
          ))}
        </div>
      </section>

      {/* Materiais de Apoio */}
      <section id="materiais" className="mb-16 scroll-mt-24">
        <div className="mb-6">
          <h2 className="font-montserrat text-2xl font-bold text-gray-900">Materiais de apoio</h2>
          <p className="text-sm text-gray-500 mt-1">
            Guias, modelos e conteúdos complementares para o dia a dia das contratações.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {materiais.map((material, i) => (
            <MaterialCard key={material.titulo} material={material} index={i} />
          ))}
        </div>
      </section>

      {/* CTA Portal oficial */}
      <section
        className="rounded-xl px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
        style={{ backgroundColor: '#233254' }}
      >
        <div className="max-w-xl">
          <h3 className="font-montserrat text-lg font-bold text-white mb-1.5">
            Portal oficial de Capacitação
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: '#9aa8c4' }}>
            Acesse o catálogo completo de cursos e certificações no portal do Governo do Estado de São Paulo.
          </p>
        </div>
        <a
          href={PORTAL_OFICIAL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded bg-white transition-colors hover:bg-gray-100"
          style={{ color: '#233254' }}
        >
          Acessar portal
          <Icon className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </Icon>
        </a>
      </section>
    </div>
  );
}
