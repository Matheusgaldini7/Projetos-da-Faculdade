document.querySelector("form").addEventListener("submit", async (e) => {
      e.preventDefault();

      const msg = document.getElementById("mensagem");

      function mostrarMensagem(texto, cor) {
        msg.innerText = texto;
        msg.style.color = cor;
      }

      const livro = {
        codigo: document.getElementById("codigo").value.trim(),
        titulo: document.getElementById("titulo").value.trim(),
        autor: document.getElementById("autor").value.trim(),
        quantidade: parseInt(document.getElementById("quantidade").value.trim()),
        categoria: document.getElementById("categoria").value.trim(),
        editora: document.getElementById("editora").value.trim(),
      };

      // Validações
      if (!livro.codigo || !livro.titulo || !livro.autor || !livro.quantidade || !livro.categoria || !livro.editora) {
        mostrarMensagem("Todos os campos são obrigatórios.", "red");
        return;
      }

      if (isNaN(livro.codigo) || !Number.isInteger(Number(livro.codigo))) {
        mostrarMensagem("O código deve conter apenas números inteiros.", "red");
        return;
      }

      if (isNaN(livro.quantidade) || Number(livro.quantidade) < 1) {
        mostrarMensagem("A quantidade deve ser um número >= 1.", "red");
        return;
      }

      // Validações para campos de texto: devem conter apenas letras e espaços
      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(livro.titulo)) {
        mostrarMensagem("O título deve conter apenas letras e espaços.", "red");
        return;
      }
      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(livro.autor)) {
        mostrarMensagem("O nome do autor deve conter apenas letras e espaços.", "red");
        return;
      }
      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(livro.categoria)) {
        mostrarMensagem("A categoria deve conter apenas letras e espaços.", "red");
        return;
      }
      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(livro.editora)) {
        mostrarMensagem("A editora deve conter apenas letras e espaços.", "red");
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/livros", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(livro),
        });

        const result = await response.json();

        if (response.ok) {
          mostrarMensagem(result.mensagem, "green");
          e.target.reset();
        } else {
          mostrarMensagem(result.mensagem, "red");
        }
      } catch (error) {
        mostrarMensagem("Erro ao conectar ao servidor.", "red");
      }
    });
