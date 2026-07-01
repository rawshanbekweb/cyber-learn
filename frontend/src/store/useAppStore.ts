import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { runFuzzyEngine } from '../lib/fuzzyEngine';
import type { FuzzyResult, FuzzyWeights } from '../lib/fuzzyEngine';

export interface FuzzyMetrics {
  knowledge: number;
  errors: number;
  speed: number;
}

export interface ModuleProgress {
  id: number;
  title: string;
  unlocked: boolean;
  completed: boolean;
}

export interface AssignmentQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  content: string;
  category: string;
  difficulty: "Boshlang'ich" | "O'rta" | "Yuqori";
  lessonType: "Nazariy" | "Amaliy";
  videoUrl: string;
  tags: string[];
  createdAt: string;
  readByStudents: number[];
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface Assignment {
  id: number;
  title: string;
  studentId: number;
  studentName: string;
  targetModuleId: number;
  completed: boolean;
  dateAssigned: string;
  questions: AssignmentQuestion[];
  description?: string;
  assignmentType: "Nazariy" | "Amaliy";
}

export interface Student {
  id: number;
  name: string;
  age: number;
  diagnosticScore: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  fuzzyScore: number;
  completedModulesCount: number;
  speed: number;
  errors: number;
  hasCompletedInitialTest: boolean;
  moduleProgress: ModuleProgress[];
  lastFuzzyResult: FuzzyResult | null;
}

export interface UserSession {
  id: number;
  name: string;
  age: number;
  role: "Student" | "Teacher";
}

export interface AppState {
  currentUser: UserSession | null;
  userRole: "Student" | "Teacher";
  hasCompletedInitialTest: boolean;
  fuzzyMetrics: FuzzyMetrics;
  currentLevel: "Beginner" | "Intermediate" | "Advanced";
  readinessScore: number;
  moduleProgress: ModuleProgress[];
  lastFuzzyResult: FuzzyResult | null;
  fuzzyWeights: FuzzyWeights;
  assignments: Assignment[];
  students: Student[];
  lessons: Lesson[];
  
  loginUser: (name: string, parol: string, role: "Student" | "Teacher") => { success: boolean; message?: string };
  registerStudent: (name: string, age: number) => { success: boolean; message?: string };
  logoutUser: () => void;
  setRole: (role: "Student" | "Teacher") => void;
  submitAssessment: (metrics: FuzzyMetrics) => void;
  completeModule: (moduleId: number) => void;
  updateFuzzyWeights: (weights: Partial<FuzzyWeights>) => void;
  addAssignment: (title: string, studentId: number, targetModuleId: number, questions?: AssignmentQuestion[], description?: string, assignmentType?: "Nazariy" | "Amaliy") => void;
  completeAssignment: (assignmentId: number) => void;
  addLesson: (lesson: Omit<Lesson, 'id' | 'createdAt' | 'readByStudents'>) => void;
  deleteLesson: (lessonId: number) => void;
  markLessonRead: (lessonId: number) => void;
  resetProgress: () => void;
}

const initialModules: ModuleProgress[] = [
  { id: 1, title: "Kiberxavfsizlik asoslari", unlocked: true, completed: false },
  { id: 2, title: "Tarmoq xavflari", unlocked: false, completed: false },
  { id: 3, title: "Kriptografiya", unlocked: false, completed: false },
  { id: 4, title: "Tizim himoyasi", unlocked: false, completed: false },
];

const defaultFuzzyWeights: FuzzyWeights = {
  rule1Weight: 0.2,
  rule2Weight: 0.5,
  rule3Weight: 0.9,
  beginnerThreshold: 0.4,
  intermediateThreshold: 0.7,
};

