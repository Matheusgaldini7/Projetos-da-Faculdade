import express from "express";
import { registrarEmprestimo, registrarDevolucao, getEmprestimos, getEmprestimosAtivos, getEmprestimosAtivosPorAluno } from "../controllers/emprestimoController.js";

const router = express.Router();

// Listagens
router.get("/", getEmprestimos);
router.get("/ativos", getEmprestimosAtivos);
router.get("/ativos/aluno/:ra", getEmprestimosAtivosPorAluno);

// Rotas para retirada e devolução
router.post("/retirada", registrarEmprestimo);
router.post("/devolucao", registrarDevolucao);

export default router;
