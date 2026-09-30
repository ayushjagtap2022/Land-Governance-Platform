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
  {
    id: 'DOC-26019-006',
    refId: 'CHD-REV-2024-001',
    title: 'Chandigarh UT Urban Land Records & Tenancy Harmonization Framework',
    category: 'Standards & guidelines',
    recordType: 'Policy Drafts',
    documentType: 'Policy Paper',
    department: 'Department of Revenue, Chandigarh Administration',
    stateRegion: 'Chandigarh',
    administrativeLevel: 'District',
    theme: 'Cadastral Mapping',
    year: 2024,
    published: '15 Feb 2024',
    version: 'v1.1',
    visibility: 'Public',
    versions: [
      { label: 'v1.1 · Published', date: '15 Feb 2024', detail: 'Notified technical standard for Chandigarh UT urban land records and title validation.', kind: 'Published' },
    ],
    format: 'PDF',
    pages: 38,
    updated: '10 Aug 2024',
    status: 'Verified',
    summary: 'Comprehensive statutory framework for digital land records, urban title verification, cadastral modernization, and tenancy protections in Chandigarh Union Territory.',
  },
  {
    id: 'DOC-26019-007',
    refId: 'RFCTLARR-2013-001',
    title: 'Right to Fair Compensation & Transparency in Land Acquisition (RFCTLARR 2013)',
    category: 'Legislation',
    recordType: 'Acts / Gazettes',
    documentType: 'Legal Act',
    department: 'Ministry of Rural Development',
    stateRegion: 'All India',
    administrativeLevel: 'National',
    theme: 'Land Dispute Resolution',
    year: 2023,
    published: '14 Oct 2023',
    version: 'v2.4',
    visibility: 'Public',
    versions: [
      { label: 'v2.4 · Gazette notification', date: '14 Oct 2023', detail: 'Consolidated national standard with statutory dispute compensation scales.', kind: 'Gazette notification' },
    ],
    format: 'PDF',
    pages: 78,
    updated: '05 Jan 2024',
    status: 'Verified',
    summary: 'National legal statutory framework regulating land acquisition, social impact assessment, fair compensation, and mandatory rehabilitation & resettlement across India.',
  },
  {
    id: 'DOC-26019-008',
    refId: 'PB-REV-2024-005',
    title: 'Punjab Land Revenue (Digitization of Jamabandi & Cadastral Resurvey) Guidelines',
    category: 'Legislation',
    recordType: 'Acts / Gazettes',
    documentType: 'Legal Act',
    department: 'Department of Revenue & Rehabilitation, Punjab',
    stateRegion: 'Punjab',
    administrativeLevel: 'State',
    theme: 'Cadastral Mapping',
    year: 2024,
    published: '28 Mar 2024',
    version: 'v2.0',
    visibility: 'Public',
    versions: [
      { label: 'v2.0 · Gazette notification', date: '28 Mar 2024', detail: 'Rules for digital Jamabandi and sub-registrar integration.', kind: 'Gazette notification' },
    ],
    format: 'PDF',
    pages: 56,
    updated: '04 Jul 2024',
    status: 'Verified',
    summary: 'Statutory rules for digitizing Jamabandi (RoR) records, drone cadastral survey integration, and sub-registrar deed registration linkage.',
  },
];

export const activity = [
  { date: 'Today, 11:24', title: 'New document indexed', detail: 'SVAMITVA Scheme Resurvey Guidelines', type: 'Document' },
  { date: 'Yesterday, 16:10', title: 'Workspace export prepared', detail: 'Cadastral modernisation evidence brief', type: 'Workspace' },
  { date: '06 Jun 2024', title: 'State dataset refreshed', detail: 'Karnataka — village boundary layer', type: 'GIS' },
];

export const analyticsTrendData = [
  { year: '2019', output: 120, compliance: 65, agricultural: 85, nonAgricultural: 15, forest: 45, pending: 8000, resolved: 5000, target: 40, achieved: 35 },
  { year: '2020', output: 145, compliance: 68, agricultural: 82, nonAgricultural: 18, forest: 44, pending: 8500, resolved: 6000, target: 50, achieved: 48 },
  { year: '2021', output: 180, compliance: 74, agricultural: 78, nonAgricultural: 22, forest: 43, pending: 9200, resolved: 7500, target: 65, achieved: 62 },
  { year: '2022', output: 210, compliance: 78, agricultural: 75, nonAgricultural: 25, forest: 43, pending: 9500, resolved: 8800, target: 80, achieved: 75 },
  { year: '2023', output: 250, compliance: 85, agricultural: 71, nonAgricultural: 29, forest: 42, pending: 8900, resolved: 10500, target: 95, achieved: 92 },
  { year: '2024', output: 290, compliance: 91, agricultural: 68, nonAgricultural: 32, forest: 42, pending: 7500, resolved: 12000, target: 110, achieved: 108 },
];

export const climateRadarData = [
  { subject: 'Drought Risk', A: 85, B: 65, fullMark: 100 },
  { subject: 'Flood Zone', A: 40, B: 75, fullMark: 100 },
  { subject: 'Soil Degradation', A: 60, B: 55, fullMark: 100 },
  { subject: 'Water Scarcity', A: 90, B: 70, fullMark: 100 },
  { subject: 'Vegetation Loss', A: 55, B: 45, fullMark: 100 },
];

export const comparativeStateData = [
  { category: 'Title Suits Pending', 'Maharashtra': 14200, 'Madhya Pradesh': 18500 },
  { category: 'Boundary Disputes', 'Maharashtra': 8500, 'Madhya Pradesh': 12100 },
  { category: 'Inheritance Claims', 'Maharashtra': 6300, 'Madhya Pradesh': 9800 },
  { category: 'Digitization (%)', 'Maharashtra': 88, 'Madhya Pradesh': 72 },
  { category: 'Geo-referencing (%)', 'Maharashtra': 76, 'Madhya Pradesh': 58 },
];