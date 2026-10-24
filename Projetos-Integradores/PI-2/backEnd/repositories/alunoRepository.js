import { openDb } from '../database/conexao.js';

export class AlunoRepository {
  static async cadastrar(aluno) {
    const db = await openDb();
    try {
      const [result] = await db.execute(
        'INSERT INTO ALUNOS (RA, NOME, EMAIL, TELEFONE) VALUES (?, ?, ?, ?)',
        [aluno.ra, aluno.nome, aluno.email, aluno.telefone]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao cadastrar aluno:', error);
      throw error;
    } finally {
      await db.end();
    }
  }

  static async buscarPorRA(ra) {
    const db = await openDb();
    try {
      const [rows] = await db.execute('SELECT * FROM ALUNOS WHERE RA = ?', [ra]);
      return rows[0];
    } catch (error) {
      console.error('Erro ao buscar aluno por RA:', error);
      throw error;
    } finally {
      await db.end();
    }
  }
}
