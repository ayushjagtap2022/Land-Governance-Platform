export type DocumentCategory = 'Schemes & programmes' | 'Legislation' | 'Standards & guidelines' | 'Research & evidence';
export type RepositoryRecordType = 'Policy Drafts' | 'Research Studies' | 'Acts / Gazettes' | 'Datasets';
export type RepositoryDocumentType = 'Policy Paper' | 'Legal Act' | 'Research Study' | 'Geodata File';
export type RepositoryVisibility = 'Public' | 'Confidential / Intra-Ministry';
export type AdministrativeLevel = 'National' | 'State' | 'District' | 'Tehsil/Taluk';

export type DocumentVersion = {
  label: string;
  date: string;
  detail: string;
  kind: 'Draft' | 'Amendment' | 'Gazette notification' | 'Published';
};

export type LandDocument = {
  id: string;
  refId: string;
  title: string;
  category: DocumentCategory;
  recordType: RepositoryRecordType;
  documentType: RepositoryDocumentType;
  department: string;
  stateRegion: string;
  administrativeLevel: AdministrativeLevel;
  theme: string;
  year: number;
  published: string;
  version: string;
  visibility: RepositoryVisibility;
  versions: DocumentVersion[];
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
    refId: 'DoLR-2024-DOC-108',
    title: 'SVAMITVA Scheme Resurvey Guidelines',
    category: 'Schemes & programmes',
    recordType: 'Policy Drafts',
    documentType: 'Policy Paper',
    department: 'Department of Land Resources',
    stateRegion: 'All India',
    administrativeLevel: 'National',
    theme: 'SVAMITVA Scheme',
    year: 2024,
    published: '18 Jun 2024',
    version: 'v1.3',
    visibility: 'Public',
    versions: [
      { label: 'v1.3 · Published', date: '18 Jun 2024', detail: 'Final resurvey guidance issued for participating states.', kind: 'Published' },
      { label: 'v1.2 · Amendment', date: '04 May 2024', detail: 'Added village-level verification and dispute escalation notes.', kind: 'Amendment' },
      { label: 'v1.0 · Draft', date: '11 Feb 2024', detail: 'Initial inter-departmental working draft.', kind: 'Draft' },
    ],
    format: 'PDF',
    pages: 48,
    updated: '18 Jun 2024',
    status: 'Verified',
    summary: 'Operational guidance for drone survey, property card generation and village-level verification.',
  },
  {
    id: 'DOC-26019-002',
    refId: 'MH-REV-2023-GAZ-044',
    title: 'Maharashtra Land Revenue Code Amendment',
    category: 'Legislation',
    recordType: 'Acts / Gazettes',
    documentType: 'Legal Act',
    department: 'Revenue & Forest Department, Maharashtra',
    stateRegion: 'Maharashtra',
    administrativeLevel: 'State',
    theme: 'Tenancy Rights',
    year: 2023,
    published: '03 Apr 2024',
    version: 'v2.0',
    visibility: 'Public',
    versions: [
      { label: 'v2.0 · Gazette notification', date: '03 Apr 2024', detail: 'Amendment published in the Maharashtra Government Gazette.', kind: 'Gazette notification' },
      { label: 'v1.1 · Amendment', date: '14 Dec 2023', detail: 'Committee recommendations incorporated into the draft schedule.', kind: 'Amendment' },
      { label: 'v1.0 · Draft', date: '26 Sep 2023', detail: 'State department consultation copy.', kind: 'Draft' },
    ],
    format: 'PDF',
    pages: 26,
    updated: '03 Apr 2024',
    status: 'Verified',
    summary: 'Annotated amendment record with sections relevant to mutation and cadastral record maintenance.',
  },
  {
    id: 'DOC-26019-003',
    refId: 'NIC-2024-RSR-019',
    title: 'Cadastral Geo-referencing Pilot',
    category: 'Research & evidence',
    recordType: 'Research Studies',
    documentType: 'Research Study',
    department: 'National Informatics Centre',
    stateRegion: 'Madhya Pradesh',
    administrativeLevel: 'District',
    theme: 'Cadastral Mapping',
    year: 2024,
    published: '27 May 2024',
    version: 'v0.9',
    visibility: 'Confidential / Intra-Ministry',
    versions: [
      { label: 'v0.9 · Draft', date: '27 May 2024', detail: 'Pilot findings circulated for technical review.', kind: 'Draft' },
      { label: 'v0.7 · Amendment', date: '09 Apr 2024', detail: 'Added reference-coordinate quality checks.', kind: 'Amendment' },
      { label: 'v0.1 · Draft', date: '16 Jan 2024', detail: 'Baseline pilot design and district sampling plan.', kind: 'Draft' },
    ],
    format: 'DOCX',
    pages: 34,
    updated: '27 May 2024',
    status: 'Under review',
    summary: 'Pilot findings from integrating legacy village maps with state reference coordinates.',
  },
  {
    id: 'DOC-26019-004',
    refId: 'DoLR-2022-STD-031',
    title: 'National Land Records Modernization Standards',
    category: 'Standards & guidelines',
    recordType: 'Datasets',
    documentType: 'Geodata File',
    department: 'Department of Land Resources',
    stateRegion: 'All India',
    administrativeLevel: 'National',
    theme: 'Cadastral Mapping',
    year: 2022,
    published: '14 Nov 2022',
    version: 'v3.1',
    visibility: 'Public',
    versions: [
      { label: 'v3.1 · Published', date: '14 Nov 2022', detail: 'Current interoperability and metadata standard.', kind: 'Published' },
      { label: 'v3.0 · Amendment', date: '08 Aug 2022', detail: 'Added minimum geodata exchange fields.', kind: 'Amendment' },
      { label: 'v2.0 · Gazette notification', date: '12 Mar 2021', detail: 'National standard notified for state adoption.', kind: 'Gazette notification' },
    ],
    format: 'Web',
    pages: 12,
    updated: '14 Nov 2023',
    status: 'Verified',
    summary: 'Minimum interoperability and metadata standards for state land records systems.',
  },
  {
    id: 'DOC-26019-005',
    refId: 'CLG-2023-POL-067',
    title: 'Mutation Workflow: Model State Process',
    category: 'Standards & guidelines',
    recordType: 'Policy Drafts',
    documentType: 'Policy Paper',
    department: 'Centre for Land Governance',
    stateRegion: 'Uttar Pradesh',
    administrativeLevel: 'State',
    theme: 'Land Dispute Resolution',
    year: 2023,
    published: '08 Aug 2023',
    version: 'v1.1',
    visibility: 'Confidential / Intra-Ministry',
    versions: [
      { label: 'v1.1 · Amendment', date: '08 Aug 2023', detail: 'Updated notice period and objection handling sequence.', kind: 'Amendment' },
      { label: 'v1.0 · Draft', date: '22 Jun 2023', detail: 'Model workflow for state consultation.', kind: 'Draft' },
    ],
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