export interface FundingCall {
  id: string;
  title: string;
  organization: string; // e.g., "IEEE Signal Processing Society"
  deadline: string;
  amount: string;
  description: string;
  eligibility: string;
  url: string;
  category: 'Research' | 'Travel' | 'Event' | 'Scholarship' | 'Award' | 'Other';
}

export interface SearchState {
  query: string;
  isLoading: boolean;
  results: FundingCall[];
  error: string | null;
  searchPerformed: boolean;
}

export enum SortOption {
  DEADLINE_SOONEST = 'DEADLINE_SOONEST',
  AMOUNT_HIGHEST = 'AMOUNT_HIGHEST',
  NEWEST = 'NEWEST'
}

export interface BudgetItem {
  category: string;
  item: string;
  cost: string;
  justification: string;
}

export interface TimelinePhase {
  phase: string;
  startMonth: number; // 1-based index relative to project start
  durationMonths: number;
}

export interface ExecutionStep {
  stepNumber: number;
  title: string;
  description: string;
}

export interface IncomeItem {
  source: string;
  status: string;
  amount: string;
}

export interface ResourceAllocation {
  role: string;
  count: number;
  duration: string;
  responsibility: string;
}

export interface TeamMember {
  name: string;
  affiliation: string;
  role: string;
}

export interface Proposal {
  projectTitle: string;
  executiveSummary: string;
  problemStatement: string;
  objectives: string[];
  methodology: string;
  impact: string;
  timeline: string; // Text description
  timelinePhases: TimelinePhase[]; // Structured data for Gantt chart
  executionSteps: ExecutionStep[]; // Structured data for Flow chart
  budgetItems: BudgetItem[];
  totalBudget: string;
  incomeItems?: IncomeItem[];
  resourceAllocations?: ResourceAllocation[];
  teamMembers?: TeamMember[];
}

export interface PetitionInfo {
  id: string;
  title: string;
  organization: string;
  description: string;
  url: string;
  type: 'New Unit' | 'Nomination' | 'Other';
  category?: 'Society' | 'Council' | 'Affinity Group' | 'Other';
}