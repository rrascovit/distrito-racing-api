import { CBAVerificationResult, isAcceptedCategory } from '../models/cba.model';
import * as cheerio from 'cheerio';

const CBA_API_URL = 'https://pilotos.cba.org.br/api/geraConsultaPilotos';

export class CBAService {
  /**
   * Verifica a filiação de um piloto na CBA
   * @param cpf CPF do piloto (apenas números)
   * @param ano Ano de filiação (default: ano atual)
   * @returns Resultado da verificação
   */
  async verifyPilot(cpf: string, ano?: number): Promise<CBAVerificationResult> {
    // Limpar CPF - apenas números
    const cleanCpf = cpf.replace(/\D/g, '');
    const currentYear = ano || new Date().getFullYear();

    try {
      // Montar URL com query params
      const url = new URL(CBA_API_URL);
      url.searchParams.append('flt_texto', cleanCpf);
      url.searchParams.append('flt_ano', currentYear.toString());

      console.log(`[CBA] Verificando CPF: ${cleanCpf.substring(0, 3)}***${cleanCpf.substring(cleanCpf.length - 2)} para ano ${currentYear}`);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'text/html',
          'User-Agent': 'DistritoRacing/1.0'
        }
      });

      if (!response.ok) {
        console.error(`[CBA] Erro na requisição: ${response.status}`);
        return { found: false };
      }

      const html = await response.text();
      
      // Parse do HTML retornado
      return this.parseHtmlResponse(html, currentYear);
    } catch (error) {
      console.error('[CBA] Erro ao verificar piloto:', error);
      return { found: false };
    }
  }

  /**
   * Faz o parse do HTML retornado pela API CBA
   */
  private parseHtmlResponse(html: string, ano: number): CBAVerificationResult {
    try {
      const $ = cheerio.load(html);
      
      // Buscar a primeira linha da tabela de resultados
      const firstRow = $('table tbody tr').first();
      
      if (firstRow.length === 0) {
        console.log('[CBA] Nenhum piloto encontrado');
        return { found: false };
      }

      // Extrair dados da tabela
      const cells = firstRow.find('td');
      
      if (cells.length < 8) {
        console.log('[CBA] Formato de resposta inesperado');
        return { found: false };
      }

      // Estrutura da tabela:
      // 0: Foto (img)
      // 1: Matrícula
      // 2: Nome do Piloto
      // 3: Pseudônimo
      // 4: Categoria
      // 5: Federação/Clube
      // 6: Ano
      // 7: Situação

      const foto = cells.eq(0).find('img').attr('src') || undefined;
      const matricula = cells.eq(1).text().trim();
      const nome = cells.eq(2).text().trim();
      const pseudonimo = cells.eq(3).text().trim();
      const categoria = cells.eq(4).text().trim();
      const federacao = cells.eq(5).text().trim();
      const anoFiliacao = parseInt(cells.eq(6).text().trim()) || ano;
      
      // Extrair situação (pode ter classe CSS e texto)
      const situacaoCell = cells.eq(7);
      const situacao = situacaoCell.text().trim();

      console.log(`[CBA] Piloto encontrado: ${nome} - ${categoria} - ${federacao} - ${anoFiliacao}`);

      const result: CBAVerificationResult = {
        found: true,
        matricula,
        nome,
        pseudonimo: pseudonimo || undefined,
        categoria,
        federacao,
        ano: anoFiliacao,
        situacao,
        foto,
        isValidForEvent: isAcceptedCategory(categoria)
      };

      return result;
    } catch (error) {
      console.error('[CBA] Erro ao fazer parse do HTML:', error);
      return { found: false };
    }
  }
}

// Singleton
export const cbaService = new CBAService();
