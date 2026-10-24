#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// ===== TIPOS =====
typedef unsigned char Byte;
typedef unsigned long long Tamanho;
typedef int Bool;

#define verdadeiro 1
#define falso 0
#define MAX 256
#define MAX_FILA 511   // maximo de nos na fila durante construcao (2*MAX - 1)

// ===== CODIGO =====
typedef struct {
    Byte* dados;
    Tamanho capacidade;
    Tamanho tamanho;
} Codigo;

// ===== NODO =====
// letra: 0..255 = byte real; -1 = no interno da arvore
typedef struct No {
    int letra;
    int frequencia;
    struct No *esquerda, *direita;
} No;

// ===== FILA DE PRIORIDADE =====
// Menor frequencia = maior prioridade (frente da fila)
typedef struct {
    No* lista[MAX_FILA];
    int tamanho;
} Fila;

// ===== CODIGO =====
Bool criarCodigo(Codigo* c) {
    c->dados = (Byte*)calloc(1, 1);
    if (!c->dados) return falso;
    c->capacidade = 8;
    c->tamanho = 0;
    return verdadeiro;
}

Bool adicionarBit(Codigo* c, Byte valor) {

    if (c->tamanho == c->capacidade) {
        int bytes = c->capacidade / 8;
        Byte* novo = (Byte*)calloc(bytes + 1, 1);
        if (!novo) return falso;

        memcpy(novo, c->dados, bytes);
        free(c->dados);

        c->dados = novo;
        c->capacidade += 8;
    }

    int posByte = c->tamanho / 8;
    int posBit = 7 - (c->tamanho % 8);

    if (valor)
        c->dados[posByte] |= (1 << posBit);

    c->tamanho++;
    return verdadeiro;
}

Byte obterBit(Codigo c, Tamanho pos) {
    int posByte = pos / 8;
    int posBit = 7 - (pos % 8);
    return (c.dados[posByte] >> posBit) & 1;
}

// ===== FILA =====
void iniciarFila(Fila* f) { f->tamanho = 0; }

// Insere mantendo ordem crescente de frequencia (menor frente, maior atras)
void inserirFila(Fila* f, No* no) {
    int i = f->tamanho - 1;
    while (i >= 0 && f->lista[i]->frequencia > no->frequencia) {
        f->lista[i+1] = f->lista[i];
        i--;
    }
    f->lista[i+1] = no;
    f->tamanho++;
}

// Remove e retorna o no de menor frequencia (frente)
No* removerFila(Fila* f) {
    No* no = f->lista[0];
    for (int i = 0; i < f->tamanho - 1; i++)
        f->lista[i] = f->lista[i+1];
    f->tamanho--;
    return no;
}

// ===== HUFFMAN =====
No* criarNo(int letra, int freq) {
    No* n = (No*)malloc(sizeof(No));
    n->letra = letra;
    n->frequencia = freq;
    n->esquerda = n->direita = NULL;
    return n;
}

// PASSO 3 do enunciado:
// Enquanto a fila contiver 2 ou mais nos:
//   - Remove os dois de menor frequencia
//   - Cria novo no com frequencia = soma dos dois
//   - Filho esquerdo = primeiro removido, direito = segundo removido
//   - Reinsere o novo no na fila
// Ao final, o unico no restante e a raiz da arvore
No* construirArvoreHuffman(Fila* fila) {
    while (fila->tamanho >= 2) {
        No* esq = removerFila(fila);   // menor frequencia -> subarvore esquerda
        No* dir = removerFila(fila);   // proximo menor   -> subarvore direita

        No* novo = criarNo(-1, esq->frequencia + dir->frequencia);
        novo->esquerda = esq;
        novo->direita  = dir;

        inserirFila(fila, novo);
    }
    return removerFila(fila);
}

// PASSO 4 do enunciado:
// Percorre a arvore: vai para esquerda acrescentando 0, direita acrescentando 1.
// Codigo pronto ao atingir uma folha.
void gerarCodigos(No* raiz, Codigo tabela[], Codigo atual) {

    if (raiz->esquerda) {
        Codigo copia;
        criarCodigo(&copia);
        memcpy(copia.dados, atual.dados, atual.capacidade / 8);
        copia.capacidade = atual.capacidade;
        copia.tamanho    = atual.tamanho;

        adicionarBit(&copia, 0);   // esquerda = 0
        gerarCodigos(raiz->esquerda, tabela, copia);
    }

    if (raiz->direita) {
        Codigo copia;
        criarCodigo(&copia);
        memcpy(copia.dados, atual.dados, atual.capacidade / 8);
        copia.capacidade = atual.capacidade;
        copia.tamanho    = atual.tamanho;

        adicionarBit(&copia, 1);   // direita = 1
        gerarCodigos(raiz->direita, tabela, copia);
    }

    // Folha: armazena o codigo gerado para este byte
    if (!raiz->esquerda && !raiz->direita) {
        tabela[raiz->letra] = atual;
    }
}

