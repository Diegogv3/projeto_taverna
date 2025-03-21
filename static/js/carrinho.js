$(document).ready(function () {
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    let total = 0;
    let resumoPedidos = ''; // Move isso para fora do loop para acumular os pedidos corretamente.

    $(document).on("click", ".btn-payment", function () {
        $(".btn-payment").removeClass("ativo");
        $(this).addClass("ativo");
        let forma_pagamento = $(this).text().replace(/\s+/g, '');
        localStorage.setItem("FormaPagamento",JSON.stringify(forma_pagamento));
    });

    $(document).on("click", ".voltar", function () {
        localStorage.removeItem("FormaPagamento");
    });

    if (carrinho.length > 0) {
        carrinho.forEach(item => {

            function atualizarResumojson() {
                let listaPedidos = [];
                
                carrinho.forEach(item => {
                    // Calcular o preço unitário corretamente
                    let precoUnitario = item.preço / item.contadorValor;
                    let precoTotal = item.preço; // O preço total já está armazenado em item.preço
                    
                    // Verificar a propriedade correta para o nome do produto
                    let tempDiv = $("<div>").html(item.cardHtml);
                    let nomeProduto = tempDiv.find(".card-header h4").text().trim() || "Produto Desconhecido";
            
                    // Criar um objeto com os dados do pedido
                    let pedido = {
                        nome: nomeProduto,
                        quantidade: item.contadorValor,
                        precoUnitario: precoUnitario,
                        precoTotal: precoTotal
                    };
            
                    // Adicionar o objeto ao array de pedidos
                    listaPedidos.push(pedido);
                });
            
                // Atualizar o resumo no localStorage
                let resumoPedidos = { pedidos: listaPedidos };
                localStorage.setItem("resumoPedidos", JSON.stringify(resumoPedidos));
            
                // Caso queira gerar um resumo formatado como texto, pode fazer isso após salvar os dados
                let textoFinal = listaPedidos.map(item => {
                    return `➡️ ${item.quantidade}x ${item.nome} (R$ ${item.precoUnitario.toFixed(2).replace('.', ',')}) - R$ ${item.precoTotal.toFixed(2).replace('.', ',')}`;
                }).join(' \n'); // Adicionando a setinha e separando por linha

            }
            atualizarResumoCarrinho();
            atualizarResumojson();

            $("#pagamento").append(item.cardHtml);

            $(".textos-card").removeClass("row-cols-sm-1 w-100").addClass("row-cols-2 w-100");
            $(".teste").removeClass("ms-sm-0 ms-md-4");
            $(".card-corpo").addClass("mb-3");
            $(".image").removeClass("col-12 col-sm-4");
            $(".texts-c").removeClass("col-12 col-sm-8");
            $(".image").addClass("col-sm-5 col-6 col-md-6");
            $(".image img").removeClass("pe-sm-2 pt-sm-2 p-0");
            $(".card-title").removeClass("ms-sm-3");
            $(".card-title").addClass("fs-5");
            $(".texts-c").addClass("col-sm-7 col-6 col-md-6");

            let precoAtt = $(`#${item.produtoId} .preço`);
            if (precoAtt.length) {
                precoAtt.text(`R$ ${item.preço.toFixed(2).replace('.', ',')}`);
            }

            let contadorInput = $(`#${item.produtoId} .contador`);
            if (contadorInput.length) {
                contadorInput.val(item.contadorValor);

                let btnIncrementar = $(`#${item.produtoId} .incrementar`);
                let btnDecrementar = $(`#${item.produtoId} .decrementar`);

                btnIncrementar.on("click", function () {
                    atualizarQuantidade(item, contadorInput, 1);
                    atualizarResumojson();
                });

                btnDecrementar.on("click", function () {
                    atualizarQuantidade(item, contadorInput, -1);
                    atualizarResumojson();
                });

                contadorInput.on("input blur", function () {
                    let valorDigitado = parseInt(contadorInput.val()) || 1;
                    contadorInput.val(Math.min(Math.max(valorDigitado, 1), 99));
                    atualizarQuantidadeDiretamente(item, contadorInput);
                });
            }

            let precoUnitario = item.preço / item.contadorValor;
            resumoPedidos += `
                <div class="pedido-item">
                    <span>${item.contadorValor} x </span>
                    <span>${$(item.cardHtml).find(".card-title").text()}</span>
                    <span>(R$ ${precoUnitario.toFixed(2).replace('.', ',')})</span>
                    <span>- R$ ${item.preço.toFixed(2).replace('.', ',')}</span>
                </div>
            `;
            total += item.preço;
        });
        $("#pagamento").removeClass("d-flex justify-content-center align-items-center");
        $("#resumoPedidos").html(resumoPedidos).show();
        $("#precoTotal").text(`R$ ${total.toFixed(2).replace('.', ',')}`);
        $("#pagamento").show();
    } else {
        $("#pagamento").addClass("d-flex justify-content-center align-items-center");
        $("#resumoPedidos").html("<p>Nenhum item no carrinho.</p>").show();
        $("#precoTotal").text("R$ 0,00");
        $("#pagamento").html("<p>Sem pedidos no momento.</p>").show();
    }

    $(document).on("click touchstart", ".excluir", function (event) {
        event.preventDefault();

        let idProduto = $(this).closest(".card").attr("id");

        carrinho = carrinho.filter(item => item.produtoId !== idProduto);

        atualizarLocalStorage();

        $(this).closest(".card").remove();

        atualizarResumoCarrinho();
    });

    function atualizarQuantidade(item, contadorInput, incremento) {
        let novoValor = Math.min(Math.max(parseInt(contadorInput.val()) + incremento, 1), 99);
        item.preço = (item.preço / item.contadorValor) * novoValor;
        item.contadorValor = novoValor;
        contadorInput.val(novoValor);

        $(`#${item.produtoId} .preço`).text(`R$ ${item.preço.toFixed(2).replace('.', ',')}`);
        atualizarLocalStorage();
        atualizarResumoCarrinho();
    }

    function atualizarQuantidadeDiretamente(item, contadorInput) {
        let novoValor = Math.min(Math.max(parseInt(contadorInput.val()), 1), 99);
        item.preço = (item.preço / item.contadorValor) * novoValor;
        item.contadorValor = novoValor;

        $(`#${item.produtoId} .preço`).text(`R$ ${item.preço.toFixed(2).replace('.', ',')}`);
        atualizarLocalStorage();
        atualizarResumoCarrinho();
    }

    function atualizarLocalStorage() {
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
    }

    function atualizarResumoCarrinho() {
        let total = 0;
        let resumoPedidos = '';

        carrinho.forEach(item => {
            let precoUnitario = item.preço / item.contadorValor;
            resumoPedidos += `
                <div class="pedido-item">
                    <span>${item.contadorValor} x </span>
                    <span>${$(item.cardHtml).find(".card-title").text()}</span>
                    <span>(R$ ${precoUnitario.toFixed(2).replace('.', ',')})</span>
                    <span>- R$ ${item.preço.toFixed(2).replace('.', ',')}</span>
                </div>
            `;
            total += item.preço;
        });

        if (carrinho.length === 0) {
            $("#pagamento").addClass("d-flex justify-content-center align-items-center");
            $("#pagamento").html("<p>Sem pedidos no momento.</p>").show();
            $("#resumoPedidos").html("<p>Nenhum item no carrinho.</p>").show();
            $("#precoTotal").text("R$ 0,00");
        } else {
            $("#pagamento").removeClass("d-flex justify-content-center align-items-center");
            $("#resumoPedidos").html(resumoPedidos).show();
            $("#precoTotal").text(`R$ ${total.toFixed(2).replace('.', ',')}`);
        }
    }
});
