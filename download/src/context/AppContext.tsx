
"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import type { UserProfile, MatchRequest, Match, Message } from '@/lib/types';

// Helper function to check for unread messages for the current profile
const getUnreadMessagesFlag = (state: AppState): boolean => {
    if (!state.profile) return false;
    for (const matchId in state.chats) {
        const messages = state.chats[matchId];
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.senderId !== state.profile.id && !lastMessage.read) {
            return true;
        }
    }
    return false;
};


// This is the pristine, initial state for a new user or a reset.
const getInitialState = (): AppState => {
  const mockProfiles: UserProfile[] = [
    {
        id: '1',
        email: 'alejandro@email.com',
        name: 'Alejandro',
        dob: new Date('1990-05-15'),
        gender: 'male',
        preference: 'hetero',
        location: 'Buenos Aires, Argentina',
        bio: 'Amante del cine, el buen vino y las charlas profundas. Busco a alguien con quien compartir aventuras y silencios.',
        photoUrl: 'https://placehold.co/600x800.png',
        photos: ['https://placehold.co/600x800.png', 'https://placehold.co/600x801.png', 'https://placehold.co/600x802.png', 'https://placehold.co/600x803.png'],
        tokens: 3,
        referralCount: 0,
    },
    {
        id: '2',
        email: 'brenda@email.com',
        name: 'Brenda',
        dob: new Date('1992-08-20'),
        gender: 'female',
        preference: 'hetero',
        location: 'Córdoba, Argentina',
        bio: 'Apasionada por el arte, la música y los viajes. Me encanta descubrir nuevos lugares y sabores. ¿Te sumas?',
        photoUrl: 'https://placehold.co/600x804.png',
        photos: ['https://placehold.co/600x804.png', 'https://placehold.co/600x805.png', 'https://placehold.co/600x806.png'],
        tokens: 5,
        referralCount: 2,
    },
    {
        id: '3',
        email: 'carlos@email.com',
        name: 'Carlos',
        dob: new Date('1988-11-30'),
        gender: 'male',
        preference: 'homo',
        location: 'Rosario, Argentina',
        bio: 'Entrenador personal y fanático del fitness. Busco un compañero de vida para entrenar, reír y crecer juntos.',
        photoUrl: 'https://placehold.co/600x807.png',
        photos: ['https://placehold.co/600x807.png', 'https://placehold.co/600x808.png'],
        tokens: 2,
        referralCount: 4,
    },
    {
        id: '4',
        email: 'diana@email.com',
        name: 'Diana',
        dob: new Date('1995-02-10'),
        gender: 'female',
        preference: 'bi',
        location: 'Buenos Aires, Argentina',
        bio: 'Programadora de día, gamer de noche. Me gustan los gatos, el café y el humor inteligente. Abierta a conocer gente interesante.',
        photoUrl: 'https://placehold.co/600x809.png',
        photos: ['https://placehold.co/600x809.png'],
        tokens: 10,
        referralCount: 0,
    },
  ];

  return {
      user: null,
      profile: null,
      isLoading: true,
      tokens: 0,
      profiles: mockProfiles,
      requests: [],
      matches: [],
      chats: {},
      redirectMatchId: null,
      pendingApprovalMatchId: null,
      newReceivedRequestId: null,
      hasUnreadMessages: false,
  };
};

