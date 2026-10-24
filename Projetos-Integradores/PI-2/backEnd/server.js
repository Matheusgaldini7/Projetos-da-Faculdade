import { createTables } from './database/conexao.js';
import app from './app.js';

const PORT = process.env.PORT || 3000;

// Inicia o servidor e cria as tabelas no banco de dados
app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  await createTables();
  console.log('Tabelas verificadas/criadas no banco de dados.');
});
