const campoBusca = document.getElementById("buscarLivro");
const tbody = document.getElementById("tabelaLivros");
const mensagem = document.getElementById("mensagem");
let timeoutBusca = null;

// Função para realizar a busca
async function realizarBusca(busca) {
  // Limpa tabela e mensagem
  tbody.innerHTML = "";
  mensagem.textContent = "";

  let livros = [];

  try {
    // Se o campo estiver vazio, busca todos os livros
    if (busca === "") {
      const response = await fetch("http://localhost:3000/api/livros");
      livros = await response.json();
    }
    // Se for código numérico
    else if (!isNaN(busca) && busca.trim() !== "") {
      const response = await fetch(`http://localhost:3000/api/livros/${busca}`);
        
      if (response.ok) {
        const livro = await response.json();
        livros = [livro];
      }

    } else {
      // Busca todos e filtra por título
      const response = await fetch("http://localhost:3000/api/livros");
      const todos = await response.json();

      livros = todos.filter(l =>
        l.TITULO.toLowerCase().includes(busca.toLowerCase())
      );
    }

    // Nenhum livro encontrado
    if (livros.length === 0) {
      mensagem.textContent = "Nenhum livro encontrado.";
      mensagem.style.color = "red";
      return;
    }

    // Preenche tabela
    livros.forEach(livro => {
      const status = livro.QTD > 0 ? "Disponível" : "Emprestado";
      const classe = livro.QTD > 0 ? "disponivel" : "emprestado";

      tbody.innerHTML += `
        <tr>
          <td>${livro.CODIGO}</td>
          <td>${livro.TITULO}</td>
          <td>${livro.QTD}</td>
          <td class="${classe}">${status}</td>
        </tr>
      `;
    });
  } catch (error) {
    mensagem.textContent = "Erro ao buscar livros.";
    mensagem.style.color = "red";
    console.error("Erro na busca:", error);
  }
}

// Busca em tempo real enquanto o usuário digita
campoBusca.addEventListener("input", (e) => {
  const busca = e.target.value.trim();
  
  // Limpa o timeout anterior
  if (timeoutBusca) {
    clearTimeout(timeoutBusca);
  }

  // Aguarda 300ms após o usuário parar de digitar para fazer a busca
  timeoutBusca = setTimeout(() => {
    realizarBusca(busca);
  }, 300);
});

// Mantém o comportamento do formulário para compatibilidade
document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const busca = campoBusca.value.trim();
  realizarBusca(busca);
});

// Carrega todos os livros quando a página é aberta
document.addEventListener("DOMContentLoaded", () => {
  realizarBusca("");
});