const initialStudents: Student[] = [
  { 
    id: 1, 
    name: "Davron Aliev", 
    age: 20, 
    diagnosticScore: 0.35, 
    level: "Beginner", 
    fuzzyScore: 0.32, 
    completedModulesCount: 1, 
    speed: 0.7, 
    errors: 0.6,
    hasCompletedInitialTest: true,
    moduleProgress: [
      { id: 1, title: "Kiberxavfsizlik asoslari", unlocked: true, completed: true },
      { id: 2, title: "Tarmoq xavflari", unlocked: false, completed: false },
      { id: 3, title: "Kriptografiya", unlocked: false, completed: false },
      { id: 4, title: "Tizim himoyasi", unlocked: false, completed: false },
    ],
    lastFuzzyResult: { score: 0.32, level: "Beginner", rule1: 0.5, rule2: 0, rule3: 0 }
  },
  { 
    id: 2, 
    name: "Madina Karimova", 
    age: 21, 
    diagnosticScore: 0.65, 
    level: "Intermediate", 
    fuzzyScore: 0.62, 
    completedModulesCount: 2, 
    speed: 0.4, 
    errors: 0.3,
    hasCompletedInitialTest: true,
    moduleProgress: [
      { id: 1, title: "Kiberxavfsizlik asoslari", unlocked: true, completed: true },
      { id: 2, title: "Tarmoq xavflari", unlocked: true, completed: true },
      { id: 3, title: "Kriptografiya", unlocked: false, completed: false },
      { id: 4, title: "Tizim himoyasi", unlocked: false, completed: false },
    ],
    lastFuzzyResult: { score: 0.62, level: "Intermediate", rule1: 0, rule2: 0.4, rule3: 0.2 }
  },
  { 
    id: 3, 
    name: "Jasur Nematov", 
    age: 22, 
    diagnosticScore: 0.88, 
    level: "Advanced", 
    fuzzyScore: 0.85, 
    completedModulesCount: 4, 
    speed: 0.2, 
    errors: 0.1,
    hasCompletedInitialTest: true,
    moduleProgress: [
      { id: 1, title: "Kiberxavfsizlik asoslari", unlocked: true, completed: true },
      { id: 2, title: "Tarmoq xavflari", unlocked: true, completed: true },
      { id: 3, title: "Kriptografiya", unlocked: true, completed: true },
      { id: 4, title: "Tizim himoyasi", unlocked: true, completed: true },
    ],
    lastFuzzyResult: { score: 0.85, level: "Advanced", rule1: 0, rule2: 0, rule3: 0.8 }
  },
];

