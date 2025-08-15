/// <reference types="vite/client" />

// 評分項目類型枚舉
export enum GradeItemType {
  ASSIGNMENT = "assignment",
  ATTENDANCE = "attendance",
  MIDTERM_EXAM = "midterm_exam",
  FINAL_EXAM = "final_exam",
  QUIZ = "quiz",
  PARTICIPATION = "participation",
}

// 評分項目配置接口
export interface GradeItemConfigType {
  label: string;
  icon: string;
  inputType: string;
  maxScore: number;
  description: string;
}

// 評分項目接口
export interface GradeItem {
  id: string;
  type: GradeItemType;
  title: string;
  weight: number;
  enabled: boolean;
  assignmentId?: string;
}

// 評分項目配置
export const GradeItemConfig: Record<GradeItemType, GradeItemConfigType> = {
  [GradeItemType.ASSIGNMENT]: {
    label: "作業",
    icon: "📝",
    inputType: "number",
    maxScore: 100,
    description: "基於現有作業的評分",
  },
  [GradeItemType.ATTENDANCE]: {
    label: "出席率",
    icon: "✅",
    inputType: "number",
    maxScore: 100,
    description: "學生出席率評分",
  },
  [GradeItemType.MIDTERM_EXAM]: {
    label: "期中考試",
    icon: "📋",
    inputType: "number",
    maxScore: 100,
    description: "期中考試成績",
  },
  [GradeItemType.FINAL_EXAM]: {
    label: "期末考試",
    icon: "📊",
    inputType: "number",
    maxScore: 100,
    description: "期末考試成績",
  },
  [GradeItemType.QUIZ]: {
    label: "隨堂測驗",
    icon: "❓",
    inputType: "number",
    maxScore: 100,
    description: "隨堂測驗評分",
  },
  [GradeItemType.PARTICIPATION]: {
    label: "課堂參與",
    icon: "🙋",
    inputType: "number",
    maxScore: 100,
    description: "課堂參與度評分",
  },
};

// 預設的評分項目模板
export const DefaultGradeItems: GradeItem[] = [
  {
    id: "attendance",
    type: GradeItemType.ATTENDANCE,
    title: "出席率",
    weight: 20,
    enabled: true,
  },
  {
    id: "midterm",
    type: GradeItemType.MIDTERM_EXAM,
    title: "期中考試",
    weight: 30,
    enabled: true,
  },
  {
    id: "final",
    type: GradeItemType.FINAL_EXAM,
    title: "期末考試",
    weight: 30,
    enabled: true,
  },
  {
    id: "participation",
    type: GradeItemType.PARTICIPATION,
    title: "課堂參與",
    weight: 20,
    enabled: true,
  },
];
