#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "grafo.h"

/* =========================================================
 * Grafo — implementação
 * ========================================================= */

/* Retorna índice do aeroporto pelo código, ou -1 se não encontrar */
static int indice_aeroporto(Grafo *g, const char *codigo) {
    int n = vetor_tamanho(g->aeroportos);
    for (int i = 0; i < n; i++) {
        Aeroporto *a = (Aeroporto *)vetor_get(g->aeroportos, i);
        if (strcmp(a->codigo, codigo) == 0) return i;
    }
    return -1;
}

/* --------------------------------------------------------- */

Grafo *grafo_criar(void) {
    Grafo *g = (Grafo *)malloc(sizeof(Grafo));
    if (!g) return NULL;

    g->aeroportos = vetor_criar(sizeof(Aeroporto));
    if (!g->aeroportos) { free(g); return NULL; }

    /* Começamos com matriz 0×0; será expandida ao cadastrar aeroportos */
    g->matriz = matriz_criar(1, 1, sizeof(DadoVoo));
    if (!g->matriz) { vetor_destruir(g->aeroportos); free(g); return NULL; }

    return g;
}

void grafo_destruir(Grafo *g) {
    if (!g) return;
    vetor_destruir(g->aeroportos);
    matriz_destruir(g->matriz);
    free(g);
}

/* --------------------------------------------------------- */

int grafo_cadastrar_aeroporto(Grafo *g, const char *codigo, const char *cidade) {
    if (!g || !codigo || !cidade) return 0;
    if (strlen(codigo) == 0 || strlen(codigo) >= COD_MAX) {
        printf("ERRO: codigo deve ter 3 letras (ex: GRU).\n");
        return 0;
    }
    if (indice_aeroporto(g, codigo) >= 0) {
        printf("ERRO: aeroporto '%s' ja cadastrado.\n", codigo);
        return 0;
    }

    Aeroporto novo;
    strncpy(novo.codigo, codigo, COD_MAX - 1);
    novo.codigo[COD_MAX - 1] = '\0';
    /* Força maiúsculas no código */
    for (int i = 0; novo.codigo[i]; i++)
        if (novo.codigo[i] >= 'a' && novo.codigo[i] <= 'z')
            novo.codigo[i] -= 32;

    strncpy(novo.cidade, cidade, NOME_MAX - 1);
    novo.cidade[NOME_MAX - 1] = '\0';

    int idx = vetor_push(g->aeroportos, &novo);
    if (idx < 0) { printf("ERRO: falha ao alocar aeroporto.\n"); return 0; }

    int n = vetor_tamanho(g->aeroportos);
    if (!matriz_redimensionar(g->matriz, n, n)) {
        printf("ERRO: falha ao expandir matriz.\n");
        return 0;
    }

    printf("SUCESSO: aeroporto %s (%s) cadastrado no indice %d.\n",
           novo.codigo, novo.cidade, idx);
    return 1;
}

/* --------------------------------------------------------- */

int grafo_cadastrar_voo(Grafo *g, int numero, const char *cod_orig, const char *cod_dest) {
    if (!g) return 0;
    if (numero <= 0) { printf("ERRO: numero de voo deve ser positivo.\n"); return 0; }

    int orig = indice_aeroporto(g, cod_orig);
    int dest = indice_aeroporto(g, cod_dest);

    if (orig < 0) { printf("ERRO: aeroporto de origem '%s' nao encontrado.\n", cod_orig); return 0; }
    if (dest < 0) { printf("ERRO: aeroporto de destino '%s' nao encontrado.\n", cod_dest); return 0; }
    if (orig == dest) { printf("ERRO: origem e destino sao o mesmo aeroporto.\n"); return 0; }

    /* Verifica se o número de voo já existe na matriz toda */
    int n = vetor_tamanho(g->aeroportos);
    for (int i = 0; i < n; i++) {
        NoMatriz *no = g->matriz->cabecas_linha[i];
        while (no) {
            DadoVoo *d = (DadoVoo *)no->dado;
            if (d->numero_voo == numero) {
                Aeroporto *ao = (Aeroporto *)vetor_get(g->aeroportos, no->linha);
                Aeroporto *ad = (Aeroporto *)vetor_get(g->aeroportos, no->coluna);
                printf("ERRO: voo %d ja existe (%s -> %s).\n",
                       numero, ao->codigo, ad->codigo);
                return 0;
            }
            no = no->prox_linha;
        }
    }

    /* Verifica se já existe voo entre esse par de aeroportos */
    if (matriz_obter(g->matriz, orig, dest)) {
        Aeroporto *ao = (Aeroporto *)vetor_get(g->aeroportos, orig);
        Aeroporto *ad = (Aeroporto *)vetor_get(g->aeroportos, dest);
        printf("ERRO: ja existe um voo de %s para %s.\n", ao->codigo, ad->codigo);
        return 0;
    }

    DadoVoo voo;
    voo.numero_voo = numero;
    if (!matriz_inserir(g->matriz, orig, dest, &voo)) {
        printf("ERRO: falha ao inserir voo na matriz.\n");
        return 0;
    }

    Aeroporto *ao = (Aeroporto *)vetor_get(g->aeroportos, orig);
    Aeroporto *ad = (Aeroporto *)vetor_get(g->aeroportos, dest);
    printf("SUCESSO: voo %d cadastrado (%s -> %s).\n", numero, ao->codigo, ad->codigo);
    return 1;
}

/* --------------------------------------------------------- */

