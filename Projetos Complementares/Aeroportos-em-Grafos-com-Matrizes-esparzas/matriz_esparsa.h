#ifndef MATRIZ_ESPARSA_H
#define MATRIZ_ESPARSA_H

/* =========================================================
 * Matriz Esparsa Genérica — implementada como lista de nós
 * Cada célula não-nula armazena um ponteiro void* (dado)
 * ========================================================= */

typedef struct NoMatriz {
    int linha;
    int coluna;
    void *dado;           /* ponteiro genérico */
    struct NoMatriz *prox_linha;   /* próximo na mesma linha */
    struct NoMatriz *prox_coluna;  /* próximo na mesma coluna */
} NoMatriz;

typedef struct {
    NoMatriz **cabecas_linha;  /* vetor de ponteiros para 1º nó de cada linha */
    NoMatriz **cabecas_coluna; /* vetor de ponteiros para 1º nó de cada coluna */
    int linhas;
    int colunas;
    int tamanho_dado;          /* sizeof do tipo armazenado */
} MatrizEsparsa;

/* Cria a matriz com dimensões iniciais e tamanho do dado */
MatrizEsparsa *matriz_criar(int linhas, int colunas, int tamanho_dado);

/* Redimensiona (expande) a matriz — usado quando se adiciona aeroporto */
int matriz_redimensionar(MatrizEsparsa *m, int novas_linhas, int novas_colunas);

/* Insere/atualiza célula (lin, col) com o valor apontado por dado */
int matriz_inserir(MatrizEsparsa *m, int lin, int col, void *dado);

/* Remove a célula (lin, col); retorna 1 se removeu, 0 se não existia */
int matriz_remover(MatrizEsparsa *m, int lin, int col);

/* Retorna ponteiro para o dado em (lin, col) ou NULL se inexistente */
void *matriz_obter(MatrizEsparsa *m, int lin, int col);

/* Libera toda a memória da matriz */
void matriz_destruir(MatrizEsparsa *m);

#endif