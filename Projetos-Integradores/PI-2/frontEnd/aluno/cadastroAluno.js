document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("formCadastro");
  const msg = document.getElementById("mensagem");

  function mostrarMensagem(texto, cor) {
    msg.innerText = texto;
    msg.style.color = cor;
  }

  function validarRA(ra) {
    return /^[0-9]{8}$/.test(ra);
  }

  function validarNome(nome) {
    return /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{3,}$/.test(nome);
  }

  function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validarTelefone(tel) {
    return /^[0-9]{8,11}$/.test(tel);
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const ra = document.getElementById("ra").value.trim();
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefone = document.getElementById("tel").value.trim();

    // Novo: Verifica se todos os campos estão em branco
    if (!ra && !nome && !email && !telefone) {
      mostrarMensagem("Todos os campos estão em branco, por favor, preencha para realizar o cadastro.", "red");
      return;
    }

    if (!validarRA(ra))
      return mostrarMensagem("RA inválido. Deve conter 8 números.", "red");
    if (!validarNome(nome))
      return mostrarMensagem("Nome inválido. Deve conter apenas letras.", "red");
    if (!validarEmail(email))
      return mostrarMensagem("Email inválido.", "red");
    if (!validarTelefone(telefone))
      return mostrarMensagem("Telefone inválido. Deve conter apenas números, mínimo 8 e máximo 11 números.", "red");

    try {
      const resposta = await fetch("http://localhost:3000/alunos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ra, nome, email, telefone }),
      });

      if (!resposta.ok) {
        const erroData = await resposta.json();
        mostrarMensagem(erroData.mensagem || erroData.message || `Erro do servidor: ${resposta.status}`, "red");
        return;
      }

      mostrarMensagem("Cadastro realizado com sucesso!", "green");
      form.reset();
    } catch (erro) {
      mostrarMensagem("Erro ao conectar ao servidor. Tente novamente mais tarde.", "red");
    }
  });
});