int grafo_remover_voo(Grafo *g, int numero) {
    if (!g) return 0;
    if (numero <= 0) { printf("ERRO: numero de voo invalido.\n"); return 0; }

    int n = vetor_tamanho(g->aeroportos);
    for (int i = 0; i < n; i++) {
        NoMatriz *no = g->matriz->cabecas_linha[i];
        while (no) {
            DadoVoo *d = (DadoVoo *)no->dado;
            if (d->numero_voo == numero) {
                int lin = no->linha, col = no->coluna;
                Aeroporto *ao = (Aeroporto *)vetor_get(g->aeroportos, lin);
                Aeroporto *ad = (Aeroporto *)vetor_get(g->aeroportos, col);
                matriz_remover(g->matriz, lin, col);
                printf("SUCESSO: voo %d removido (%s -> %s).\n",
                       numero, ao->codigo, ad->codigo);
                return 1;
            }
            no = no->prox_linha;
        }
    }
    printf("ERRO: voo %d nao encontrado.\n", numero);
    return 0;
}

/* --------------------------------------------------------- */

void grafo_listar_voos(Grafo *g, const char *cod_orig) {
    if (!g) return;
    int orig = indice_aeroporto(g, cod_orig);
    if (orig < 0) { printf("ERRO: aeroporto '%s' nao encontrado.\n", cod_orig); return; }

    Aeroporto *ao = (Aeroporto *)vetor_get(g->aeroportos, orig);
    printf("\n=== Voos partindo de %s (%s) ===\n", ao->codigo, ao->cidade);

    NoMatriz *no = g->matriz->cabecas_linha[orig];
    int achou = 0;
    while (no) {
        DadoVoo  *d  = (DadoVoo *)no->dado;
        Aeroporto *ad = (Aeroporto *)vetor_get(g->aeroportos, no->coluna);
        printf("  Voo %-5d -> %s (%s)\n", d->numero_voo, ad->codigo, ad->cidade);
        no = no->prox_linha;
        achou = 1;
    }
    if (!achou) printf("  (nenhum voo cadastrado)\n");
}

/* --------------------------------------------------------- */

/* Busca em profundidade (DFS) para listar todos os trajetos */
static void dfs(Grafo *g, int atual, int destino,
                int *caminho, int profundidade,
                int *visitado, int n, int *achou) {

    if (atual == destino) {
        *achou = 1;
        /* Imprime o trajeto encontrado */
        printf("  Trajeto: ");
        for (int i = 0; i < profundidade; i++) {
            Aeroporto *a = (Aeroporto *)vetor_get(g->aeroportos, caminho[i]);
            printf("%s", a->codigo);
            if (i < profundidade - 1) printf(" -> ");
        }
        printf("\n");
        /* Mostra os voos usados */
        printf("          (voos: ");
        for (int i = 0; i < profundidade - 1; i++) {
            DadoVoo *d = (DadoVoo *)matriz_obter(g->matriz, caminho[i], caminho[i+1]);
            if (d) printf("%d", d->numero_voo);
            if (i < profundidade - 2) printf(", ");
        }
        printf(")\n");
        return;
    }

    NoMatriz *no = g->matriz->cabecas_linha[atual];
    while (no) {
        int viz = no->coluna;
        if (!visitado[viz]) {
            visitado[viz]        = 1;
            caminho[profundidade] = viz;
            dfs(g, viz, destino, caminho, profundidade + 1, visitado, n, achou);
            visitado[viz]        = 0;
        }
        no = no->prox_linha;
    }
}

void grafo_listar_trajetos(Grafo *g, const char *cod_orig, const char *cod_dest) {
    if (!g) return;
    int orig = indice_aeroporto(g, cod_orig);
    int dest = indice_aeroporto(g, cod_dest);

    if (orig < 0) { printf("ERRO: aeroporto de origem '%s' nao encontrado.\n", cod_orig); return; }
    if (dest < 0) { printf("ERRO: aeroporto de destino '%s' nao encontrado.\n", cod_dest); return; }
    if (orig == dest) { printf("ERRO: origem e destino sao iguais.\n"); return; }

    int n = vetor_tamanho(g->aeroportos);
    int *visitado = (int *)calloc(n, sizeof(int));
    int *caminho  = (int *)malloc(n * sizeof(int));
    if (!visitado || !caminho) {
        printf("ERRO: sem memoria para busca de trajetos.\n");
        free(visitado); free(caminho); return;
    }

    Aeroporto *ao = (Aeroporto *)vetor_get(g->aeroportos, orig);
    Aeroporto *ad = (Aeroporto *)vetor_get(g->aeroportos, dest);
    printf("\n=== Trajetos de %s (%s) ate %s (%s) ===\n",
           ao->codigo, ao->cidade, ad->codigo, ad->cidade);

    visitado[orig] = 1;
    caminho[0]     = orig;
    int achou      = 0;
    dfs(g, orig, dest, caminho, 1, visitado, n, &achou);

    if (!achou) printf("  (nenhum trajeto possivel)\n");

    free(visitado);
    free(caminho);
}

/* --------------------------------------------------------- */

void grafo_listar_aeroportos(Grafo *g) {
    if (!g) return;
    int n = vetor_tamanho(g->aeroportos);
    printf("\n=== Aeroportos cadastrados (%d) ===\n", n);
    if (n == 0) { printf("  (nenhum)\n"); return; }
    for (int i = 0; i < n; i++) {
        Aeroporto *a = (Aeroporto *)vetor_get(g->aeroportos, i);
        printf("  [%d] %s — %s\n", i, a->codigo, a->cidade);
    }
}