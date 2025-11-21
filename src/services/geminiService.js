const geminiService = {
  async analisarDados(dadosRespostas) {
    try {
      console.log('Preparando dados para analise...')

      const estatisticas = this.prepararEstatisticas(dadosRespostas)
      console.log('Enviando dados para o Gemini 2.5 Flash...')

      const prompt = 'Voce e um especialista em saude digital e comportamento online. Analise os dados abaixo de uma pesquisa sobre uso da internet e dependencia digital:\n\n' +
        '## DADOS DA PESQUISA:\n' +
        '- Total de respondentes: ' + estatisticas.total + '\n\n' +
        '### Classificacoes:\n' +
        estatisticas.classificacoes.map(c => '- ' + c.classificacao + ': ' + c.quantidade + ' pessoas (' + c.percentual + '%)').join('\n') + '\n\n' +
        '### Distribuicao por Idade:\n' +
        estatisticas.faixaEtaria.map(f => '- ' + f.faixa + ': ' + f.total + ' pessoas').join('\n') + '\n\n' +
        '### Contextos de Uso:\n' +
        estatisticas.usoPrincipal.map(u => '- ' + u.uso + ': ' + u.total + ' pessoas').join('\n') + '\n\n' +
        '### Analise das Respostas (escala 1-5, onde 1 e muito problematico e 5 e saudavel):\n' +
        estatisticas.analisePerguntas + '\n\n' +
        '## SUA TAREFA:\n' +
        'Com base nesses dados, forneca uma analise critica e pratica:\n\n' +
        '1. ALERTAS (identifique 1 a 3 alertas principais):\n' +
        '   - Para cada alerta, classifique como: "critico", "alerta" ou "sucesso"\n' +
        '   - Seja especifico com porcentagens e dados concretos dos resultados\n' +
        '   - Foque nos problemas mais graves encontrados\n\n' +
        '2. SUGESTOES DE ACAO (3 a 5 sugestoes praticas e aplicaveis):\n' +
        '   - Propostas concretas baseadas nos dados analisados\n' +
        '   - Focadas em saude publica e bem-estar digital\n' +
        '   - Considerando diferentes faixas etarias e contextos de uso\n' +
        '   - Acoes que podem ser implementadas por gestores publicos\n\n' +
        'IMPORTANTE: Responda APENAS com um objeto JSON valido, sem texto adicional, sem markdown. Apenas o JSON puro no formato:\n\n' +
        '{\n' +
        '  "alertas": [\n' +
        '    {\n' +
        '      "tipo": "critico",\n' +
        '      "mensagem": "texto do alerta"\n' +
        '    }\n' +
        '  ],\n' +
        '  "sugestoes": [\n' +
        '    "sugestao 1",\n' +
        '    "sugestao 2"\n' +
        '  ]\n' +
        '}'

      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ]
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Erro na API do Gemini:', errorData)
        throw new Error('API Error: ' + response.status + ' - ' + JSON.stringify(errorData))
      }

      const data = await response.json()
      console.log('Resposta recebida do Gemini 2.5')

      const text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] ? data.candidates[0].content.parts[0].text : null

      if (!text) {
        throw new Error('Resposta vazia da API')
      }

      let cleanText = text.trim()
      cleanText = cleanText.replace(/```json\n?/g, '')
      cleanText = cleanText.replace(/```\n?/g, '')
      cleanText = cleanText.trim()

      const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('Resposta da IA nao esta no formato JSON esperado')
        console.log('Resposta recebida:', text)
        throw new Error('Resposta da IA nao esta no formato JSON esperado')
      }

      const insights = JSON.parse(jsonMatch[0])

      if (!insights.alertas || !insights.sugestoes) {
        throw new Error('Estrutura do JSON invalida')
      }

      console.log('Analise da IA Gemini 2.5 concluida com sucesso!')

      return {
        success: true,
        data: insights
      }

    } catch (error) {
      console.error('Erro ao chamar Gemini API:', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  },

  prepararEstatisticas(respostas) {
    if (!respostas.length) {
      return {
        total: 0,
        classificacoes: [],
        faixaEtaria: [],
        usoPrincipal: [],
        analisePerguntas: 'Sem dados suficientes'
      }
    }

    const classificacoes = {}
    respostas.forEach(function(r) {
      if (!classificacoes[r.classificacao]) {
        classificacoes[r.classificacao] = 0
      }
      classificacoes[r.classificacao]++
    })

    const faixaEtaria = {}
    respostas.forEach(function(r) {
      if (!faixaEtaria[r.idade]) {
        faixaEtaria[r.idade] = 0
      }
      faixaEtaria[r.idade]++
    })

    const usoPrincipal = {}
    respostas.forEach(function(r) {
      if (!usoPrincipal[r.uso_principal]) {
        usoPrincipal[r.uso_principal] = 0
      }
      usoPrincipal[r.uso_principal]++
    })

    const perguntasCriticas = [
      { num: 8, descricao: 'Impacto no trabalho/estudos' },
      { num: 10, descricao: 'Controle do tempo online' },
      { num: 14, descricao: 'Problemas de sono' },
      { num: 17, descricao: 'Irritacao ao ser interrompido' },
      { num: 19, descricao: 'Isolamento social (preferencia por online)' },
      { num: 20, descricao: 'Dependencia emocional (ansiedade/depressao offline)' }
    ]

    let analisePerguntas = perguntasCriticas.map(function(p) {
      const valores = respostas.map(function(r) { return r['pergunta_' + p.num] }).filter(function(v) { return v !== null && v !== undefined })
      if (valores.length === 0) return '- Pergunta ' + p.num + ' (' + p.descricao + '): sem dados'

      const soma = valores.reduce(function(acc, val) { return acc + val }, 0)
      const media = (soma / valores.length).toFixed(2)
      const problematicosPct = ((valores.filter(function(v) { return v <= 2 }).length / valores.length) * 100).toFixed(0)

      return '- Pergunta ' + p.num + ' (' + p.descricao + '): media ' + media + '/5, ' + problematicosPct + '% com pontuacao problematica (<=2)'
    }).join('\n')

    return {
      total: respostas.length,
      classificacoes: Object.entries(classificacoes).map(function(item) {
        return {
          classificacao: item[0],
          quantidade: item[1],
          percentual: ((item[1] / respostas.length) * 100).toFixed(1)
        }
      }),
      faixaEtaria: Object.entries(faixaEtaria).map(function(item) {
        return {
          faixa: item[0],
          total: item[1]
        }
      }),
      usoPrincipal: Object.entries(usoPrincipal)
        .map(function(item) { 
          return { uso: item[0], total: item[1] } 
        })
        .sort(function(a, b) { return b.total - a.total })
        .slice(0, 5),
      analisePerguntas: analisePerguntas
    }
  }
}

module.exports = geminiService
