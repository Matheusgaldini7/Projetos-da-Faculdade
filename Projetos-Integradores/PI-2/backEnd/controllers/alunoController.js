import { AlunoRepository } from '../repositories/alunoRepository.js';
import Aluno from '../models/Aluno.js';
import Comunicado from '../models/Comunicado.js';
import { openDb } from "../database/conexao.js";

export const cadastrarAluno = async (req, res) => {
  const { ra, nome, email, telefone } = req.body;

  const aluno = new Aluno(ra, nome, email, telefone);

  if (!ra || !nome || !email || !telefone) {
    return res.status(400).json(new Comunicado('Dados incompletos', 'Todos os campos são obrigatórios.'));
  }

  // Validação de formato para RA (apenas números, mínimo 5 e máximo 8 dígitos)
  if (!/^[0-9]{8}$/.test(ra)) {
    return res.status(400).json(new Comunicado('RA inválido', 'RA inválido. Deve conter exatamente 8 números.'));
  }

  // Validação de formato para Nome (apenas letras e espaços, mínimo 3 letras)
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]{3,}$/.test(nome)) {
    return res.status(400).json(new Comunicado('Nome inválido', 'O nome digitado é inválido. O nome deve conter apenas letras.'));
  }

  // Validação de formato para Email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json(new Comunicado('Email inválido', 'Email inválido.'));
  }

  // Validação de formato para Telefone (apenas números, mínimo 8 e máximo 11 dígitos)
  if (!/^[0-9]{8,11}$/.test(telefone)) {
    return res.status(400).json(new Comunicado('Telefone inválido', 'Telefone inválido. Deve conter apenas números, mínimo 8 e máximo 11 números.'));
  }

  try {
    const alunoExistente = await AlunoRepository.buscarPorRA(ra);
    if (alunoExistente) {
      return res.status(409).json(new Comunicado('Aluno já cadastrado', 'Aluno com este RA já cadastrado.'));
    }

    await AlunoRepository.cadastrar(aluno);
    res.status(201).json(new Comunicado('Sucesso', 'Aluno cadastrado com sucesso!'));
  } catch (error) {
    console.error('Erro no controller de cadastro de aluno:', error);
    console.error('Stack trace:', error.stack);
    const mensagemErro = error.message || 'Erro interno do servidor.';
    res.status(500).json(new Comunicado('Erro interno do servidor', mensagemErro));
  }
};

/**
 * Consulta a pontuação de um aluno específico (últimos 6 meses)
 */
export const VisualizarPontuacao = async (req, res) => {
  const { ra } = req.params;

  try {
    // 1) Validação do RA
    if (!ra) return res.status(400).json({ erro: true, mensagem: "O RA deve ser informado." });
    if (!/^[0-9]{8}$/.test(ra)) {
      return res.status(400).json({ erro: true, mensagem: "O RA deve conter exatamente 8 números." });
    }


    // 2) Verificar se aluno existe
    const aluno = await AlunoRepository.buscarPorRA(ra);
    if (!aluno) return res.status(404).json({ erro: true, mensagem: "Aluno não encontrado." });

    // 3) Buscar livros lidos últimos 6 meses (DATA + HORA)
    const db = await openDb();

    const [linhas] = await db.execute(
      `SELECT 
          l.CODIGO AS codigo,
          l.TITULO AS titulo,
          CONCAT(
            DATE_FORMAT(e.DATA_DEVOLUCAO, '%Y-%m-%d'),
            ' ',
            DATE_FORMAT(e.HORA_DEVOLUCAO, '%H:%i:%s')
          ) AS datahora
       FROM EMPRESTIMOS e
       JOIN LIVROS l ON l.CODIGO = e.CODIGO_LIVRO
       WHERE e.RA_ALUNO = ?
         AND e.DATA_DEVOLUCAO IS NOT NULL
         AND e.DATA_DEVOLUCAO >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       ORDER BY e.DATA_DEVOLUCAO DESC`,
      [ra]
    );

    await db.end();

    // 4) Calcular classificação
    const totalLivros = linhas.length;
    const classificacao =
      totalLivros <= 5 ? "Leitor Iniciante" :
      totalLivros <= 10 ? "Leitor Regular" :
      totalLivros <= 20 ? "Leitor Ativo" :
      "Leitor Extremo";

    // 5) Retornar
    return res.status(200).json({
      erro: false,
      ra,
      totalLivros,
      classificacao,
      livros: linhas
    });

  } catch (error) {
    return res.status(500).json({ erro: true, mensagem: "Erro interno ao consultar pontuação." });
  }
};

/**
 * Classificação geral de todos os alunos no último semestre (6 meses)
 * Retorna o total de livros lidos, classificação e resumo por nível.
 */
export const ClassificacaoGeral = async (_req, res) => {
  try {
    const db = await openDb();

    const [linhas] = await db.execute(
      `SELECT 
         a.RA   AS ra,
         a.NOME AS nome,
         SUM(
           CASE 
             WHEN e.DATA_DEVOLUCAO IS NOT NULL
              AND e.DATA_DEVOLUCAO >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
             THEN 1 
             ELSE 0 
           END
         ) AS totalLivros
       FROM ALUNOS a
       LEFT JOIN EMPRESTIMOS e ON e.RA_ALUNO = a.RA
       GROUP BY a.RA, a.NOME
       ORDER BY totalLivros DESC, a.NOME ASC`
    );

    await db.end();

    // Monta ranking com mesma lógica de classificação do VisualizarPontuacao
    const ranking = linhas.map((linha) => {
      const total = Number(linha.totalLivros) || 0;
      const classificacao =
        total <= 5 ? "Leitor Iniciante" :
        total <= 10 ? "Leitor Regular" :
        total <= 20 ? "Leitor Ativo" :
        "Leitor Extremo";

      return {
        ra: linha.ra,
        nome: linha.nome,
        totalLivros: total,
        classificacao,
      };
    });

    // Resumo por nível para os cards da tela
    const resumo = {
      iniciantes: 0,
      regulares: 0,
      ativos: 0,
      extremos: 0,
    };

    for (const aluno of ranking) {
      switch (aluno.classificacao) {
        case "Leitor Iniciante":
          resumo.iniciantes += 1;
          break;
        case "Leitor Regular":
          resumo.regulares += 1;
          break;
        case "Leitor Ativo":
          resumo.ativos += 1;
          break;
        case "Leitor Extremo":
          resumo.extremos += 1;
          break;
        default:
          break;
      }
    }

    return res.status(200).json({
      erro: false,
      totalAlunos: ranking.length,
      resumo,
      ranking,
    });
  } catch (error) {
    console.error('Erro ao consultar classificação geral dos alunos:', error);
    return res.status(500).json({ erro: true, mensagem: "Erro interno ao consultar classificação geral." });
  }
};
