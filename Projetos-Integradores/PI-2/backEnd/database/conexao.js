import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Julia180882*',
  database: process.env.DB_DATABASE || 'biblioteca'
};

export async function openDb() {
  return await mysql.createConnection(dbConfig);
}

export async function createTables() {
  const db = await openDb();

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ALUNOS (
        RA VARCHAR(8) PRIMARY KEY,
        NOME VARCHAR(100) NOT NULL,
        EMAIL VARCHAR(100) NOT NULL UNIQUE,
        TELEFONE VARCHAR(20) NOT NULL UNIQUE,
        PONTUACAO INT DEFAULT 0,
        CLASSIFICACAO ENUM('Iniciante', 'Regular', 'Ativo', 'Extremo') DEFAULT 'Iniciante'
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS LIVROS (
        CODIGO VARCHAR(255) PRIMARY KEY,
        TITULO VARCHAR(150) NOT NULL,
        AUTOR VARCHAR(100),
        QTD INT DEFAULT 1,
        CATEGORIA VARCHAR(50),
        EDITORA VARCHAR(100),
        STATUS ENUM('Disponível', 'Emprestado') DEFAULT 'Disponível'
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS EMPRESTIMOS (
        CODIGO INT AUTO_INCREMENT PRIMARY KEY,
        RA_ALUNO VARCHAR(8) NOT NULL,
        CODIGO_LIVRO VARCHAR(255) NOT NULL,
        DATA_EMPRESTIMO DATE DEFAULT (CURRENT_DATE),
        HORA_EMPRESTIMO TIME DEFAULT (CURRENT_TIME),
        DATA_DEVOLUCAO DATE,
        HORA_DEVOLUCAO TIME,
        FOREIGN KEY (RA_ALUNO) REFERENCES ALUNOS(RA),
        FOREIGN KEY (CODIGO_LIVRO) REFERENCES LIVROS(CODIGO)
      );
    `);
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
  } finally {
    await db.end();
  }
}
