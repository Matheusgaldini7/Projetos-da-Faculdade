#ifndef GRAFO_H
#define GRAFO_H

#include "vetor_dinamico.h"
#include "matriz_esparsa.h"

/* =========================================================
 * Módulo Grafo — aeroportos (vértices) e voos (arestas)
 * ========================================================= */

#define COD_MAX  4   /* ex: "GRU\0" */
#define NOME_MAX 50

typedef struct {
    char codigo[COD_MAX];   /* ex: "GRU" */
    char cidade[NOME_MAX];  /* ex: "Guarulhos" */
} Aeroporto;

typedef struct {
    int numero_voo;         /* número identificador do voo */
} DadoVoo;

typedef struct {
    VetorDinamico *aeroportos;  /* vetor dinâmico de Aeroporto */
    MatrizEsparsa *matriz;      /* matriz esparsa de DadoVoo   */
} Grafo;

/* Cria estrutura do grafo */
Grafo *grafo_criar(void);

/* Libera toda a memória */
void grafo_destruir(Grafo *g);

/* 1. Cadastra um aeroporto; retorna 1 sucesso, 0 falha */
int grafo_cadastrar_aeroporto(Grafo *g, const char *codigo, const char *cidade);

/* 2. Cadastra voo numero de origem->destino; retorna 1 sucesso */
int grafo_cadastrar_voo(Grafo *g, int numero, const char *cod_orig, const char *cod_dest);

/* 3. Remove voo pelo número; retorna 1 sucesso */
int grafo_remover_voo(Grafo *g, int numero);

/* 4. Lista todos os voos que partem de um aeroporto */
void grafo_listar_voos(Grafo *g, const char *cod_orig);

/* 5. Lista todos os trajetos (DFS) de origem até destino */
void grafo_listar_trajetos(Grafo *g, const char *cod_orig, const char *cod_dest);

/* Auxiliar: imprime todos os aeroportos cadastrados */
void grafo_listar_aeroportos(Grafo *g);

#endif