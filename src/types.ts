export type Gender = 'Male' | 'Female';
export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';
export type JobMode = 'On-site' | 'Remote' | 'Hybrid';

// ============= USER ROLES & DISCRIMINATED UNIONS =============
export type UserRole = 'candidate' | 'staff' | 'admin' | 'client';
export type StaffRole = 'admin' | 'recruiter' | 'agent';
export type ApplicationStatus = 'Screening' | 'Interview' | 'Offered' | 'Placed' | 'Rejected' | 'Withdrawn';
export type UpdateType = 'Vacancy' | 'Announcement' | 'News' | 'Article';
export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
export type MessageType = 'staff-client' | 'staff-candidate' | 'candidate-candidate';

// ============= NAME AND CONTACT INFO =============
export interface NameFields {
  surname: string;
  firstName: string;
  otherName: string;
}

export interface NextOfKin {
  name: NameFields;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  relationship: string;
}

export interface Guarantor {
  name: NameFields;
  address: string;
  phone: string;
  email: string;
  dob: string;
  gender: Gender;
  relationshipToCandidate: string;
  occupation: string;
  workAddress: string;
  howLongKnown: string;
  whatsapp: string;
  idType: string;
  idNumber: string;
  idUrl: string;
}

// ============= USER ENTITIES =============
export interface Candidate {
  id?: string;
  assignedAgentId?: string;
  name: NameFields;
  address: string;
  dob: string;
  gender: Gender;
  nationality: string;
  stateOfOrigin: string;
  lga: string;
  religion: string;
  phone: string;
  whatsapp: string;
  email: string;
  maritalStatus: MaritalStatus;
  handicap: boolean;
  handicapDetails: string;
  validIdNumber: string;
  idType: string;
  nextOfKin: NextOfKin;
  desiredPositions: string[];
  jobLocations: string[];
  jobMode: JobMode;
  yearsOfExperience: number;
  guarantors: Guarantor[];
  acquaintances: NameFields[];
  highestQualification: string;
  currentEmploymentStatus: string;
  expectedSalary: string;
  resumeUrl: string;
  photoUrl?: string;
  role: 'candidate';
  createdAt: string;
  paymentConfirmed: boolean;
  submitted: boolean;
  deletionRequestedAt?: string;
}

export interface Staff {
  id: string;
  fullName: string;
  email: string;
  role: StaffRole;
  photoUrl?: string;
  department?: string;
  createdAt: string;
  deletionRequestedAt?: string;
}

export interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  assignedAgentId?: string;
  photoUrl?: string;
  createdAt: string;
  deletionRequestedAt?: string;
}

// Discriminated union type for users
export type User = 
  | ({ role: 'candidate'; id: string; email: string } & Candidate)
  | ({ role: 'staff'; id: string; email: string } & Staff)
  | ({ role: 'client'; id: string; email: string } & Client);

// ============= JOB & APPLICATION =============
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  description: string;
  salaryRange: string;
  postedAt: string;
  postedBy: string; // Staff ID
  clientId: string;
  status: 'Open' | 'Closed' | 'On Hold';
  applicationsCount: number;
}

export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  status: ApplicationStatus;
  appliedAt: string;
  screeningScore?: number;
  interviewDate?: string;
  offerDetails?: string;
}

// ============= UPDATES & CONTENT =============
export interface Update {
  id: string;
  type: UpdateType;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  expiryDate?: string;
  mediaUrl?: string;
  published: boolean;
  bookmarkCount: number;
  viewCount: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

// ============= MESSAGING =============
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
  type: MessageType;
  attachments?: string[];
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage: Message;
  updatedAt: string;
}

// ============= AUTH & STATE MANAGEMENT =============
export interface AuthState {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  error: FirestoreError | null;
}

export interface FirestoreError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface AppState extends AuthState {
  isAuthenticated: boolean;
  theme: 'light' | 'dark';
}

// ============= SERVICE RESPONSES =============
export interface AssistantResponse {
  text: string;
  timestamp: string;
  senderId: 'assistant' | 'user';
  context?: {
    userId: string;
    role: UserRole;
    topic?: string;
  };
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
}

export interface EmailResponse {
  success: boolean;
  messageId: string;
  timestamp: string;
}

// ============= QUERY & FILTER TYPES =============
export interface QueryFilter {
  field: string;
  operator: '==' | '<' | '<=' | '>' | '>=' | 'in' | 'array-contains';
  value: any;
}

export interface PaginationOptions {
  pageSize: number;
  startAfter?: any;
}

export interface QueryResult<T> {
  data: T[];
  hasMore: boolean;
  lastDoc?: any;
  totalCount?: number;
}
