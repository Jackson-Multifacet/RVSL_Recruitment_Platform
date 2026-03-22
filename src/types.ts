export type Gender = 'Male' | 'Female';
export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';
export type JobMode = 'On-site' | 'Remote' | 'Hybrid';

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
  role: 'candidate' | 'staff' | 'admin' | 'client';
  createdAt: string;
  paymentConfirmed: boolean;
  submitted: boolean;
  deletionRequestedAt?: string;
}

export interface Staff {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'recruiter' | 'agent';
  photoUrl?: string;
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
  deletionRequestedAt?: string;
}

export interface Update {
  id: string;
  type: 'Vacancy' | 'Announcement' | 'News' | 'Article';
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  expiryDate?: string;
  mediaUrl?: string;
  published: boolean;
  bookmarkCount: number;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  description: string;
  salaryRange: string;
  postedAt: string;
}

export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  status: 'Screening' | 'Interview' | 'Offered' | 'Placed';
  appliedAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
  type: 'staff-client' | 'staff-candidate';
}
