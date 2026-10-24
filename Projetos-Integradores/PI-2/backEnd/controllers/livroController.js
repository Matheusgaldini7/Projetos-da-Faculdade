import { LivroRepository } from '../repositories/livroRepository.js';
import Livro from '../models/Livro.js';
import Comunicado from '../models/Comunicado.js';

const soLetras = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

function validarCamposLivro({ codigo, titulo, autor, quantidade, categoria, editora }, ignorarCodigo = false) {
  if (!ignorarCodigo) {
    if (codigo === undefined || codigo === null || isNaN(codigo) || !Number.isInteger(Number(codigo))) {
      return new Comunicado('Código inválido', 'O código deve conter apenas números inteiros.');
    }
  }

  if ([titulo, autor, categoria, editora].some((campo) => !campo || String(campo).trim().length === 0)) {
    return new Comunicado('Dados incompletos', 'Todos os campos são obrigatórios.');
  }

  if (quantidade === undefined || quantidade === null || isNaN(quantidade)) {
    return new Comunicado('Quantidade inválida', 'A quantidade deve ser um número >= 0.');
  }

  if (Number(quantidade) < 0) {
    return new Comunicado('Quantidade inválida', 'A quantidade deve ser um número >= 0.');
  }

  if (!soLetras.test(titulo)) {
    return new Comunicado('Título inválido', 'O título deve conter apenas letras e espaços.');
  }

  if (!soLetras.test(autor)) {
    return new Comunicado('Autor inválido', 'O nome do autor deve conter apenas letras e espaços.');
  }

  if (!soLetras.test(categoria)) {
    return new Comunicado('Categoria inválida', 'A categoria deve conter apenas letras e espaços.');
  }

  if (!soLetras.test(editora)) {
    return new Comunicado('Editora inválida', 'A editora deve conter apenas letras e espaços.');
  }

  return null;
}

//   CADASTRAR LIVRO

export const cadastrarLivro = async (req, res) => {
  try {
    const { codigo, titulo, autor, quantidade, categoria, editora } = req.body;

    const erroValidacao = validarCamposLivro({ codigo, titulo, autor, quantidade, categoria, editora });
    if (erroValidacao) {
      return res.status(400).json(erroValidacao);
    }

    const livroExistente = await LivroRepository.buscarPorCodigo(codigo);

    if (livroExistente) {
      return res.status(409)
        .json(new Comunicado('Livro já cadastrado', 'Código já cadastrado. Informe outro.'));
    }

    const livro = new Livro(codigo, titulo, autor, quantidade, categoria, editora);
    await LivroRepository.cadastrar(livro);

    return res.status(201)
      .json(new Comunicado('Sucesso', 'Livro cadastrado com sucesso!'));

  } catch (error) {
    console.error('Erro no controller de cadastro de livro:', error);
    return res.status(500)
      .json(new Comunicado('Erro interno do servidor', 'Erro interno do servidor.'));
  }
};



//   BUSCAR TODOS OS LIVROS

export const getLivros = async (req, res) => {
  try {
    const livros = await LivroRepository.buscarTodos();
    return res.status(200).json(livros);

  } catch (error) {
    console.error('Erro ao obter livros:', error);
    return res.status(500)
      .json(new Comunicado('Erro interno do servidor', 'Erro interno do servidor.'));
  }
};



//   BUSCAR LIVRO POR CÓDIGO

export const getLivroPorCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;

    const livro = await LivroRepository.buscarPorCodigo(codigo);

    if (!livro) {
      return res.status(404)
        .json(new Comunicado('Livro não encontrado', 'Nenhum livro com este código.'));
    }

    return res.status(200).json(livro);

  } catch (error) {
    console.error('Erro ao buscar livro por código:', error);
    return res.status(500)
      .json(new Comunicado('Erro interno do servidor', 'Erro interno do servidor.'));
  }
};

// ATUALIZAR LIVRO
export const atualizarLivro = async (req, res) => {
  try {
    const { codigo } = req.params;
    const { titulo, autor, quantidade, categoria, editora } = req.body;

    const livroExistente = await LivroRepository.buscarPorCodigo(codigo);
    if (!livroExistente) {
      return res.status(404).json(new Comunicado('Livro não encontrado', 'Registro inexistente.'));
    }

    const erroValidacao = validarCamposLivro({ titulo, autor, quantidade, categoria, editora }, true);
    if (erroValidacao) {
      return res.status(400).json(erroValidacao);
    }

    await LivroRepository.atualizar(codigo, {
      titulo,
      autor,
      quantidade: Number(quantidade),
      categoria,
      editora
    });

    return res.status(200).json(new Comunicado('Sucesso', 'Livro atualizado com sucesso!'));

  } catch (error) {
    console.error('Erro ao atualizar livro:', error);
    return res.status(500).json(new Comunicado('Erro interno do servidor', 'Erro interno do servidor.'));
  }
};

// DELETAR LIVRO
export const deletarLivro = async (req, res) => {
  try {
    const { codigo } = req.params;
    const livroExistente = await LivroRepository.buscarPorCodigo(codigo);

    if (!livroExistente) {
      return res.status(404).json(new Comunicado('Livro não encontrado', 'Registro inexistente.'));
    }

    await LivroRepository.deletar(codigo);

    return res.status(200).json(new Comunicado('Sucesso', 'Livro excluído com sucesso!'));

  } catch (error) {
    console.error('Erro ao deletar livro:', error);
    return res.status(500).json(new Comunicado('Erro interno do servidor', 'Erro interno do servidor.'));
  }
};