// ===== SERIALIZAR ARVORE =====
// Percurso pre-ordem:
//   Folha   -> '1' + valor do byte em 3 digitos decimais (000..255)
//   No int. -> '0' + serializa esquerda + serializa direita
void serializarArvore(No* raiz, char* buffer, int* pos) {
    if (!raiz->esquerda && !raiz->direita) {
        buffer[(*pos)++] = '1';
        sprintf(buffer + *pos, "%03d", raiz->letra);
        *pos += 3;
    } else {
        buffer[(*pos)++] = '0';
        serializarArvore(raiz->esquerda, buffer, pos);
        serializarArvore(raiz->direita,  buffer, pos);
    }
}

// ===== DESSERIALIZAR ARVORE =====
No* desserializarArvore(char* buffer, int* pos) {

    if (buffer[*pos] == '1') {
        (*pos)++;
        char tmp[4] = {0};
        tmp[0] = buffer[(*pos)++];
        tmp[1] = buffer[(*pos)++];
        tmp[2] = buffer[(*pos)++];
        return criarNo(atoi(tmp), 0);
    }

    (*pos)++;
    No* no   = criarNo(-1, 0);
    no->esquerda = desserializarArvore(buffer, pos);
    no->direita  = desserializarArvore(buffer, pos);
    return no;
}

// ===== LER ARQUIVO BINARIO =====
Byte* lerArquivo(const char* caminho, Tamanho* tamanho) {
    FILE* f = fopen(caminho, "rb");
    if (!f) { printf("Erro ao abrir arquivo: %s\n", caminho); return NULL; }

    fseek(f, 0, SEEK_END);
    *tamanho = (Tamanho)ftell(f);
    fseek(f, 0, SEEK_SET);

    Byte* dados = (Byte*)malloc(*tamanho);
    if (!dados) { fclose(f); return NULL; }

    fread(dados, 1, *tamanho, f);
    fclose(f);
    return dados;
}

// ===== COMPACTAR ARQUIVO =====
// Segue os 5 passos do enunciado adaptados para qualquer tipo de arquivo:
// cada "caractere" e um byte (0..255) em vez de um char de texto.
void compactarArquivo(const char* caminhoEntrada, const char* caminhoSaida) {

    // --- PASSO 1: Levantamento de frequencias ---
    Tamanho tamanho = 0;
    Byte* dados = lerArquivo(caminhoEntrada, &tamanho);
    if (!dados) return;

    int freq[MAX] = {0};
    for (Tamanho i = 0; i < tamanho; i++)
        freq[dados[i]]++;

    // --- PASSO 2: Ordenar/priorizar na fila de prioridade ---
    Fila fila;
    iniciarFila(&fila);

    for (int i = 0; i < MAX; i++)
        if (freq[i] > 0)
            inserirFila(&fila, criarNo(i, freq[i]));

    // --- PASSO 3: Construir a Arvore de Huffman ---
    No* raiz = construirArvoreHuffman(&fila);

    // --- PASSO 4: Percorrer a arvore e determinar todos os codigos ---
    Codigo tabela[MAX] = {0};
    Codigo inicial;
    criarCodigo(&inicial);
    gerarCodigos(raiz, tabela, inicial);

    // --- PASSO 5: Reprocessar e criar o arquivo compactado ---
    Codigo resultado;
    criarCodigo(&resultado);

    for (Tamanho i = 0; i < tamanho; i++) {
        Codigo cod = tabela[dados[i]];
        for (Tamanho b = 0; b < cod.tamanho; b++)
            adicionarBit(&resultado, obterBit(cod, b));
    }

    // Serializar arvore para gravar junto ao arquivo compactado
    char* arvoreSerial = (char*)malloc(MAX * 5 + 10);
    int posArvore = 0;
    serializarArvore(raiz, arvoreSerial, &posArvore);
    arvoreSerial[posArvore] = '\0';

    // Formato do arquivo .huf:
    //   [8 bytes] tamanho original em bytes
    //   [8 bytes] quantidade total de bits compactados
    //   [4 bytes] tamanho da string serializada da arvore
    //   [N bytes] string da arvore serializada
    //   [M bytes] bits compactados empacotados em bytes
    FILE* fSaida = fopen(caminhoSaida, "wb");
    if (!fSaida) {
        printf("Erro ao criar arquivo de saida.\n");
        free(dados); free(arvoreSerial);
        return;
    }

    Tamanho bitsTotal    = resultado.tamanho;
    Tamanho bytesCompact = (bitsTotal + 7) / 8;
    int     tamArvore    = (int)strlen(arvoreSerial);

    fwrite(&tamanho,        sizeof(Tamanho), 1,            fSaida);
    fwrite(&bitsTotal,      sizeof(Tamanho), 1,            fSaida);
    fwrite(&tamArvore,      sizeof(int),     1,            fSaida);
    fwrite(arvoreSerial,    1,               tamArvore,    fSaida);
    fwrite(resultado.dados, 1,               bytesCompact, fSaida);

    fclose(fSaida);

    printf("\nArquivo compactado: %s\n", caminhoSaida);
    printf("Original:   %llu bytes (%llu bits)\n", tamanho, tamanho * 8);
    printf("Compactado: %llu bytes (%llu bits)\n", bytesCompact, bitsTotal);
    printf("Taxa de compressao: %.2f%%\n",
           (1.0 - (double)bytesCompact / (double)tamanho) * 100.0);

    free(dados);
    free(arvoreSerial);
}

