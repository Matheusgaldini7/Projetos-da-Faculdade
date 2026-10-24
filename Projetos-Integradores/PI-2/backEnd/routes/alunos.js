import express from 'express';
import { cadastrarAluno, VisualizarPontuacao, ClassificacaoGeral } from '../controllers/alunoController.js';

const router = express.Router();

router.post('/', cadastrarAluno);
router.get('/pontuacao/:ra', VisualizarPontuacao);
router.get('/classificacao-geral', ClassificacaoGeral);

export default router;
