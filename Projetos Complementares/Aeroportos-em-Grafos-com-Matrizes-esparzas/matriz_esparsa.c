#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "matriz_esparsa.h"

/* =========================================================
 * Matriz Esparsa — implementação
 * ========================================================= */

MatrizEsparsa *matriz_criar(int linhas, int colunas, int tamanho_dado) {
    if (linhas <= 0 || colunas <= 0 || tamanho_dado <= 0) return NULL;

    MatrizEsparsa *m = (MatrizEsparsa *)malloc(sizeof(MatrizEsparsa));
    if (!m) return NULL;

    m->linhas       = linhas;
    m->colunas      = colunas;
    m->tamanho_dado = tamanho_dado;

    m->cabecas_linha   = (NoMatriz **)calloc(linhas,  sizeof(NoMatriz *));
    m->cabecas_coluna  = (NoMatriz **)calloc(colunas, sizeof(NoMatriz *));

    if (!m->cabecas_linha || !m->cabecas_coluna) {
        free(m->cabecas_linha);
        free(m->cabecas_coluna);
        free(m);
        return NULL;
    }
    return m;
}

int matriz_redimensionar(MatrizEsparsa *m, int novas_linhas, int novas_colunas) {
    if (!m || novas_linhas < m->linhas || novas_colunas < m->colunas) return 0;

    NoMatriz **nl = (NoMatriz **)realloc(m->cabecas_linha,
                                         novas_linhas * sizeof(NoMatriz *));
    if (!nl) return 0;
    m->cabecas_linha = nl;
    /* Inicializa as novas entradas */
    for (int i = m->linhas; i < novas_linhas; i++)
        m->cabecas_linha[i] = NULL;

    NoMatriz **nc = (NoMatriz **)realloc(m->cabecas_coluna,
                                          novas_colunas * sizeof(NoMatriz *));
    if (!nc) return 0;
    m->cabecas_coluna = nc;
    for (int j = m->colunas; j < novas_colunas; j++)
        m->cabecas_coluna[j] = NULL;

    m->linhas   = novas_linhas;
    m->colunas  = novas_colunas;
    return 1;
}

int matriz_inserir(MatrizEsparsa *m, int lin, int col, void *dado) {
    if (!m || !dado) return 0;
    if (lin < 0 || lin >= m->linhas || col < 0 || col >= m->colunas) return 0;

    /* Verifica se já existe — atualiza */
    NoMatriz *atual = m->cabecas_linha[lin];
    while (atual) {
        if (atual->coluna == col) {
            memcpy(atual->dado, dado, m->tamanho_dado);
            return 1;
        }
        atual = atual->prox_linha;
    }

    /* Cria novo nó */
    NoMatriz *novo = (NoMatriz *)malloc(sizeof(NoMatriz));
    if (!novo) return 0;
    novo->linha   = lin;
    novo->coluna  = col;
    novo->dado    = malloc(m->tamanho_dado);
    if (!novo->dado) { free(novo); return 0; }
    memcpy(novo->dado, dado, m->tamanho_dado);

    /* Insere na lista da linha (ordem por coluna) */
    NoMatriz **p = &m->cabecas_linha[lin];
    while (*p && (*p)->coluna < col) p = &(*p)->prox_linha;
    novo->prox_linha = *p;
    *p = novo;

    /* Insere na lista da coluna (ordem por linha) */
    NoMatriz **q = &m->cabecas_coluna[col];
    while (*q && (*q)->linha < lin) q = &(*q)->prox_coluna;
    novo->prox_coluna = *q;
    *q = novo;

    return 1;
}

int matriz_remover(MatrizEsparsa *m, int lin, int col) {
    if (!m) return 0;
    if (lin < 0 || lin >= m->linhas || col < 0 || col >= m->colunas) return 0;

    /* Remove da lista da linha */
    NoMatriz **p = &m->cabecas_linha[lin];
    while (*p && (*p)->coluna != col) p = &(*p)->prox_linha;
    if (!*p) return 0; /* não existe */
    NoMatriz *alvo = *p;
    *p = alvo->prox_linha;

    /* Remove da lista da coluna */
    NoMatriz **q = &m->cabecas_coluna[col];
    while (*q && *q != alvo) q = &(*q)->prox_coluna;
    if (*q) *q = alvo->prox_coluna;

    free(alvo->dado);
    free(alvo);
    return 1;
}

void *matriz_obter(MatrizEsparsa *m, int lin, int col) {
    if (!m) return NULL;
    if (lin < 0 || lin >= m->linhas || col < 0 || col >= m->colunas) return NULL;

    NoMatriz *atual = m->cabecas_linha[lin];
    while (atual) {
        if (atual->coluna == col) return atual->dado;
        if (atual->coluna > col)  break;
        atual = atual->prox_linha;
    }
    return NULL;
}

void matriz_destruir(MatrizEsparsa *m) {
    if (!m) return;
    for (int i = 0; i < m->linhas; i++) {
        NoMatriz *atual = m->cabecas_linha[i];
        while (atual) {
            NoMatriz *prox = atual->prox_linha;
            free(atual->dado);
            free(atual);
            atual = prox;
        }
    }
    free(m->cabecas_linha);
    free(m->cabecas_coluna);
    free(m);
}