#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "grafo.h"

/* =========================================================
 * main.c ‚Äî Menu interativo para o sistema de malha a√©rea
 * ========================================================= */

static void limpar_buffer(void) {
    int c;
    while ((c = getchar()) != '\n' && c != EOF);
}

static void ler_string(const char *prompt, char *dest, int max) {
    printf("%s", prompt);
    if (fgets(dest, max, stdin)) {
        /* Remove '\n' final */
        int len = strlen(dest);
        if (len > 0 && dest[len-1] == '\n') dest[len-1] = '\0';
    }
}

static void menu_principal(void) {
    printf(" SISTEMA DE MALHA AREAR  ë\n");
    printf("‚ 1. Cadastrar aeroporto               \n");
    printf("‚ 2. Cadastrar voo                     \n");
    printf("‚ 3. Remover voo                       \n");
    printf("‚ 4. Listar voos de um aeroporto       \n");
    printf(" 5. Listar trajetos entre aeroportos  \n");
    printf(" 6. Listar todos os aeroportos        \n");
    printf(" 0. Sair                              \n");

    printf("Opcao: ");
}

/* Pr√©-carrega os aeroportos e voos do enunciado para testes */
static void carregar_dados_iniciais(Grafo *g) {
    printf("\n--- Carregando dados iniciais do enunciado ---\n");
    grafo_cadastrar_aeroporto(g, "BSB", "Brasilia");
    grafo_cadastrar_aeroporto(g, "CNF", "Belo Horizonte");
    grafo_cadastrar_aeroporto(g, "GIG", "Rio de Janeiro");
    grafo_cadastrar_aeroporto(g, "GRU", "Guarulhos");
    grafo_cadastrar_aeroporto(g, "SSA", "Salvador");

    /* Voos conforme a matriz do enunciado */
    grafo_cadastrar_voo(g, 107, "BSB", "SSA");
    grafo_cadastrar_voo(g, 555, "CNF", "GIG");
    grafo_cadastrar_voo(g, 101, "CNF", "GRU");
    grafo_cadastrar_voo(g, 214, "CNF", "SSA");
    grafo_cadastrar_voo(g, 554, "GIG", "CNF");
    grafo_cadastrar_voo(g, 90,  "GIG", "GRU");
    grafo_cadastrar_voo(g, 50,  "GRU", "BSB");
    grafo_cadastrar_voo(g, 102, "GRU", "CNF");
    grafo_cadastrar_voo(g, 89,  "GRU", "GIG");
    grafo_cadastrar_voo(g, 215, "SSA", "CNF");
    printf("--- Dados iniciais carregados ---\n");
}

int main(void) {
    Grafo *g = grafo_criar();
    if (!g) {
        fprintf(stderr, "ERRO FATAL: nao foi possivel criar o grafo.\n");
        return EXIT_FAILURE;
    }

    carregar_dados_iniciais(g);

    int opcao;
    char cod1[COD_MAX + 2], cod2[COD_MAX + 2], cidade[NOME_MAX];
    int numero;

    do {
        menu_principal();
        if (scanf("%d", &opcao) != 1) { limpar_buffer(); opcao = -1; }
        else limpar_buffer();

        switch (opcao) {

        /* === 1. Cadastrar aeroporto === */
        case 1:
            ler_string("Codigo do aeroporto (ex: CGH): ", cod1, sizeof(cod1));
            ler_string("Nome da cidade: ", cidade, sizeof(cidade));
            grafo_cadastrar_aeroporto(g, cod1, cidade);
            break;

        /* === 2. Cadastrar voo === */
        case 2:
            printf("Numero do voo: ");
            if (scanf("%d", &numero) != 1) { limpar_buffer(); printf("ERRO: entrada invalida.\n"); break; }
            limpar_buffer();
            ler_string("Codigo de origem: ", cod1, sizeof(cod1));
            ler_string("Codigo de destino: ", cod2, sizeof(cod2));
            grafo_cadastrar_voo(g, numero, cod1, cod2);
            break;

        /* === 3. Remover voo === */
        case 3:
            printf("Numero do voo a remover: ");
            if (scanf("%d", &numero) != 1) { limpar_buffer(); printf("ERRO: entrada invalida.\n"); break; }
            limpar_buffer();
            grafo_remover_voo(g, numero);
            break;

        /* === 4. Listar voos de um aeroporto === */
        case 4:
            ler_string("Codigo do aeroporto de origem: ", cod1, sizeof(cod1));
            grafo_listar_voos(g, cod1);
            break;

        /* === 5. Listar trajetos === */
        case 5:
            ler_string("Codigo de origem: ", cod1, sizeof(cod1));
            ler_string("Codigo de destino: ", cod2, sizeof(cod2));
            grafo_listar_trajetos(g, cod1, cod2);
            break;

        /* === 6. Listar aeroportos === */
        case 6:
            grafo_listar_aeroportos(g);
            break;

        case 0:
            printf("Encerrando o sistema. Ate logo!\n");
            break;

        default:
            printf("Opcao invalida. Tente novamente.\n");
        }

    } while (opcao != 0);

    grafo_destruir(g);
    return EXIT_SUCCESS;
}
