document.addEventListener("DOMContentLoaded", function () {
    localStorage.removeItem("FormaPagamento");
    const botoes = document.querySelectorAll('.nav-item a');
    const titulo = document.querySelector("header h4");
    const offcanvasNavbar = new bootstrap.Offcanvas(document.getElementById('offcanvasNavbar2')); // Obtendo o menu lateral
    
    function atualizarPreco(preçoElement, preçoNumerico, quantidade) {
        if (quantidade == 0){
            const preçoAtual = preçoNumerico;
            preçoElement.textContent = `R$ ${preçoAtual.toFixed(2).replace('.', ',')}`;
            return preçoAtual;
        }
        const preçoAtual = preçoNumerico * quantidade;
        preçoElement.textContent = `R$ ${preçoAtual.toFixed(2).replace('.', ',')}`;
        return preçoAtual;
    }

    function carregarCategoria(categoria) {
        let categoria_selecionada = categoria.getAttribute("data-categoria");
        let url = `${categoria_selecionada}.html`;
        console.log("URL:", url);
        titulo.textContent = categoria.textContent;

        // Salva a categoria selecionada no localStorage
        localStorage.setItem('ultimaCategoria', categoria_selecionada);

        $("#teste").load(url, function () {
            document.querySelectorAll('.card').forEach(card => {
                let input = card.querySelector(".contador");
                let btnIncrementar = card.querySelector(".incrementar");
                let btnDecrementar = card.querySelector(".decrementar");
                let btnGo = card.querySelector(".add-cart");

                let preçoElement = card.querySelector(".preço");
                let preçoTexto = preçoElement ? preçoElement.textContent.trim() : '';
                let preçoNumerico = parseFloat(preçoTexto.replace('R$', '').replace(',', '.'));
                let produtoId = card.id;

                if (input && btnIncrementar && btnDecrementar) {
                    btnIncrementar.addEventListener("click", function () {
                        let valor = parseInt(input.value);
                        if (valor < 99) {
                            input.value = valor + 1;
                            atualizarPreco(preçoElement, preçoNumerico, input.value);
                        }
                    });

                    btnDecrementar.addEventListener("click", function () {
                        let valor = parseInt(input.value);
                        if (valor > 0) {
                            input.value = valor - 1;
                            atualizarPreco(preçoElement, preçoNumerico, input.value);
                        }
                    });
                }

                if (btnGo) {
                    btnGo.addEventListener("click", function () {
                        let contadorValor = parseInt(input.value);
                        let preçoAtual = preçoNumerico * contadorValor;

                        let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
                        let itemExistente = carrinho.find(item => item.produtoId === produtoId);

                        if (itemExistente) {
                            itemExistente.contadorValor += contadorValor;
                            itemExistente.preço += preçoNumerico * contadorValor;
                        } else {
                            carrinho.push({
                                produtoId: produtoId,
                                cardHtml: card.outerHTML,
                                contadorValor: contadorValor,
                                preço: preçoAtual,
                            });
                        }
                        if (input.value > 0){
                            localStorage.setItem("carrinho", JSON.stringify(carrinho));
                            $('#modalConfirmacao').modal('show');
                        }
                    });
                }
            });
        });

        // Fecha o menu lateral ao selecionar uma categoria
        offcanvasNavbar.hide();
    }

    botoes.forEach(botao => {
        botao.addEventListener("click", function (event) {
            event.preventDefault();
            carregarCategoria(botao);
        });
    });

    const categoriaSalva = localStorage.getItem('ultimaCategoria') || 'plebeus-smash';
    const categoriaInicial = document.querySelector(`.nav-item a[data-categoria='${categoriaSalva}']`);
    if (categoriaInicial) {
        carregarCategoria(categoriaInicial);
    }

    document.getElementById("irParacarrinho").addEventListener("click", function () {
        window.location.href = "../carrinho.html";
    });

    document.getElementById("continuarComprando").addEventListener("click", function () {
        $('#modalConfirmacao').modal('hide');
    });
});