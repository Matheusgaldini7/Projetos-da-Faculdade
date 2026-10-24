// Seleciona os elementos
const msg = document.getElementById("mensagem");
const campoData = document.getElementById("dataDevolucao");
const form = document.querySelector("form");

// Função para limpar mensagens
function limparMensagens() {
  msg.innerText = "";
  campoData.innerText = "";
  msg.classList.remove("success", "error");
}

// Limpa mensagens quando o usuário começar a digitar
document.getElementById("ra").addEventListener("input", limparMensagens);
document.getElementById("codigoLivro").addEventListener("input", limparMensagens);

// Função para formatar data de yyyy-mm-dd para dd/mm/aaaa
function formatarData(dataISO) {
  if (!dataISO) return "";
  const partes = dataISO.split("-");
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataISO;
}

function mostrarMensagem(texto, tipo) {
  msg.innerText = texto;
  // Remove classes anteriores
  msg.classList.remove("success", "error");
  // Adiciona a classe correspondente
  if (tipo === "success") {
    msg.classList.add("success");
  } else {
    msg.classList.add("error");
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const devolucao = {
    ra: document.getElementById("ra").value.trim(),
    codigoLivro: document.getElementById("codigoLivro").value.trim(),
  };

  try {
    const response = await fetch("http://localhost:3000/api/emprestimos/devolucao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(devolucao),
    });

    const result = await response.json();
    
    // Debug: ver o que está sendo retornado
    console.log("Resultado da devolução:", result);

    if (response.ok) {
      mostrarMensagem(result.mensagem || "Devolução registrada com sucesso!", "success");

      // EXIBIR DATA E HORA
      if (result.dataDevolucao && result.horaDevolucao) {
        const dataFormatada = formatarData(result.dataDevolucao);
        campoData.innerText = `📅 Data: ${dataFormatada}  |  🕐 Hora: ${result.horaDevolucao}`;
      } else {
        console.log("Data ou hora não encontradas:", { dataDevolucao: result.dataDevolucao, horaDevolucao: result.horaDevolucao });
        campoData.innerText = "";
      }

      e.target.reset();
    } else {
      mostrarMensagem(result.mensagem || "Erro ao registrar devolução.", "error");
      campoData.innerText = ""; // limpa exibição se der erro
    }
  } catch (error) {
    mostrarMensagem("Erro ao conectar ao servidor.", "error");
    campoData.innerText = ""; // limpa exibição em caso de erro
  }
});