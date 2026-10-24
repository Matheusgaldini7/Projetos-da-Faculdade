import { openDb } from '../database/conexao.js';

export class LivroRepository {
  
  static async cadastrar(livro) {
    const db = await openDb();
    try {
      const [result] = await db.execute(
        'INSERT INTO LIVROS (CODIGO, TITULO, AUTOR, QTD, CATEGORIA, EDITORA) VALUES (?, ?, ?, ?, ?, ?)',
        [livro.codigo, livro.titulo, livro.autor, livro.quantidade, livro.categoria, livro.editora]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao cadastrar livro:', error);
      throw error;
    } finally {
      await db.end();
    }
  }

  static async buscarTodos() {
    const db = await openDb();
    try {
      const [rows] = await db.execute('SELECT * FROM LIVROS');
      return rows;
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      throw error;
    } finally {
      await db.end();
    }
  }

  static async buscarPorCodigo(codigo) {
    const db = await openDb();
    try {
      const [rows] = await db.execute('SELECT * FROM LIVROS WHERE CODIGO = ?', [codigo]);
      return rows[0];
    } catch (error) {
      console.error('Erro ao buscar livro por código:', error);
      throw error;
    } finally {
      await db.end();
    }
  }

  static async atualizar(codigo, dadosAtualizados) {
    const db = await openDb();
    const {
      titulo,
      autor,
      quantidade,
      categoria,
      editora
    } = dadosAtualizados;

    const novoStatus = quantidade > 0 ? 'Disponível' : 'Emprestado';

    try {
      const [result] = await db.execute(
        `UPDATE LIVROS
         SET TITULO = ?, AUTOR = ?, QTD = ?, CATEGORIA = ?, EDITORA = ?, STATUS = ?
         WHERE CODIGO = ?`,
        [titulo, autor, quantidade, categoria, editora, novoStatus, codigo]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao atualizar livro:', error);
      throw error;
    } finally {
      await db.end();
    }
  }

  static async deletar(codigo) {
    const db = await openDb();
    try {
      // Inicia uma transação
      await db.beginTransaction();
      
      // Desabilita temporariamente as verificações de foreign key
      await db.execute('SET FOREIGN_KEY_CHECKS = 0');
      
      // Primeiro, deleta os empréstimos relacionados ao livro
      await db.execute('DELETE FROM EMPRESTIMOS WHERE CODIGO_LIVRO = ?', [String(codigo)]);
      
      // Depois, deleta o livro
      const [result] = await db.execute('DELETE FROM LIVROS WHERE CODIGO = ?', [String(codigo)]);
      
      // Reabilita as verificações de foreign key
      await db.execute('SET FOREIGN_KEY_CHECKS = 1');
      
      // Confirma a transação
      await db.commit();
      
      return result.affectedRows > 0;
    } catch (error) {
      // Reabilita as verificações de foreign key em caso de erro
      try {
        await db.execute('SET FOREIGN_KEY_CHECKS = 1');
      } catch (e) {
        // Ignora erro ao reabilitar
      }
      // Reverte a transação em caso de erro
      await db.rollback();
      console.error('Erro ao deletar livro:', error);
      throw error;
    } finally {
      await db.end();
    }
  }
}
