let rankingGeral = [];

/**
 * Renderiza as linhas da tabela de acordo com a lista informada.
 */
function renderizarTabela(lista) {
  const tbody = document.querySelector('.tabelaRanking tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!lista || lista.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="4">Nenhum aluno encontrado para o período.</td>';
    tbody.appendChild(tr);
    return;
  }

  lista.forEach((aluno) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${aluno.ra}</td>
      <td>${aluno.nome}</td>
      <td>${aluno.totalLivros}</td>
      <td>${aluno.classificacao}</td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Atualiza os cards de resumo com os totais recebidos da API.
 */
function atualizarCards(resumo) {
  const spanIniciantes = document.getElementById('qtdIniciantes');
  const spanRegulares = document.getElementById('qtdRegulares');
  const spanAtivos = document.getElementById('qtdAtivos');
  const spanExtremos = document.getElementById('qtdExtremos');

  if (!resumo) return;

  if (spanIniciantes) spanIniciantes.textContent = resumo.iniciantes ?? 0;
  if (spanRegulares) spanRegulares.textContent = resumo.regulares ?? 0;
  if (spanAtivos) spanAtivos.textContent = resumo.ativos ?? 0;
  if (spanExtremos) spanExtremos.textContent = resumo.extremos ?? 0;
}

/**
 * Aplica filtro de RA sobre o ranking em memória.
 */
function aplicarFiltroRA() {
  const input = document.querySelector('.inputPesquisar');
  if (!input) return;

  const termo = input.value.trim();
  if (!termo) {
    renderizarTabela(rankingGeral);
    return;
  }

  const filtrado = rankingGeral.filter((aluno) =>
    String(aluno.ra).includes(termo)
  );

  renderizarTabela(filtrado);
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const resposta = await fetch('http://localhost:3000/alunos/classificacao-geral');
    const dados = await resposta.json();

    if (!resposta.ok || dados.erro) {
      console.error(dados.mensagem || 'Erro ao buscar classificação geral.');
      alert(dados.mensagem || 'Erro ao buscar classificação geral.');
      return;
    }

    rankingGeral = dados.ranking || [];
    atualizarCards(dados.resumo);
    renderizarTabela(rankingGeral);
  } catch (erro) {
    console.error('Erro ao conectar com o servidor na classificação geral.', erro);
    alert('Erro ao conectar com o servidor.');
  }

  const botaoPesquisar = document.querySelector('.botaoPesquisar');
  const inputPesquisar = document.querySelector('.inputPesquisar');

  if (botaoPesquisar) {
    botaoPesquisar.addEventListener('click', aplicarFiltroRA);
  }

  if (inputPesquisar) {
    inputPesquisar.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        aplicarFiltroRA();
      } else if (!inputPesquisar.value.trim()) {
        // Se o campo ficar vazio, volta a mostrar todo o ranking
        renderizarTabela(rankingGeral);
      }
    });
  }
});



