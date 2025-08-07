export interface UserProfile {
  id: string; // Firebase UID
  email: string;
  name: string;
  dob: Date;
  gender: 'male' | 'female' | 'other';
  preference: 'hetero' | 'homo' | 'bi';
  location: string;
  bio: string;
  photoUrl: string;
  photos: string[]; // Array for multiple photos, photoUrl is the main one
  tokens: number;
  referralCount?: number;
}

export interface MatchRequest {
  id: string;
  from: UserProfile;
  to: UserProfile;
  status: 'pending' | 'awaiting_final_approval' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: Date;
  paymentExpiresAt?: Date;
}

export interface Match {
  id: string;
  users: [UserProfile, UserProfile];
  createdAt: Date;
  chatExpiresAt: Date;
  status: 'active' | 'expired';
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read?: boolean;
}
