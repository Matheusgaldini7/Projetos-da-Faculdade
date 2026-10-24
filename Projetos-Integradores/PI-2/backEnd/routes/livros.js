import express from 'express';
import { cadastrarLivro, getLivros, getLivroPorCodigo, atualizarLivro, deletarLivro } from '../controllers/livroController.js';

const router = express.Router();

router.post('/', cadastrarLivro);
router.get('/', getLivros);
router.get('/:codigo', getLivroPorCodigo);
router.put('/:codigo', atualizarLivro);
router.delete('/:codigo', deletarLivro);

export default router;


