import { create } from 'zustand';

export interface Subject {
  id: string;
  code: string;
  name: string;
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  grades: Record<string, string>; // subjectCode -> grade
}

interface AppState {
  user: any | null;
  setUser: (user: any) => void;
  subjects: Subject[];
  setSubjects: (subjects: Subject[]) => void;
  students: Student[];
  setStudents: (students: Student[]) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  subjects: [],
  setSubjects: (subjects) => set({ subjects }),
  students: [],
  setStudents: (students) => set({ students }),
}));
