const API_BASE = "http://localhost:3000";

const tabelaLivros = document.getElementById("tabelaLivros");
const tabelaEmprestados = document.getElementById("tabelaEmprestados");
const tabelaHistorico = document.getElementById("tabelaHistorico");
const totalLivrosSpan = document.getElementById("totalLivros");
const livrosDisponiveisSpan = document.getElementById("livrosDisponiveis");
const livrosEmprestadosSpan = document.getElementById("livrosEmprestados");
const btnAtualizar = document.getElementById("btnAtualizar");

const modalEditar = document.getElementById("modalEditar");
const formEditarLivro = document.getElementById("formEditarLivro");
const btnCancelarEdicao = document.getElementById("btnCancelarEdicao");
const mensagemEdicao = document.getElementById("mensagemEdicao");

const campoCodigo = document.getElementById("editarCodigo");
const campoTitulo = document.getElementById("editarTitulo");
const campoAutor = document.getElementById("editarAutor");
const campoCategoria = document.getElementById("editarCategoria");
const campoEditora = document.getElementById("editarEditora");
const campoQuantidade = document.getElementById("editarQuantidade");

let livrosCache = [];

function formatarData(dataISO) {
  if (!dataISO) return "--";
  const somenteData = dataISO.split("T")[0] || dataISO;
  const [ano, mes, dia] = somenteData.split("-");
  if (!ano || !mes || !dia) return dataISO;
  return `${dia.padStart(2, "0")}/${mes.padStart(2, "0")}/${ano}`;
}

function formatarHora(hora) {
  if (!hora) return "--";
  const somenteHora = hora.includes("T") ? hora.split("T")[1] : hora;
  const [hh, mm, ss = "00"] = somenteHora.split(":");
  if (!hh || !mm) return somenteHora.slice(0, 8);
  return `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:${ss.slice(0, 2).padStart(2, "0")}`;
}

function formatarDataHora(data, hora) {
  const dataFmt = formatarData(data);
  const horaFmt = formatarHora(hora);
  if (dataFmt === "--") return "--";
  return horaFmt === "--" ? dataFmt : `${dataFmt} às ${horaFmt}`;
}

function exibirMensagem(tbody, colunas, mensagem) {
  tbody.innerHTML = `<tr><td class="mensagem-vazia" colspan="${colunas}">${mensagem}</td></tr>`;
}

function setCarregando(tbody, colunas) {
  exibirMensagem(tbody, colunas, "Carregando...");
}

async function fetchJson(url) {
  const resposta = await fetch(url);
  if (!resposta.ok) {
    let detalhe = "";
    try {
      const erro = await resposta.json();
      detalhe = erro.mensagem || erro.status || "";
    } catch (_) {
      detalhe = resposta.statusText;
    }
    throw new Error(detalhe || "Não foi possível carregar os dados.");
  }
  return resposta.json();
}

