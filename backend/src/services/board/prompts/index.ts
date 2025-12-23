/**
 * Board Member Prompts Index
 * تصدير جميع System Prompts لأعضاء المجلس
 */

import CEO_PROMPTS, { CEO_LEADER_MODE, CEO_STRATEGIST_MODE, CEO_VISIONARY_MODE } from './ceo.prompt';
import CTO_PROMPT from './cto.prompt';
import CFO_PROMPT from './cfo.prompt';
import CMO_PROMPT from './cmo.prompt';
import COO_PROMPT from './coo.prompt';
import CLO_PROMPT from './clo.prompt';

export {
  // CEO with modes
  CEO_PROMPTS,
  CEO_LEADER_MODE,
  CEO_STRATEGIST_MODE,
  CEO_VISIONARY_MODE,
  // Other C-Suite
  CTO_PROMPT,
  CFO_PROMPT,
  CMO_PROMPT,
  COO_PROMPT,
  CLO_PROMPT,
};

// Type for CEO modes
export type CEOModeType = 'LEADER' | 'STRATEGIST' | 'VISIONARY';

// Type for Board roles
export type BoardRoleType = 'CEO' | 'CTO' | 'CFO' | 'CMO' | 'COO' | 'CLO';

// Get prompt by role
export function getPromptByRole(role: BoardRoleType, ceoMode?: CEOModeType): string {
  switch (role) {
    case 'CEO':
      return CEO_PROMPTS[ceoMode || 'LEADER'];
    case 'CTO':
      return CTO_PROMPT;
    case 'CFO':
      return CFO_PROMPT;
    case 'CMO':
      return CMO_PROMPT;
    case 'COO':
      return COO_PROMPT;
    case 'CLO':
      return CLO_PROMPT;
    default:
      throw new Error(`Unknown board role: ${role}`);
  }
}

// Board member info
export const BOARD_MEMBERS_INFO = [
  {
    name: 'Karim',
    nameAr: 'كريم',
    role: 'CEO' as BoardRoleType,
    model: 'OPUS',
    description: 'الرئيس التنفيذي - القيادة والاستراتيجية',
  },
  {
    name: 'Nadia',
    nameAr: 'نادية',
    role: 'CTO' as BoardRoleType,
    model: 'SONNET',
    description: 'المدير التقني - التقنية والهندسة',
  },
  {
    name: 'Laila',
    nameAr: 'ليلى',
    role: 'CFO' as BoardRoleType,
    model: 'SONNET',
    description: 'المدير المالي - المالية والاستثمار',
  },
  {
    name: 'Youssef',
    nameAr: 'يوسف',
    role: 'CMO' as BoardRoleType,
    model: 'SONNET',
    description: 'مدير التسويق - التسويق والنمو',
  },
  {
    name: 'Omar',
    nameAr: 'عمر',
    role: 'COO' as BoardRoleType,
    model: 'SONNET',
    description: 'مدير العمليات - العمليات واللوجستيات',
  },
  {
    name: 'Hana',
    nameAr: 'هنا',
    role: 'CLO' as BoardRoleType,
    model: 'SONNET',
    description: 'المستشار القانوني - القانون والامتثال',
  },
];
