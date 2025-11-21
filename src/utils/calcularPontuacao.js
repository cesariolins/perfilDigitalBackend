/**
 * Calcula a pontuação total do questionário
 * e retorna a classificação do usuário
 */

function calcularPontuacao(respostas) {
  // Soma todas as 20 perguntas (valores de 0 a 5)
  const pontuacao = Object.values(respostas).reduce((acc, valor) => {
    return acc + parseInt(valor || 0)
  }, 0)

  // Determina a classificação baseada na pontuação
  let classificacao = ''

  if (pontuacao >= 81 && pontuacao <= 100) {
    classificacao = 'Uso saudável e equilibrado'
  } else if (pontuacao >= 51 && pontuacao <= 80) {
    classificacao = 'Uso moderado / controlado'
  } else if (pontuacao >= 21 && pontuacao <= 50) {
    classificacao = 'Uso excessivo'
  } else if (pontuacao >= 0 && pontuacao <= 20) {
    classificacao = 'Uso problemático / dependência severa'
  }

  return { pontuacao, classificacao }
}

/**
 * Gera recomendações personalizadas baseadas na classificação
 */
function gerarRecomendacoes(classificacao) {
  const recomendacoes = {
    'Uso saudável e equilibrado': `
      ✅ Parabéns! Você demonstra um uso consciente e equilibrado da internet.
      
      Dicas para manter esse equilíbrio:
      • Continue priorizando suas atividades offline (trabalho, estudos, família)
      • Mantenha horários definidos para desconectar
      • Use a internet como ferramenta produtiva
      • Compartilhe suas boas práticas com amigos e familiares
    `,
    
    'Uso moderado / controlado': `
      💡 Seu uso está no limite do saudável, mas há sinais de atenção.
      
      Recomendações:
      • Defina horários específicos para usar redes sociais
      • Evite o celular antes de dormir (pelo menos 1h antes)
      • Faça pausas regulares durante o uso prolongado
      • Pratique atividades offline que você gosta
      • Use aplicativos de controle de tempo de tela
    `,
    
    'Uso excessivo': `
      ⚠️ Atenção! Você está usando a internet de forma excessiva.
      
      Ações recomendadas:
      • Reduza gradualmente o tempo de tela (comece com 30 min/dia)
      • Desative notificações não essenciais
      • Crie uma rotina de atividades offline (exercícios, leitura, hobbies)
      • Converse com amigos e familiares sobre seus hábitos
      • Considere buscar orientação profissional se sentir dificuldade
      
      📞 Recursos de apoio:
      • CVV (Centro de Valorização da Vida): 188
      • CAPS (Centro de Atenção Psicossocial): Consulte sua cidade
    `,
    
    'Uso problemático / dependência severa': `
      🚨 ALERTA! Sinais de dependência digital severa detectados.
      
      É IMPORTANTE buscar ajuda profissional:
      
      🏥 Recursos disponíveis:
      • Psicólogo especializado em dependência digital
      • CAPS (Centro de Atenção Psicossocial)
      • CVV - Centro de Valorização da Vida: 188 (24h)
      • Grupos de apoio sobre uso consciente da tecnologia
      
      💪 Primeiros passos:
      • Converse com alguém de confiança sobre isso
      • Estabeleça horários fixos sem internet
      • Peça ajuda à família/amigos para monitorar seu uso
      • Procure atividades alternativas que te deem prazer
      
      ⚠️ Não ignore esses sinais. A dependência digital é real e tratável.
    `
  }

  return recomendacoes[classificacao] || 'Classificação não identificada.'
}

module.exports = { calcularPontuacao, gerarRecomendacoes }