const initialState = {
  currentUser: null,
  userRole: "Student" as const,
  hasCompletedInitialTest: false,
  fuzzyMetrics: { knowledge: 0, errors: 0, speed: 0 },
  currentLevel: "Beginner" as const,
  readinessScore: 0,
  moduleProgress: initialModules,
  lastFuzzyResult: null,
  fuzzyWeights: defaultFuzzyWeights,
  assignments: [],
  students: initialStudents,
  lessons: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      loginUser: (name, parol, role) => {
        const state = get();
        if (role === "Teacher") {
          if (name.toLowerCase() === "teacher" && parol === "teacher123") {
            set({ 
              currentUser: { id: 100, name: "Teacher Account", age: 35, role: "Teacher" },
              userRole: "Teacher"
            });
            return { success: true };
          }
          return { success: false, message: "Parol yoki login xato!" };
        } else {
          // Log in as student
          const student = state.students.find(s => s.name.toLowerCase() === name.toLowerCase());
          if (student) {
            set({
              currentUser: { id: student.id, name: student.name, age: student.age, role: "Student" },
              userRole: "Student",
              hasCompletedInitialTest: student.hasCompletedInitialTest,
              currentLevel: student.level,
              readinessScore: student.fuzzyScore,
              moduleProgress: student.moduleProgress,
              lastFuzzyResult: student.lastFuzzyResult,
              fuzzyMetrics: { knowledge: student.diagnosticScore, errors: student.errors, speed: student.speed }
            });
            return { success: true };
          }
          return { success: false, message: "Bunday o'quvchi topilmadi. Iltimos ro'yxatdan o'ting!" };
        }
      },
      
      registerStudent: (name, age) => {
        const state = get();
        const exists = state.students.some(s => s.name.toLowerCase() === name.toLowerCase());
        if (exists) {
          return { success: false, message: "Ushbu ismdagi o'quvchi allaqachon mavjud!" };
        }

        const newId = Date.now();
        const newStudent: Student = {
          id: newId,
          name,
          age,
          diagnosticScore: 0,
          level: "Beginner",
          fuzzyScore: 0,
          completedModulesCount: 0,
          speed: 0,
          errors: 0,
          hasCompletedInitialTest: false,
          moduleProgress: initialModules,
          lastFuzzyResult: null
        };

        set((state) => ({
          students: [...state.students, newStudent],
          currentUser: { id: newId, name, age, role: "Student" },
          userRole: "Student",
          hasCompletedInitialTest: false,
          currentLevel: "Beginner",
          readinessScore: 0,
          moduleProgress: initialModules,
          lastFuzzyResult: null,
          fuzzyMetrics: { knowledge: 0, errors: 0, speed: 0 }
        }));

        return { success: true };
      },

      logoutUser: () => set({ currentUser: null }),
      
      setRole: (role) => set({ userRole: role }),
      
      submitAssessment: (metrics) => set((state) => {
        if (!state.currentUser || state.userRole !== "Student") return {};
        
        const result = runFuzzyEngine(metrics.knowledge, metrics.errors, metrics.speed, state.fuzzyWeights);
        
        const newModules = state.moduleProgress.map(m => {
          let unlocked = m.unlocked;
          if (result.level === "Beginner") {
            unlocked = m.id === 1;
          } else if (result.level === "Intermediate") {
            unlocked = m.id <= 2;
          } else if (result.level === "Advanced") {
            unlocked = m.id <= 4;
          }
          return { ...m, unlocked: unlocked || m.completed };
        });

        // Update current student record in the students list
        const updatedStudents = state.students.map(s => {
          if (s.id === state.currentUser?.id) {
            return {
              ...s,
              diagnosticScore: metrics.knowledge,
              level: result.level,
              fuzzyScore: result.score,
              completedModulesCount: newModules.filter(m => m.completed).length,
              speed: metrics.speed,
              errors: metrics.errors,
              hasCompletedInitialTest: true,
              moduleProgress: newModules,
              lastFuzzyResult: result
            };
          }
          return s;
        });

        return {
          hasCompletedInitialTest: true,
          fuzzyMetrics: metrics,
          currentLevel: result.level,
          readinessScore: result.score,
          lastFuzzyResult: result,
          moduleProgress: newModules,
          students: updatedStudents,
        };
      }),
      
      completeModule: (moduleId) => set((state) => {
        if (!state.currentUser || state.userRole !== "Student") return {};

        const newModules = state.moduleProgress.map(m => 
          m.id === moduleId ? { ...m, completed: true } : m
        );

        // Update in student array
        const updatedStudents = state.students.map(s => {
          if (s.id === state.currentUser?.id) {
            return {
              ...s,
              completedModulesCount: newModules.filter(m => m.completed).length,
              moduleProgress: newModules,
            };
          }
          return s;
        });

        return {
          moduleProgress: newModules,
          students: updatedStudents,
        };
      }),

      updateFuzzyWeights: (newWeights) => set((state) => {
        const updatedWeights = { ...state.fuzzyWeights, ...newWeights };
        
        // Re-run evaluation for current user if they took the test
        let extraState = {};
        if (state.hasCompletedInitialTest && state.currentUser?.role === "Student") {
          const result = runFuzzyEngine(state.fuzzyMetrics.knowledge, state.fuzzyMetrics.errors, state.fuzzyMetrics.speed, updatedWeights);
          
          const newModules = state.moduleProgress.map(m => {
            let unlocked = m.unlocked;
            if (result.level === "Beginner") {
              unlocked = m.id === 1;
            } else if (result.level === "Intermediate") {
              unlocked = m.id <= 2;
            } else if (result.level === "Advanced") {
              unlocked = m.id <= 4;
            }
            return { ...m, unlocked: unlocked || m.completed };
          });

          extraState = {
            currentLevel: result.level,
            readinessScore: result.score,
            lastFuzzyResult: result,
            moduleProgress: newModules,
            students: state.students.map(s => {
              if (s.id === state.currentUser?.id) {
                return {
                  ...s,
                  level: result.level,
                  fuzzyScore: result.score,
                  moduleProgress: newModules,
                  lastFuzzyResult: result
                };
              }
              return s;
            }),
          };
        }

        return {
          fuzzyWeights: updatedWeights,
          ...extraState
        };
      }),

      addAssignment: (title, studentId, targetModuleId, questions = [], description = "", assignmentType = "Nazariy") => set((state) => {
        const student = state.students.find(s => s.id === studentId);
        if (!student) return {};

        const newAssignment: Assignment = {
          id: Date.now(),
          title,
          studentId,
          studentName: student.name,
          targetModuleId,
          completed: false,
          dateAssigned: new Date().toISOString().split('T')[0],
          questions,
          description,
          assignmentType,
        };

        // If assigning to current student, unlock the module immediately for them
        let extraState = {};
        if (studentId === state.currentUser?.id) {
          const newModules = state.moduleProgress.map(m => 
            m.id === targetModuleId ? { ...m, unlocked: true } : m
          );
          extraState = { moduleProgress: newModules };
        }

        // Also unlock the module inside that student's object inside students array
        const updatedStudents = state.students.map(s => {
          if (s.id === studentId) {
            return {
              ...s,
              moduleProgress: s.moduleProgress.map(m => 
                m.id === targetModuleId ? { ...m, unlocked: true } : m
              )
            };
          }
          return s;
        });

        return {
          assignments: [newAssignment, ...state.assignments],
          students: updatedStudents,
          ...extraState
        };
      }),

      completeAssignment: (assignmentId) => set((state) => ({
        assignments: state.assignments.map(a => 
          a.id === assignmentId ? { ...a, completed: true } : a
        )
      })),

      addLesson: (lessonData) => set((state) => ({
        lessons: [
          {
            id: Date.now(),
            ...lessonData,
            createdAt: new Date().toISOString(),
            readByStudents: [],
          },
          ...state.lessons,
        ],
      })),

      deleteLesson: (lessonId) => set((state) => ({
        lessons: state.lessons.filter(l => l.id !== lessonId),
      })),

      markLessonRead: (lessonId) => set((state) => {
        const userId = state.currentUser?.id;
        if (!userId) return {};
        return {
          lessons: state.lessons.map(l =>
            l.id === lessonId && !l.readByStudents.includes(userId)
              ? { ...l, readByStudents: [...l.readByStudents, userId] }
              : l
          ),
        };
      }),

      resetProgress: () => set(initialState),
    }),
    {
      name: 'cyber-learning-store-v5',
    }
  )
);