// ===== DESCOMPACTAR ARQUIVO =====
// Tendo a arvore, processa os bits:
//   bit 0 -> vai para esquerda
//   bit 1 -> vai para direita
//   ao atingir folha -> emite o byte e volta para a raiz
void descompactarArquivo(const char* caminhoEntrada, const char* caminhoSaida) {

    FILE* fEntrada = fopen(caminhoEntrada, "rb");
    if (!fEntrada) { printf("Erro ao abrir arquivo: %s\n", caminhoEntrada); return; }

    // Ler cabecalho
    Tamanho tamanhoOriginal = 0;
    Tamanho bitsTotal       = 0;
    int     tamArvore       = 0;

    fread(&tamanhoOriginal, sizeof(Tamanho), 1, fEntrada);
    fread(&bitsTotal,       sizeof(Tamanho), 1, fEntrada);
    fread(&tamArvore,       sizeof(int),     1, fEntrada);

    // Ler arvore serializada
    char* arvoreSerial = (char*)malloc(tamArvore + 1);
    fread(arvoreSerial, 1, tamArvore, fEntrada);
    arvoreSerial[tamArvore] = '\0';

    // Ler bytes compactados
    Tamanho bytesCompact = (bitsTotal + 7) / 8;
    Byte*   bytesComp    = (Byte*)malloc(bytesCompact);
    fread(bytesComp, 1, bytesCompact, fEntrada);
    fclose(fEntrada);

    // Reconstruir arvore
    int posArvore = 0;
    No* raiz = desserializarArvore(arvoreSerial, &posArvore);

    // Descompactar percorrendo a arvore bit a bit
    Byte*   original = (Byte*)malloc(tamanhoOriginal);
    Tamanho t        = 0;
    No*     atual    = raiz;

    for (Tamanho i = 0; i < bitsTotal && t < tamanhoOriginal; i++) {
        int posByte = i / 8;
        int posBit  = 7 - (i % 8);
        int bit     = (bytesComp[posByte] >> posBit) & 1;

        // bit 0 = esquerda, bit 1 = direita (conforme enunciado)
        atual = (bit == 0) ? atual->esquerda : atual->direita;

        // Folha atingida: emite byte e volta para raiz
        if (!atual->esquerda && !atual->direita) {
            original[t++] = (Byte)atual->letra;
            atual = raiz;
        }
    }

    // Gravar arquivo restaurado
    FILE* fSaida = fopen(caminhoSaida, "wb");
    if (!fSaida) {
        printf("Erro ao criar arquivo de saida.\n");
        free(arvoreSerial); free(bytesComp); free(original);
        return;
    }

    fwrite(original, 1, tamanhoOriginal, fSaida);
    fclose(fSaida);

    printf("\nArquivo descompactado: %s\n", caminhoSaida);
    printf("Tamanho restaurado: %llu bytes\n", tamanhoOriginal);

    free(arvoreSerial);
    free(bytesComp);
    free(original);
}

// ===== MAIN =====
int main() {

    int op;

    while (1) {

        printf("\n1 - Compactar arquivo\n2 - Descompactar arquivo\n3 - Sair\n\nEscolha: ");
        scanf("%d", &op);
        getchar();

        if (op == 1) {

            char entrada[500], saida[504];

            printf("\nCaminho do arquivo a compactar: ");
            fgets(entrada, sizeof(entrada), stdin);
            entrada[strcspn(entrada, "\n")] = '\0';

            // Gera nome de saida automaticamente: arquivo.txt -> arquivo.txt.huf
            sprintf(saida, "%s.huf", entrada);

            printf("Arquivo de saida: %s\n", saida);

            compactarArquivo(entrada, saida);

        } else if (op == 2) {

            char entrada[500], saida[500];

            printf("\nCaminho do arquivo compactado (.huf): ");
            fgets(entrada, sizeof(entrada), stdin);
            entrada[strcspn(entrada, "\n")] = '\0';

            // Remove o .huf do final para restaurar o nome original
            // ex: foto.png.huf -> foto.png
            strcpy(saida, entrada);
            int len = strlen(saida);
            if (len > 4 && strcmp(saida + len - 4, ".huf") == 0)
                saida[len - 4] = '\0';
            else {
                // Se nao termina com .huf, adiciona "_restaurado" antes da extensao
                char* ponto = strrchr(saida, '.');
                if (ponto) {
                    char ext[50];
                    strcpy(ext, ponto);       // guarda extensao ex: ".png"
                    *ponto = '\0';            // corta no ponto
                    strcat(saida, "_restaurado");
                    strcat(saida, ext);       // recoloca extensao
                } else {
                    strcat(saida, "_restaurado");
                }
            }

            printf("Arquivo de saida: %s\n", saida);

            descompactarArquivo(entrada, saida);

        } else if (op == 3) {
            printf("Saindo...\n");
            break;
        } else {
            printf("Opcao invalida!\n");
        }
    }

    return 0;
}