const loadState = (): AppState => {
  try {
    if (typeof window === 'undefined') {
      return getInitialState();
    }
    const serializedState = localStorage.getItem('appState');
    if (serializedState === null) {
      const initialState = getInitialState();
      return initialState;
    }
    const storedState = JSON.parse(serializedState);
    
    // Dates are not preserved through JSON.stringify, so we need to parse them back
    const parsedState: AppState = {
        ...getInitialState(),
        ...storedState,       
        isLoading: false, // Don't start in loading state when loading from storage
        user: null,      // User is never persisted
        profile: null,   // Profile is never persisted
        profiles: (storedState.profiles || getInitialState().profiles).map((p: UserProfile) => ({ ...p, dob: new Date(p.dob), photos: p.photos || [p.photoUrl], referralCount: p.referralCount ?? 0 })),
        requests: (storedState.requests || []).map((r: MatchRequest) => ({ 
            ...r, 
            createdAt: new Date(r.createdAt),
            paymentExpiresAt: r.paymentExpiresAt ? new Date(r.paymentExpiresAt) : undefined,
            from: { ...r.from, dob: new Date(r.from.dob), photos: r.from.photos || [r.from.photoUrl] },
            to: { ...r.to, dob: new Date(r.to.dob), photos: r.to.photos || [r.to.photoUrl] }
        })),
        matches: (storedState.matches || []).map((m: Match) => ({ 
            ...m, 
            createdAt: new Date(m.createdAt), 
            chatExpiresAt: new Date(m.chatExpiresAt), 
            status: m.status,
            users: m.users.map(u => ({...u, dob: new Date(u.dob), photos: u.photos || [u.photoUrl] })) as [UserProfile, UserProfile]
        })),
        chats: Object.entries(storedState.chats || {}).reduce((acc, [key, messages]) => ({
            ...acc,
            [key]: (messages as Message[]).map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
        }), {}),
    };
    return parsedState;
  } catch (err) {
    console.error("Could not load state from localStorage", err);
    return getInitialState();
  }
};

const saveState = (state: AppState) => {
  try {
     const stateToSave = {
      ...state,
      isLoading: false, 
      user: null, 
      profile: null,
    };
    const serializedState = JSON.stringify(stateToSave);
    localStorage.setItem('appState', serializedState);
  } catch (err)
 {
    console.error("Could not save state to localStorage", err);
  }
};


interface AppState {
  user: (FirebaseUser & { displayName: string }) | null;
  profile: UserProfile | null;
  isLoading: boolean;
  tokens: number;
  profiles: UserProfile[];
  requests: MatchRequest[];
  matches: Match[];
  chats: Record<string, Message[]>;
  redirectMatchId: string | null;
  pendingApprovalMatchId: string | null;
  newReceivedRequestId: string | null;
  hasUnreadMessages: boolean;
}

const REFERRAL_GOAL = 5;

type Action =
  | { type: 'SET_USER'; payload: { user: (FirebaseUser & { displayName: string }) | null, profile: UserProfile | null } }
  | { type: 'LOGIN'; payload: { email: string; password?: string }, onSuccess: () => void; onError: (error: string) => void; }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: UserProfile }
  | { type: 'PURCHASE_TOKENS'; payload: number }
  | { type: 'SEND_REQUEST'; payload: { from: UserProfile; to: UserProfile } }
  | { type: 'HANDLE_REQUEST'; payload: { requestId: string; status: 'awaiting_final_approval' | 'accepted' | 'rejected' | 'cancelled' } }
  | { type: 'ADD_MESSAGE'; payload: { matchId: string; message: Message } }
  | { type: 'MARK_CHAT_AS_READ'; payload: { matchId: string } }
  | { type: 'CLEAR_REDIRECT_MATCH' }
  | { type: 'CLEAR_PENDING_APPROVAL_MATCH' }
  | { type: 'CLEAR_NEW_RECEIVED_REQUEST' }
  | { type: 'CLEAR_UNREAD_MESSAGES_FLAG' }
  | { type: 'INCREMENT_REFERRAL_COUNT' }
  | { type: 'RESET_STATE' };


function appReducer(state: AppState, action: Action): AppState {
  const newState = reducerLogic(state, action);
  if (typeof window !== 'undefined') {
      saveState(newState);
  }
  return newState;
}

