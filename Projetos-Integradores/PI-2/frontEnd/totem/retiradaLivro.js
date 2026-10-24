// Seleciona os elementos
const msg = document.getElementById("mensagem");
const dataTexto = document.getElementById("dataRetirada");
const form = document.querySelector("form");

// Função para limpar mensagens
function limparMensagens() {
  msg.innerText = "";
  dataTexto.innerText = "";
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

  const retirada = {
    ra: document.getElementById("ra").value.trim(),
    codigoLivro: document.getElementById("codigoLivro").value.trim(),
  };

  // Nenhuma validação manual é necessária, pois o HTML já valida required e pattern

  try {
    const response = await fetch("http://localhost:3000/api/emprestimos/retirada", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(retirada),
    });

    const result = await response.json();
    
    // Debug: ver o que está sendo retornado
    console.log("Resultado da retirada:", result);

    if (response.ok) {
      mostrarMensagem(result.mensagem || "Retirada registrada com sucesso!", "success");

      // ADIÇÃO → Mostra data e hora enviadas pelo backend
      if (result.dataEmprestimo && result.horaEmprestimo) {
        const dataFormatada = formatarData(result.dataEmprestimo);
        dataTexto.innerText =
          `📅 Data: ${dataFormatada}  |  🕐 Hora: ${result.horaEmprestimo}`;
      } else {
        console.log("Data ou hora não encontradas:", { dataEmprestimo: result.dataEmprestimo, horaEmprestimo: result.horaEmprestimo });
        dataTexto.innerText = "";
      }

      e.target.reset();
    } else {
      mostrarMensagem(result.mensagem || "Erro ao registrar retirada.", "error");
      dataTexto.innerText = ""; // limpa exibição se der erro
    }
  } catch (error) {
    mostrarMensagem("Erro ao conectar ao servidor.", "error");
    dataTexto.innerText = ""; // limpa exibição em caso de erro
  }
});