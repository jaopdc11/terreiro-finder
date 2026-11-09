import {
  Anchor,
  Axe,
  Coffee,
  Crown,
  Feather,
  Leaf,
  Lollipop,
  Music,
  Sparkles,
  Star,
  Sun,
  Swords,
  Tornado,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import {
  ArcoFlecha,
  Cavalo,
  Espelho,
  Tridente,
  Xaxara,
} from '../components/IconesGiraCustom';

/**
 * Componente de ícone — aceita props de tamanho/className.
 * Compatível tanto com LucideIcon quanto com nossos SVG custom.
 */
type IconeGira =
  | LucideIcon
  | React.ComponentType<{ size?: number | string; strokeWidth?: number | string; className?: string }>;

/**
 * Mapeamento keyword → ícone. Ordem importa: regras mais específicas vêm
 * antes (orixás específicos antes do genérico "orixás"). Fallback automático
 * pro dirigente que não escolher ícone manualmente.
 */
const REGRAS: ReadonlyArray<{ regex: RegExp; icone: IconeGira }> = [
  // Linhas da umbanda
  { regex: /caboclos?|mata|jurema/i, icone: Leaf },
  { regex: /pretos?[\s-]*velhos?|preta[\s-]*velha/i, icone: Coffee },
  { regex: /crian[çc]as?|er[êe]s?|ib[êe]ji/i, icone: Lollipop },
  { regex: /marinheiros?/i, icone: Anchor },
  { regex: /boiadeiros?|sertanejos?|vaqueiros?/i, icone: Cavalo },
  { regex: /baianos?/i, icone: Sun },
  { regex: /ciganos?|ciganas?/i, icone: Star },
  { regex: /esquerda|ex[uú]s?|pomba[\s-]*giras?|quimbanda/i, icone: Tridente },

  // Orixás específicos
  { regex: /xang[oô]/i, icone: Axe },
  { regex: /ox[óo]ssi/i, icone: ArcoFlecha },
  { regex: /ians[ãa]|oi[áa]/i, icone: Tornado },
  { regex: /oxum/i, icone: Espelho },
  { regex: /ogum/i, icone: Swords },
  { regex: /omol[uú]|obalua[êe]/i, icone: Xaxara },
  { regex: /iemanj[áa]|sereia/i, icone: Waves },
  { regex: /oxal[áa]|brancas?/i, icone: Feather },
  // Nanã: sem mapeamento definitivo — cai no default (em dúvida ainda)

  // Genéricos
  { regex: /orix[áa]s?/i, icone: Crown },
  { regex: /festa|aniversário|celebra[çc][ãa]o/i, icone: Music },
];

/** Ícone padrão quando nenhuma regra casa. */
export const ICONE_GIRA_DEFAULT: IconeGira = Sparkles;

export function iconePorTitulo(titulo: string): IconeGira {
  for (const { regex, icone } of REGRAS) {
    if (regex.test(titulo)) return icone;
  }
  return ICONE_GIRA_DEFAULT;
}