function reducerLogic(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_USER':
      const { user, profile } = action.payload;
      const userState = { 
          ...state, 
          user: user, 
          profile: profile, 
          tokens: profile?.tokens ?? 0, 
          isLoading: false 
      };
      return { ...userState, hasUnreadMessages: getUnreadMessagesFlag(userState) };
      
    case 'LOGIN': {
        const { email } = action.payload;
        const fullState = loadState(); // Load the entire persisted state, including pending notifications
        const existingProfile = fullState.profiles.find(p => p.email === email);
        
        if (existingProfile) {
            const mockUser = {
              uid: existingProfile.id,
              displayName: existingProfile.name,
              email: existingProfile.email,
            };
            setTimeout(() => action.onSuccess(), 0); 
            // Return the full state, but with the current user set
            const loggedInState = {
              ...fullState,
              user: mockUser as any,
              profile: existingProfile,
              tokens: existingProfile.tokens,
              isLoading: false,
            };
            return { ...loggedInState, hasUnreadMessages: getUnreadMessagesFlag(loggedInState) };
        } else {
            setTimeout(() => action.onError('Usuario no encontrado. Por favor, usa uno de los perfiles de prueba.'), 0);
            return { ...state, isLoading: false };
        }
    }

    case 'UPDATE_PROFILE': {
       const userFromProfile = {
          ...(state.user || {}),
          uid: action.payload.id,
          displayName: action.payload.name,
          email: action.payload.email,
      };
      
      const isExistingProfile = state.profiles.some(p => p.id === action.payload.id);
      
      const newTokens = isExistingProfile 
        ? action.payload.tokens
        : 3; 

      const profileWithTokens = { ...action.payload, tokens: newTokens, referralCount: action.payload.referralCount ?? 0 };

      const newProfiles = isExistingProfile
          ? state.profiles.map(p => p.id === action.payload.id ? profileWithTokens : p)
          : [...state.profiles, profileWithTokens];
            
      return { 
          ...state, 
          profile: profileWithTokens,
          user: userFromProfile as any,
          tokens: newTokens,
          profiles: newProfiles,
      };
    }

    case 'LOGOUT': {
      // On logout, we only clear the active user and profile, preserving the rest of the state
      return {
        ...state,
        user: null,
        profile: null,
        tokens: 0,
        isLoading: false,
        hasUnreadMessages: false,
      };
    }
      
    case 'PURCHASE_TOKENS': {
      if(!state.profile) return state;
      const newTokens = (state.profile.tokens ?? 0) + action.payload;
      const updatedProfile = { ...state.profile, tokens: newTokens };

      const newProfiles = state.profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p);

      return {
        ...state, 
        tokens: newTokens, 
        profile: updatedProfile,
        profiles: newProfiles
      };
    }
      
    case 'SEND_REQUEST': {
      if (!state.profile || state.profile.tokens < 1) return state;

      const updatedFromProfile = { 
        ...state.profile, 
        tokens: state.profile.tokens - 1 
      };

      const newProfiles = state.profiles.map(p => 
        p.id === updatedFromProfile.id ? updatedFromProfile : p
      );
      
      const newRequest: MatchRequest = {
        id: `req_${Date.now()}`,
        from: updatedFromProfile,
        to: action.payload.to,
        status: 'pending',
        createdAt: new Date(),
      };

      return {
        ...state,
        profile: updatedFromProfile,
        tokens: updatedFromProfile.tokens,
        profiles: newProfiles,
        requests: [...state.requests, newRequest],
        newReceivedRequestId: newRequest.id, // Set the flag for the receiver
      };
    }

    case 'HANDLE_REQUEST': {
      const { requestId, status } = action.payload;
      let request = state.requests.find(r => r.id === requestId);
      if (!request) return state;
      
      let updatedRequests = state.requests;
      let newMatches = state.matches;
      let newChats = state.chats;
      let newPendingApprovalId: string | null = state.pendingApprovalMatchId;
      let newRedirectId: string | null = state.redirectMatchId;
      
      if (status === 'awaiting_final_approval') {
          const paymentExpires = new Date();
          paymentExpires.setHours(paymentExpires.getHours() + 48);
          updatedRequests = state.requests.map(r => r.id === requestId ? { ...r, status, paymentExpiresAt: paymentExpires } : r);
          newPendingApprovalId = requestId; // Notify the original sender
      } else {
         updatedRequests = state.requests.map(r => r.id === requestId ? { ...r, status } : r);
      }

      if (status === 'accepted') {
        const expires = new Date();
        expires.setHours(expires.getHours() + 24);
        const newMatch: Match = {
          id: `match_${request.from.id}_${request.to.id}`,
          users: [request.from, request.to],
          createdAt: new Date(),
          chatExpiresAt: expires,
          status: 'active'
        }
        newMatches = [...state.matches.filter(m => m.id !== newMatch.id), newMatch];
        newChats = { ...newChats, [newMatch.id]: [] };
        // Set the redirect ID for the user who is currently performing the action
        newRedirectId = newMatch.id;
      }

      return {
        ...state,
        requests: updatedRequests,
        matches: newMatches,
        chats: newChats,
        pendingApprovalMatchId: newPendingApprovalId,
        redirectMatchId: newRedirectId,
      };
    }
    case 'ADD_MESSAGE': {
        const { matchId, message } = action.payload;
        if (!message.text.trim()) return state;
        const currentChat = state.chats[matchId] || [];
        
        const newChats = {
            ...state.chats,
            [matchId]: [...currentChat, message],
        };

        const addMessageState = { ...state, chats: newChats };
        // We only set the unread flag if the current profile is NOT the sender
        const hasUnread = message.senderId !== state.profile?.id;
        
        return { ...addMessageState, hasUnreadMessages: hasUnread };
    }
     case 'MARK_CHAT_AS_READ': {
        const { matchId } = action.payload;
        if (!state.profile || !state.chats[matchId]) return state;

        const updatedMessages = state.chats[matchId].map(msg => 
            msg.senderId !== state.profile?.id ? { ...msg, read: true } : msg
        );

        const newChats = {
            ...state.chats,
            [matchId]: updatedMessages,
        };
        const updatedState = { ...state, chats: newChats };
        return { ...updatedState, hasUnreadMessages: getUnreadMessagesFlag(updatedState) };
    }

    case 'INCREMENT_REFERRAL_COUNT': {
        if (!state.profile) return state;

        let currentCount = state.profile.referralCount ?? 0;
        let currentTokens = state.profile.tokens;
        currentCount++;

        if (currentCount >= REFERRAL_GOAL) {
            currentTokens++;
            currentCount = 0; // Reset counter
        }

        const updatedProfile = {
            ...state.profile,
            referralCount: currentCount,
            tokens: currentTokens,
        };

        const newProfiles = state.profiles.map(p =>
            p.id === updatedProfile.id ? updatedProfile : p
        );

        return {
            ...state,
            profile: updatedProfile,
            tokens: currentTokens,
            profiles: newProfiles,
        };
    }

    case 'CLEAR_REDIRECT_MATCH':
        return { ...state, redirectMatchId: null };

    case 'CLEAR_PENDING_APPROVAL_MATCH':
        return { ...state, pendingApprovalMatchId: null };

    case 'CLEAR_NEW_RECEIVED_REQUEST':
        return { ...state, newReceivedRequestId: null };
    
    case 'CLEAR_UNREAD_MESSAGES_FLAG':
      return { ...state, hasUnreadMessages: false };

    case 'RESET_STATE':
        const cleanState = getInitialState();
        if (typeof window !== 'undefined') {
            localStorage.setItem('appState', JSON.stringify({
                ...cleanState,
                isLoading: false, // Ensure loading is false
                user: null,
                profile: null,
            }));
        }
        return { ...cleanState, isLoading: false };

    default:
      return state;
  }
}

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, undefined, () => {
    const freshState = getInitialState();
    if(typeof window !== 'undefined') {
      localStorage.removeItem('appState');
      saveState(freshState);
    }
    return {...freshState, isLoading: false };
  });

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
