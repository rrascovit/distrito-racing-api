export interface Event {
  id: number;
  title?: string;
  subtitle?: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  externalTickets?: string;
  trackImage?: string;
  regulation?: string;
  membershipRequired?: boolean;
  result?: string;
  resultClass?: string;
  resultLap?: string;
  chatLink?: string;
  registrationPossible?: boolean;
  lastDay?: string; // date
  possibleDays?: Array<{
    date: string;
    description?: string;
  }>; // jsonb
}

export interface CreateEventDto {
  title: string;
  subtitle?: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  externalTickets?: string;
  trackImage?: string;
  regulation?: string;
  membershipRequired?: boolean;
  result?: string;
  resultClass?: string;
  resultLap?: string;
  chatLink?: string;
  registrationPossible?: boolean;
  lastDay?: string;
  possibleDays?: Array<{
    date: string;
    description?: string;
  }>;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {}
