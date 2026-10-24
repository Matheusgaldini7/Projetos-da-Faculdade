#ifndef VETOR_DINAMICO_H
#define VETOR_DINAMICO_H

/* =========================================================
 * Vetor Dinâmico Genérico
 * Cresce e encolhe conforme necessário.
 * ========================================================= */

#define CAPACIDADE_INICIAL 4

typedef struct {
    void  *dados;       /* bloco contíguo de elementos */
    int    tamanho;     /* número de elementos atual */
    int    capacidade;  /* capacidade alocada */
    int    tamanho_elem;/* sizeof de cada elemento */
} VetorDinamico;

/* Cria vetor vazio para elementos de tamanho_elem bytes */
VetorDinamico *vetor_criar(int tamanho_elem);

/* Adiciona elemento no final; retorna índice ou -1 em falha */
int vetor_push(VetorDinamico *v, void *elem);

/* Remove elemento no índice idx; desloca os posteriores */
int vetor_remover(VetorDinamico *v, int idx);

/* Retorna ponteiro para elemento no índice idx ou NULL */
void *vetor_get(VetorDinamico *v, int idx);

/* Número de elementos no vetor */
int vetor_tamanho(VetorDinamico *v);

/* Libera memória do vetor */
void vetor_destruir(VetorDinamico *v);

#endif