function renderizarLivros(livros = []) {
  if (!livros.length) {
    exibirMensagem(tabelaLivros, 7, "Nenhum livro cadastrado.");
    return;
  }

  livrosCache = livros;

  tabelaLivros.innerHTML = livros
    .map((livro) => {
      const statusDisponivel = livro.STATUS === "Disponível" && Number(livro.QTD) > 0;
      const statusClasse = statusDisponivel ? "status-disponivel" : "status-emprestado";
      const statusTexto = statusDisponivel ? "Disponível" : "Emprestado";

      return `
        <tr>
          <td>${livro.CODIGO}</td>
          <td>${livro.TITULO}</td>
          <td>${livro.AUTOR || "-"}</td>
          <td>${livro.CATEGORIA || "-"}</td>
          <td>${livro.QTD}</td>
          <td><span class="${statusClasse}">${statusTexto}</span></td>
          <td class="acoes">
            <button class="btn editar" data-acao="editar" data-codigo="${livro.CODIGO}">Editar</button>
            <button class="btn deletar" data-acao="deletar" data-codigo="${livro.CODIGO}">Deletar</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderizarEmprestados(emprestimos = []) {
  if (!emprestimos.length) {
    exibirMensagem(tabelaEmprestados, 6, "Nenhum empréstimo pendente.");
    return;
  }

  tabelaEmprestados.innerHTML = emprestimos
    .map(
      (emprestimo) => `
      <tr>
        <td>${emprestimo.codigoLivro}</td>
        <td>${emprestimo.tituloLivro}</td>
        <td>${emprestimo.raAluno}</td>
        <td>${emprestimo.nomeAluno}</td>
        <td>${formatarData(emprestimo.dataEmprestimo)}</td>
        <td>${formatarHora(emprestimo.horaEmprestimo)}</td>
      </tr>
    `
    )
    .join("");
}

function renderizarHistorico(emprestimos = []) {
  if (!emprestimos.length) {
    exibirMensagem(tabelaHistorico, 6, "Nenhum empréstimo registrado.");
    return;
  }

  tabelaHistorico.innerHTML = emprestimos
    .map((emprestimo) => {
      const devolvido = Boolean(emprestimo.dataDevolucao);
      const statusClasse = devolvido ? "status-chip status-finalizado" : "status-chip status-ativo";
      const statusTexto = devolvido ? "Finalizado" : "Em aberto";
      return `
        <tr>
          <td>${emprestimo.codigoEmprestimo}</td>
          <td>${emprestimo.tituloLivro} (${emprestimo.codigoLivro})</td>
          <td>${emprestimo.nomeAluno} (${emprestimo.raAluno})</td>
          <td>${formatarDataHora(emprestimo.dataEmprestimo, emprestimo.horaEmprestimo)}</td>
          <td>${formatarDataHora(emprestimo.dataDevolucao, emprestimo.horaDevolucao)}</td>
          <td><span class="${statusClasse}">${statusTexto}</span></td>
        </tr>
      `;
    })
    .join("");
}

function atualizarResumo(livros = [], emprestimosAtivos = []) {
  const totalTitulos = livros.length;
  const totalDisponiveis = livros.reduce((acc, livro) => {
    const quantidade = Number(livro.QTD);
    return acc + (Number.isFinite(quantidade) && quantidade > 0 ? quantidade : 0);
  }, 0);
  const totalEmprestados = Array.isArray(emprestimosAtivos) ? emprestimosAtivos.length : 0;

  totalLivrosSpan.textContent = totalTitulos;
  livrosDisponiveisSpan.textContent = totalDisponiveis;
  livrosEmprestadosSpan.textContent = totalEmprestados;
}

async function carregarGerenciamento() {
  setCarregando(tabelaLivros, 7);
  setCarregando(tabelaEmprestados, 6);
  setCarregando(tabelaHistorico, 6);

  try {
    const [livros, emprestimosAtivos, historico] = await Promise.all([
      fetchJson(`${API_BASE}/api/livros`),
      fetchJson(`${API_BASE}/api/emprestimos/ativos`),
      fetchJson(`${API_BASE}/api/emprestimos`),
    ]);

    renderizarLivros(livros);
    renderizarEmprestados(emprestimosAtivos);
    renderizarHistorico(historico);
    atualizarResumo(livros, emprestimosAtivos);
  } catch (error) {
    exibirMensagem(tabelaLivros, 7, `Erro ao carregar livros: ${error.message}`);
    exibirMensagem(tabelaEmprestados, 6, `Erro ao carregar empréstimos: ${error.message}`);
    exibirMensagem(tabelaHistorico, 6, `Erro ao carregar histórico: ${error.message}`);
  }
}

btnAtualizar.addEventListener("click", carregarGerenciamento);
document.addEventListener("DOMContentLoaded", carregarGerenciamento);

// ------------ Interações de edição/deleção ------------

function abrirModalEdicao(livro) {
  campoCodigo.value = livro.CODIGO;
  campoTitulo.value = livro.TITULO;
  campoAutor.value = livro.AUTOR || "";
  campoCategoria.value = livro.CATEGORIA || "";
  campoEditora.value = livro.EDITORA || "";
  campoQuantidade.value = livro.QTD;
  mensagemEdicao.textContent = "";
  modalEditar.classList.remove("oculto");
}

function fecharModalEdicao() {
  modalEditar.classList.add("oculto");
  formEditarLivro.reset();
}

function mostrarMensagemEdicao(texto, tipo = "erro") {
  mensagemEdicao.textContent = texto;
  mensagemEdicao.style.color = tipo === "sucesso" ? "#1f7a3b" : "#c62828";
}

tabelaLivros.addEventListener("click", (event) => {
  const botao = event.target.closest("button[data-acao]");
  if (!botao) return;

  const codigo = botao.dataset.codigo;
  const livro = livrosCache.find((l) => String(l.CODIGO) === String(codigo));
  if (!livro) return;

  if (botao.dataset.acao === "editar") {
    abrirModalEdicao(livro);
  } else if (botao.dataset.acao === "deletar") {
    deletarLivro(livro);
  }
});

btnCancelarEdicao.addEventListener("click", fecharModalEdicao);

formEditarLivro.addEventListener("submit", async (event) => {
  event.preventDefault();
  const codigo = campoCodigo.value;
  const payload = {
    titulo: campoTitulo.value.trim(),
    autor: campoAutor.value.trim(),
    categoria: campoCategoria.value.trim(),
    editora: campoEditora.value.trim(),
    quantidade: Number(campoQuantidade.value)
  };

  try {
    const resposta = await fetch(`${API_BASE}/api/livros/${codigo}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      mostrarMensagemEdicao(resultado.mensagem || "Erro ao atualizar livro.");
      return;
    }

    mostrarMensagemEdicao(resultado.mensagem || "Livro atualizado com sucesso!", "sucesso");
    setTimeout(() => {
      fecharModalEdicao();
      carregarGerenciamento();
    }, 800);
  } catch (error) {
    mostrarMensagemEdicao("Erro ao conectar ao servidor.");
  }
});

async function deletarLivro(livro) {
  const confirmar = window.confirm(`Tem certeza que deseja excluir o livro "${livro.TITULO}"?`);
  if (!confirmar) return;

  try {
    const codigo = String(livro.CODIGO);
    const resposta = await fetch(`${API_BASE}/api/livros/${codigo}`, {
      method: "DELETE"
    });

    const resultado = await resposta.json();
    if (!resposta.ok) {
      alert(resultado.mensagem || "Erro ao excluir livro.");
      return;
    }

    alert(resultado.mensagem || "Livro excluído com sucesso!");
    carregarGerenciamento();
  } catch (error) {
    console.error("Erro ao deletar livro:", error);
    alert("Erro ao conectar ao servidor.");
  }
}

