export type DocumentCategory = 'Schemes & programmes' | 'Legislation' | 'Standards & guidelines' | 'Research & evidence';

export type LandDocument = {
  id: string;
  title: string;
  category: DocumentCategory;
  department: string;
  year: number;
  format: 'PDF' | 'DOCX' | 'Web';
  pages: number;
  updated: string;
  status: 'Verified' | 'Under review';
  summary: string;
};

export const initialStates = [
  { name: 'Maharashtra', code: 'MH', records: '18.4M', verified: 87, accent: 'bg-[#e9f0f5]' },
  { name: 'Karnataka', code: 'KA', records: '13.1M', verified: 82, accent: 'bg-[#edf3ed]' },
  { name: 'Odisha', code: 'OD', records: '9.7M', verified: 76, accent: 'bg-[#fff4e6]' },
  { name: 'Uttar Pradesh', code: 'UP', records: '41.8M', verified: 71, accent: 'bg-[#f1edf5]' },
];

export const documentCategories = [
  { label: 'Schemes & programmes', count: 184, key: 'Schemes & programmes' as DocumentCategory },
  { label: 'Legislation', count: 96, key: 'Legislation' as DocumentCategory },
  { label: 'Standards & guidelines', count: 72, key: 'Standards & guidelines' as DocumentCategory },
  { label: 'Research & evidence', count: 48, key: 'Research & evidence' as DocumentCategory },
];

export const documents: LandDocument[] = [
  {
    id: 'DOC-26019-001',
    title: 'SVAMITVA Scheme Resurvey Guidelines',
    category: 'Schemes & programmes',
    department: 'Department of Land Resources',
    year: 2024,
    format: 'PDF',
    pages: 48,
    updated: '18 Jun 2024',
    status: 'Verified',
    summary: 'Operational guidance for drone survey, property card generation and village-level verification.',
  },
  {
    id: 'DOC-26019-002',
    title: 'Maharashtra Land Revenue Code Amendment',
    category: 'Legislation',
    department: 'Revenue & Forest Department, Maharashtra',
    year: 2023,
    format: 'PDF',
    pages: 26,
    updated: '03 Apr 2024',
    status: 'Verified',
    summary: 'Annotated amendment record with sections relevant to mutation and cadastral record maintenance.',
  },
  {
    id: 'DOC-26019-003',
    title: 'Cadastral Geo-referencing Pilot',
    category: 'Research & evidence',
    department: 'National Informatics Centre',
    year: 2024,
    format: 'DOCX',
    pages: 34,
    updated: '27 May 2024',
    status: 'Under review',
    summary: 'Pilot findings from integrating legacy village maps with state reference coordinates.',
  },
  {
    id: 'DOC-26019-004',
    title: 'National Land Records Modernization Standards',
    category: 'Standards & guidelines',
    department: 'Department of Land Resources',
    year: 2022,
    format: 'Web',
    pages: 12,
    updated: '14 Nov 2023',
    status: 'Verified',
    summary: 'Minimum interoperability and metadata standards for state land records systems.',
  },
  {
    id: 'DOC-26019-005',
    title: 'Mutation Workflow: Model State Process',
    category: 'Standards & guidelines',
    department: 'Centre for Land Governance',
    year: 2023,
    format: 'PDF',
    pages: 19,
    updated: '08 Aug 2023',
    status: 'Verified',
    summary: 'Reference workflow covering registration triggers, notice periods, objections and final order.',
  },
];

export const activity = [
  { date: 'Today, 11:24', title: 'New document indexed', detail: 'SVAMITVA Scheme Resurvey Guidelines', type: 'Document' },
  { date: 'Yesterday, 16:10', title: 'Workspace export prepared', detail: 'Cadastral modernisation evidence brief', type: 'Workspace' },
  { date: '06 Jun 2024', title: 'State dataset refreshed', detail: 'Karnataka — village boundary layer', type: 'GIS' },
];