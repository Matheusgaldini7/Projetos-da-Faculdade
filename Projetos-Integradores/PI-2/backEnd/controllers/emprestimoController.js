import { EmprestimoRepository } from '../repositories/emprestimoRepository.js';
import Comunicado from '../models/Comunicado.js';

// Registrar retirada de livro (empréstimo)
export async function registrarEmprestimo(req, res) {
  const { ra, codigoLivro } = req.body;

  if (!ra || !codigoLivro) {
    const erro = new Comunicado('Erro', 'RA e código do livro são obrigatórios.');
    return res.status(400).json(erro);
  }

  // Validação de tipos
  if (typeof ra !== 'string' || typeof codigoLivro !== 'string') {
    const erro = new Comunicado('Erro', 'RA e código do livro devem ser strings.');
    return res.status(400).json(erro);
  }

  // Normalizar dados
  const raTrimmed = ra.trim();
  const codigoLivroTrimmed = codigoLivro.trim();

  if (raTrimmed.length === 0 || codigoLivroTrimmed.length === 0) {
    const erro = new Comunicado('Erro', 'RA e código do livro não podem estar vazios.');
    return res.status(400).json(erro);
  }

  try {
    const retorno = await EmprestimoRepository.registrarEmprestimo(raTrimmed, codigoLivroTrimmed);
    
    console.log('Retorno do repository (empréstimo):', retorno);
    
    const sucesso = new Comunicado('Sucesso', 'Empréstimo registrado com sucesso!');

    // FRONT RECEBER A DATA E HORA
    const resposta = {
      status: sucesso.status,
      mensagem: sucesso.mensagem,
      dataEmprestimo: retorno.dataEmprestimo,
      horaEmprestimo: retorno.horaEmprestimo
    };
    
    console.log('Resposta enviada ao frontend (empréstimo):', resposta);
    
    return res.status(201).json(resposta);

  } catch (error) {
    console.error('Erro no controller (registrarEmprestimo):', error);
    const erro = new Comunicado('Erro', error.message || 'Erro ao registrar empréstimo.');
    return res.status(500).json(erro);
  }
}

// Registrar devolução de livro
export async function registrarDevolucao(req, res) {
  const { ra, codigoLivro } = req.body;

  if (!ra || !codigoLivro) {
    const erro = new Comunicado('Erro', 'RA e código do livro são obrigatórios.');
    return res.status(400).json(erro);
  }

  // Validação de tipos
  if (typeof ra !== 'string' || typeof codigoLivro !== 'string') {
    const erro = new Comunicado('Erro', 'RA e código do livro devem ser strings.');
    return res.status(400).json(erro);
  }

  // Normalizar dados
  const raTrimmed = ra.trim();
  const codigoLivroTrimmed = codigoLivro.trim();

  if (raTrimmed.length === 0 || codigoLivroTrimmed.length === 0) {
    const erro = new Comunicado('Erro', 'RA e código do livro não podem estar vazios.');
    return res.status(400).json(erro);
  }

  try {
    const retorno = await EmprestimoRepository.registrarDevolucao(raTrimmed, codigoLivroTrimmed);
    
    console.log('Retorno do repository (devolução):', retorno);
    
    const sucesso = new Comunicado('Sucesso', 'Devolução registrada com sucesso!');

    // FRONT RECEBER A DATA E HORA
    const resposta = {
      status: sucesso.status,
      mensagem: sucesso.mensagem,
      dataDevolucao: retorno.dataDevolucao,
      horaDevolucao: retorno.horaDevolucao
    };
    
    console.log('Resposta enviada ao frontend (devolução):', resposta);
    
    return res.status(200).json(resposta);

  } catch (error) {
    console.error('Erro no controller (registrarDevolucao):', error);
    const erro = new Comunicado('Erro', error.message || 'Erro ao registrar devolução.');
    return res.status(500).json(erro);
  }
}

// Buscar todos os empréstimos
export async function getEmprestimos(req, res) {
  try {
    const emprestimos = await EmprestimoRepository.buscarTodos();
    return res.status(200).json(emprestimos);
  } catch (error) {
    console.error('Erro no controller (getEmprestimos):', error);
    const erro = new Comunicado('Erro', 'Erro ao buscar empréstimos.');
    return res.status(500).json(erro);
  }
}

// Buscar todos os empréstimos ativos
export async function getEmprestimosAtivos(req, res) {
  try {
    const emprestimos = await EmprestimoRepository.buscarAtivos();
    return res.status(200).json(emprestimos);
  } catch (error) {
    console.error('Erro no controller (getEmprestimosAtivos):', error);
    const erro = new Comunicado('Erro', 'Erro ao buscar empréstimos ativos.');
    return res.status(500).json(erro);
  }
}

// Buscar empréstimos ativos de um aluno
export async function getEmprestimosAtivosPorAluno(req, res) {
  const { ra } = req.params;

  if (!ra || typeof ra !== 'string' || ra.trim().length === 0) {
    const erro = new Comunicado('Erro', 'RA do aluno é obrigatório.');
    return res.status(400).json(erro);
  }

  try {
    const emprestimos = await EmprestimoRepository.buscarAtivosPorAluno(ra.trim());
    return res.status(200).json(emprestimos);
  } catch (error) {
    console.error('Erro no controller (getEmprestimosAtivosPorAluno):', error);
    const erro = new Comunicado('Erro', 'Erro ao buscar empréstimos ativos.');
    return res.status(500).json(erro);
  }
}