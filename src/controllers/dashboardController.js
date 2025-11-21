// backend/controllers/dashboardController.js
const sequelize = require('../config/database')
const { QueryTypes } = require('sequelize')
const XLSX = require('xlsx')
const geminiService = require('../services/geminiService')

exports.estatisticasGerais = async (req, res) => {
  try {
    // Total de respondentes
    const totalResult = await sequelize.query(
      'SELECT COUNT(*) as total FROM resultados',
      { type: QueryTypes.SELECT }
    )
    const total = totalResult[0].total

    // Contagem por classificação
    const classificacoes = await sequelize.query(`
      SELECT 
        classificacao,
        COUNT(*) as quantidade,
        ROUND((COUNT(*) * 100.0 / :total), 2) as percentual
      FROM resultados
      GROUP BY classificacao
    `, {
      replacements: { total },
      type: QueryTypes.SELECT
    })

    // Organiza os dados
    const estatisticas = {
      total,
      classificacoes: {
        'Uso saudável e equilibrado': {
          quantidade: 0,
          percentual: 0,
          cor: '#10b981' // verde
        },
        'Uso moderado / controlado': {
          quantidade: 0,
          percentual: 0,
          cor: '#fbbf24' // amarelo
        },
        'Uso excessivo': {
          quantidade: 0,
          percentual: 0,
          cor: '#f97316' // laranja
        },
        'Uso problemático / dependência severa': {
          quantidade: 0,
          percentual: 0,
          cor: '#ef4444' // vermelho
        }
      }
    }

    // Preenche com os dados reais
    classificacoes.forEach(item => {
      if (estatisticas.classificacoes[item.classificacao]) {
        estatisticas.classificacoes[item.classificacao].quantidade = item.quantidade
        estatisticas.classificacoes[item.classificacao].percentual = parseFloat(item.percentual)
      }
    })

    res.json({
      success: true,
      data: estatisticas
    })

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

exports.dadosGraficos = async (req, res) => {
  try {
    // Dados por faixa etária
    const faixaEtaria = await sequelize.query(`
      SELECT 
        p.idade as faixa,
        COUNT(*) as total
      FROM respostas_perfil p
      INNER JOIN respondentes r ON p.respondente_id = r.id
      GROUP BY p.idade
      ORDER BY 
        CASE p.idade
          WHEN 'Menos de 13 anos' THEN 1
          WHEN '13 a 17 anos' THEN 2
          WHEN '18 a 24 anos' THEN 3
          WHEN '25 a 34 anos' THEN 4
          WHEN '35 a 44 anos' THEN 5
          WHEN '45 a 59 anos' THEN 6
          WHEN '60 anos ou mais' THEN 7
        END
    `, { type: QueryTypes.SELECT })

    // Dados por uso principal
    const usoPrincipal = await sequelize.query(`
      SELECT 
        p.uso_principal,
        COUNT(*) as total
      FROM respostas_perfil p
      INNER JOIN respondentes r ON p.respondente_id = r.id
      GROUP BY p.uso_principal
      ORDER BY total DESC
    `, { type: QueryTypes.SELECT })

    res.json({
      success: true,
      data: {
        faixaEtaria,
        usoPrincipal
      }
    })

  } catch (error) {
    console.error('Erro ao buscar dados dos gráficos:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

exports.relatorioDetalhado = async (req, res) => {
  try {
    const resultados = await sequelize.query(`
      SELECT 
        r.codigo_anonimo,
        res.classificacao,
        res.pontuacao_total,
        p.idade,
        p.genero,
        p.regiao,
        p.uso_principal,
        r.created_at
      FROM resultados res
      INNER JOIN respondentes r ON res.respondente_id = r.id
      INNER JOIN respostas_perfil p ON r.id = p.respondente_id
      ORDER BY r.created_at DESC
      LIMIT 100
    `, { type: QueryTypes.SELECT })

    res.json({
      success: true,
      data: resultados
    })

  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

exports.exportarDados = async (req, res) => {
  try {
    // Implementação futura para exportar CSV/Excel
    res.json({
      success: false,
      message: 'Funcionalidade de exportação ainda não implementada'
    })

  } catch (error) {
    console.error('Erro ao exportar dados:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao exportar dados',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

exports.gerarRelatorioIA = async (req, res) => {
  try {
    console.log('🤖 Iniciando análise com IA Gemini...')

    // Busca todas as respostas do questionário
    const respostas = await sequelize.query(`
      SELECT 
        r.codigo_anonimo,
        res.classificacao,
        res.pontuacao_total,
        p.idade,
        p.genero,
        p.regiao,
        p.uso_principal,
        p.horario,
        rq.*
      FROM resultados res
      INNER JOIN respondentes r ON res.respondente_id = r.id
      INNER JOIN respostas_perfil p ON r.id = p.respondente_id
      INNER JOIN respostas_questionario rq ON r.id = rq.respondente_id
    `, { type: QueryTypes.SELECT })

    if (!respostas.length) {
      return res.json({
        success: true,
        data: {
          alertas: [{
            tipo: 'alerta',
            mensagem: 'Nenhum dado disponível para análise ainda.'
          }],
          sugestoes: ['Aguarde mais respondentes para gerar insights significativos.']
        }
      })
    }

    // Chama o serviço do Gemini
    const resultado = await geminiService.analisarDados(respostas)

    if (resultado.success) {
      console.log('✅ Análise da IA Gemini concluída!')
      res.json({
        success: true,
        data: resultado.data
      })
    } else {
      // Fallback para análise manual
      console.log('⚠️ Erro na IA, usando análise manual como fallback:', resultado.error)
      const insights = analisarDadosManual(respostas)
      res.json({
        success: true,
        data: insights,
        warning: 'Análise manual utilizada devido a erro na IA'
      })
    }

  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error)
    
    try {
      // Em caso de erro, busca dados novamente e retorna análise manual
      const respostas = await sequelize.query(`
        SELECT 
          r.codigo_anonimo,
          res.classificacao,
          res.pontuacao_total,
          p.idade,
          rq.*
        FROM resultados res
        INNER JOIN respondentes r ON res.respondente_id = r.id
        INNER JOIN respostas_perfil p ON r.id = p.respondente_id
        INNER JOIN respostas_questionario rq ON r.id = rq.respondente_id
      `, { type: QueryTypes.SELECT })

      const insights = analisarDadosManual(respostas)
      
      res.json({
        success: true,
        data: insights,
        warning: 'Análise manual utilizada devido a erro no sistema'
      })
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: 'Erro ao gerar relatório',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
}

exports.exportarExcel = async (req, res) => {
  try {
    console.log('📊 Iniciando exportação para Excel...')

    // Busca todos os dados
    const dados = await sequelize.query(`
      SELECT 
        r.codigo_anonimo as 'Código',
        DATE_FORMAT(r.created_at, '%d/%m/%Y %H:%i') as 'Data/Hora',
        res.pontuacao_total as 'Pontuação',
        res.classificacao as 'Classificação',
        p.idade as 'Idade',
        p.genero as 'Gênero',
        p.regiao as 'Região',
        p.localidade as 'Localidade',
        p.ocupacao as 'Ocupação',
        p.escolaridade as 'Escolaridade',
        p.renda as 'Renda',
        p.dispositivo as 'Dispositivo',
        p.horario as 'Horário',
        p.uso_principal as 'Uso Principal',
        rq.pergunta_1 as 'P1', rq.pergunta_2 as 'P2', rq.pergunta_3 as 'P3', 
        rq.pergunta_4 as 'P4', rq.pergunta_5 as 'P5', rq.pergunta_6 as 'P6', 
        rq.pergunta_7 as 'P7', rq.pergunta_8 as 'P8', rq.pergunta_9 as 'P9', 
        rq.pergunta_10 as 'P10', rq.pergunta_11 as 'P11', rq.pergunta_12 as 'P12',
        rq.pergunta_13 as 'P13', rq.pergunta_14 as 'P14', rq.pergunta_15 as 'P15',
        rq.pergunta_16 as 'P16', rq.pergunta_17 as 'P17', rq.pergunta_18 as 'P18',
        rq.pergunta_19 as 'P19', rq.pergunta_20 as 'P20'
      FROM resultados res
      INNER JOIN respondentes r ON res.respondente_id = r.id
      INNER JOIN respostas_perfil p ON r.id = p.respondente_id
      INNER JOIN respostas_questionario rq ON r.id = rq.respondente_id
      ORDER BY r.created_at DESC
    `, { type: QueryTypes.SELECT })

    console.log(`✅ ${dados.length} registros encontrados`)

    if (dados.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Nenhum dado encontrado para exportar'
      })
    }

    // Cria workbook
    const wb = XLSX.utils.book_new()
    
    // Converte dados para sheet
    const ws = XLSX.utils.json_to_sheet(dados)
    
    // Ajusta largura das colunas
    const wscols = [
      { wch: 20 }, // Código
      { wch: 18 }, // Data/Hora
      { wch: 10 }, // Pontuação
      { wch: 35 }, // Classificação
      { wch: 15 }, // Idade
      { wch: 15 }, // Gênero
      { wch: 15 }, // Região
      { wch: 20 }, // Localidade
      { wch: 20 }, // Ocupação
      { wch: 25 }, // Escolaridade
      { wch: 20 }, // Renda
      { wch: 20 }, // Dispositivo
      { wch: 15 }, // Horário
      { wch: 30 }, // Uso Principal
    ]
    
    // Adiciona 20 colunas para as perguntas (P1-P20)
    for (let i = 0; i < 20; i++) {
      wscols.push({ wch: 5 })
    }
    
    ws['!cols'] = wscols
    
    // Adiciona sheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Respostas DigiSaúde')

    // Gera buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    console.log('✅ Excel gerado com sucesso!')

    // Define headers para download
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const filename = `digisaude_relatorio_${timestamp}.xlsx`

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Length', buffer.length)

    res.send(buffer)

  } catch (error) {
    console.error('❌ Erro ao exportar Excel:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao exportar dados',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Função auxiliar para análise manual (fallback)
function analisarDadosManual(respostas) {
  if (!respostas.length) {
    return {
      alertas: [{
        tipo: 'alerta',
        mensagem: 'Nenhum dado disponível para análise ainda.'
      }],
      sugestoes: ['Aguarde mais respondentes para gerar insights significativos.']
    }
  }

  const alertas = []
  const sugestoes = []
}
