// Utilitário para verificar contraste de cores conforme WCAG
// Baseado nas diretrizes WCAG 2.1 AA e AAA

/**
 * Converte cor hex para RGB
 * @param {string} hex - Cor em formato hexadecimal (#RRGGBB)
 * @returns {object} Objeto com valores r, g, b
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calcula a luminância relativa de uma cor
 * @param {object} rgb - Objeto com valores r, g, b
 * @returns {number} Luminância relativa (0-1)
 */
function getLuminance(rgb) {
  const { r, g, b } = rgb;
  
  // Normalizar valores RGB para 0-1
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  // Fórmula WCAG para luminância relativa
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calcula a razão de contraste entre duas cores
 * @param {string} color1 - Primeira cor em hex
 * @param {string} color2 - Segunda cor em hex
 * @returns {number} Razão de contraste (1-21)
 */
function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Verifica se o contraste atende aos padrões WCAG
 * @param {number} ratio - Razão de contraste
 * @param {string} level - Nível WCAG ('AA' ou 'AAA')
 * @param {boolean} isLargeText - Se é texto grande (18pt+ ou 14pt+ bold)
 * @returns {object} Resultado da verificação
 */
function checkWCAGCompliance(ratio, level = 'AA', isLargeText = false) {
  const requirements = {
    AA: {
      normal: 4.5,
      large: 3.0
    },
    AAA: {
      normal: 7.0,
      large: 4.5
    }
  };
  
  const required = requirements[level][isLargeText ? 'large' : 'normal'];
  const passes = ratio >= required;
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    required,
    passes,
    level,
    isLargeText
  };
}

/**
 * Testa todas as combinações de cores da paleta brand
 */
function testBrandPalette() {
  const brandColors = {
    primary: '#0F172A',     // Slate 900
    secondary: '#475569',   // Slate 600
    accent: '#3B82F6',      // Blue 500
    surface: '#F8FAFC',     // Slate 50
    background: '#FFFFFF',  // Branco
    muted: '#64748B',       // Slate 500
    border: '#E2E8F0',      // Slate 200
    hover: '#F1F5F9'        // Slate 100
  };
  
  const results = [];
  
  // Combinações principais de texto/fundo
  const combinations = [
    { text: 'primary', bg: 'background', description: 'Texto principal em fundo branco' },
    { text: 'primary', bg: 'surface', description: 'Texto principal em fundo surface' },
    { text: 'secondary', bg: 'background', description: 'Texto secundário em fundo branco' },
    { text: 'secondary', bg: 'surface', description: 'Texto secundário em fundo surface' },
    { text: 'muted', bg: 'background', description: 'Texto muted em fundo branco' },
    { text: 'muted', bg: 'surface', description: 'Texto muted em fundo surface' },
    { text: 'background', bg: 'accent', description: 'Texto branco em botão accent' },
    { text: 'background', bg: 'primary', description: 'Texto branco em botão primary' },
    { text: 'accent', bg: 'background', description: 'Links accent em fundo branco' },
    { text: 'primary', bg: 'hover', description: 'Texto primary em estado hover' }
  ];
  
  combinations.forEach(combo => {
    const textColor = brandColors[combo.text];
    const bgColor = brandColors[combo.bg];
    const ratio = getContrastRatio(textColor, bgColor);
    
    const aaResult = checkWCAGCompliance(ratio, 'AA', false);
    const aaaResult = checkWCAGCompliance(ratio, 'AAA', false);
    const aaLargeResult = checkWCAGCompliance(ratio, 'AA', true);
    
    results.push({
      description: combo.description,
      textColor: `${combo.text} (${textColor})`,
      bgColor: `${combo.bg} (${bgColor})`,
      ratio: aaResult.ratio,
      wcagAA: aaResult.passes ? '✅ PASS' : '❌ FAIL',
      wcagAAA: aaaResult.passes ? '✅ PASS' : '❌ FAIL',
      wcagAALarge: aaLargeResult.passes ? '✅ PASS' : '❌ FAIL'
    });
  });
  
  return results;
}

// Executar teste e exibir resultados
const contrastResults = testBrandPalette();

console.log('=== ANÁLISE DE CONTRASTE DA PALETA BRAND ===\n');
contrastResults.forEach(result => {
  console.log(`${result.description}`);
  console.log(`Texto: ${result.textColor}`);
  console.log(`Fundo: ${result.bgColor}`);
  console.log(`Contraste: ${result.ratio}:1`);
  console.log(`WCAG AA (normal): ${result.wcagAA}`);
  console.log(`WCAG AA (large): ${result.wcagAALarge}`);
  console.log(`WCAG AAA (normal): ${result.wcagAAA}`);
  console.log('---');
});

// Exportar funções para uso em outros arquivos
export {
  getContrastRatio,
  checkWCAGCompliance,
  testBrandPalette
};