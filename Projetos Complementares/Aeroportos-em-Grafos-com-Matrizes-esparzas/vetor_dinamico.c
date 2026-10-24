#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "vetor_dinamico.h"

/* =========================================================
 * Vetor Dinâmico — implementação
 * ========================================================= */

VetorDinamico *vetor_criar(int tamanho_elem) {
    if (tamanho_elem <= 0) return NULL;
    VetorDinamico *v = (VetorDinamico *)malloc(sizeof(VetorDinamico));
    if (!v) return NULL;

    v->tamanho_elem = tamanho_elem;
    v->tamanho      = 0;
    v->capacidade   = CAPACIDADE_INICIAL;
    v->dados        = malloc(CAPACIDADE_INICIAL * tamanho_elem);
    if (!v->dados) { free(v); return NULL; }
    return v;
}

/* Dobra a capacidade quando necessário */
static int crescer(VetorDinamico *v) {
    int nova_cap = v->capacidade * 2;
    void *novo   = realloc(v->dados, nova_cap * v->tamanho_elem);
    if (!novo) return 0;
    v->dados     = novo;
    v->capacidade = nova_cap;
    return 1;
}

/* Reduz à metade quando tamanho < capacidade/4 (mín: CAPACIDADE_INICIAL) */
static void encolher(VetorDinamico *v) {
    if (v->capacidade <= CAPACIDADE_INICIAL) return;
    if (v->tamanho > v->capacidade / 4)      return;

    int nova_cap = v->capacidade / 2;
    if (nova_cap < CAPACIDADE_INICIAL) nova_cap = CAPACIDADE_INICIAL;
    void *novo = realloc(v->dados, nova_cap * v->tamanho_elem);
    if (novo) { v->dados = novo; v->capacidade = nova_cap; }
}

int vetor_push(VetorDinamico *v, void *elem) {
    if (!v || !elem) return -1;
    if (v->tamanho == v->capacidade && !crescer(v)) return -1;

    char *dest = (char *)v->dados + v->tamanho * v->tamanho_elem;
    memcpy(dest, elem, v->tamanho_elem);
    return v->tamanho++;
}

int vetor_remover(VetorDinamico *v, int idx) {
    if (!v || idx < 0 || idx >= v->tamanho) return 0;

    char *base  = (char *)v->dados;
    int   tam   = v->tamanho_elem;
    /* Desloca elementos à frente uma posição para trás */
    memmove(base + idx * tam,
            base + (idx + 1) * tam,
            (v->tamanho - idx - 1) * tam);
    v->tamanho--;
    encolher(v);
    return 1;
}

void *vetor_get(VetorDinamico *v, int idx) {
    if (!v || idx < 0 || idx >= v->tamanho) return NULL;
    return (char *)v->dados + idx * v->tamanho_elem;
}

int vetor_tamanho(VetorDinamico *v) {
    if (!v) return 0;
    return v->tamanho;
}

void vetor_destruir(VetorDinamico *v) {
    if (!v) return;
    free(v->dados);
    free(v);
}