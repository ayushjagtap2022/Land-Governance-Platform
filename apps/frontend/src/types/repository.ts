export type DocumentCategory = 'Schemes & programmes' | 'Legislation' | 'Standards & guidelines' | 'Research & evidence' | 'Case Studies';
export type RepositoryRecordType = 'Policy Drafts' | 'Research Studies' | 'Acts / Gazettes' | 'Datasets' | 'Field Case Studies';
export type RepositoryDocumentType = 'Policy Paper' | 'Legal Act' | 'Research Study' | 'Geodata File' | 'Case Study Report';
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
  sha256?: string;
};
