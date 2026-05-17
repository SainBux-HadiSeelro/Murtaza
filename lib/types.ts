export type EventType = 'shadi';
export type StatusType = 'pending' | 'approved' | 'rejected';

export interface GuestEntry {
  id: string;
  name: string;
  phone: string;
  message: string;
  photoUrl: string | null;
  event: EventType;
  status: StatusType;
  showPhoto: boolean;
  timestamp: number;
  originalPhotoKB:   number | null;
  compressedPhotoKB: number | null;
}
