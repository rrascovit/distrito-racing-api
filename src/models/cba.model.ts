/**
 * Interfaces para integração com a API CBA (Confederação Brasileira de Automobilismo)
 */

// Categorias aceitas para eventos Distrito Racing
export const ACCEPTED_CBA_CATEGORIES = ['PTD', 'PC', 'PGC-B', 'PGC-A'] as const;
export type AcceptedCBACategory = typeof ACCEPTED_CBA_CATEGORIES[number];

// Resultado da verificação CBA
export interface CBAVerificationResult {
  found: boolean;
  matricula?: string;
  nome?: string;
  pseudonimo?: string;
  categoria?: string;
  federacao?: string;
  ano?: number;
  situacao?: string;
  foto?: string;
  isValidForEvent?: boolean; // true se a categoria está em ACCEPTED_CBA_CATEGORIES
}

// Request para verificação CBA
export interface CBAVerifyRequest {
  cpf: string;
  ano?: number; // Ano de filiação (default: ano atual)
}

// Response da API CBA (após parse do HTML)
export interface CBAApiResponse {
  success: boolean;
  data?: CBAVerificationResult;
  error?: string;
}

// Dados CBA para salvar na order
export interface CBAOrderData {
  cbaMatricula?: string;
  cbaCategoria?: string;
  cbaFederacao?: string;
  cbaAno?: number;
  cbaSituacao?: string;
  cbaVerificadoEm?: string;
}

// Helper para verificar se a categoria é aceita
export function isAcceptedCategory(categoria?: string): boolean {
  if (!categoria) return false;
  return ACCEPTED_CBA_CATEGORIES.includes(categoria as AcceptedCBACategory);
}
