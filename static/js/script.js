// Abre o modal do endereço quando o botão de enviar é clicado
document.getElementById('enviarPedidoBtn').addEventListener('click', function() {
    // Verifica se o carrinho tem itens antes de abrir o modal
    let carrinho = localStorage.getItem('carrinho');
    if (!carrinho || JSON.parse(carrinho).length === 0) {
        alert("Seu carrinho está vazio. Adicione itens antes de prosseguir.");
        return;
    }

    // Abre o modal do endereço
    let modal = new bootstrap.Modal(document.getElementById('enderecoModal'));
    modal.show();
});

// Captura o envio do formulário de endereço
document.getElementById('formEndereco').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o recarregamento da página

    // Pega os valores dos campos
    let rua = document.getElementById('rua').value.trim();
    let numero = document.getElementById('numero').value.trim();
    let bairro = document.getElementById('bairro').value.trim();
    let referencia = document.getElementById('referencia').value.trim();

    // Verifica se os campos obrigatórios estão preenchidos
    if (!rua || !numero || !bairro) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    // Monta o endereço formatado
    const endereco = `${rua}, Nº ${numero} - ${bairro}${referencia ? `, Ref: ${referencia}` : ''}`;

    // Salva os dados no localStorage
    salvarDadosNoLocalStorage(endereco);

    // Fecha o modal após confirmar
    let modal = bootstrap.Modal.getInstance(document.getElementById('enderecoModal'));
    modal.hide();

    // Enviar o pedido via WhatsApp
    enviarPedidoWhatsApp();
});

// Função para salvar os dados no localStorage
function salvarDadosNoLocalStorage(endereco) {
    let teste = localStorage.getItem('resumoPedidos');

    if (!teste) {
        console.log("Nenhum pedido armazenado.");
        return;
    }

    let teste2 = JSON.parse(teste).pedidos;
    console.log(teste2);

    let total = 0;

    // Formatando os itens do pedido e calculando o total
    let textoFinal = teste2.map(item => {
        let precoTotal = item.precoTotal;
        total += precoTotal;
        return `➡️ ${item.quantidade}x ${item.nome} (R$ ${item.precoUnitario.toFixed(2).replace('.', ',')}) - R$ ${precoTotal.toFixed(2).replace('.', ',')}`;
    }).join('\n'); // Quebra de linha entre os itens

    console.log(textoFinal);

    const dados = {
        "itens": textoFinal,
        "endereco": endereco,
        "total": total.toFixed(2).replace('.', ',')
    };

    // Armazenando os dados no localStorage
    localStorage.setItem('dadosPedido', JSON.stringify(dados));
}

// Função para enviar o pedido via WhatsApp
function enviarPedidoWhatsApp() {
    const dadosPedido = JSON.parse(localStorage.getItem('dadosPedido'));

    if (!dadosPedido) {
        console.log("Nenhum pedido armazenado.");
        return;
    }

    const numeroWhatsApp = "+5589994029906";
    console.log(dadosPedido.total);

    // Criando a mensagem formatada
    const mensagem = 
        "Pedido n° 001\n\n" +
        "Itens:\n" + dadosPedido.itens + "\n\n" +
        "🛵Delivery (taxa de: R$ 2,99)\n" +
        "🏠 " + dadosPedido.endereco + " (Estimativa: entre 30~70 minutos)\n\n" +
        "Total: R$ " + dadosPedido.total + "\n\n" +
        "Obrigado pela preferência, se precisar de algo é só chamar!😉\n";

    // Criando a URL para redirecionar ao WhatsApp
    const url = "https://wa.me/" + numeroWhatsApp + "?text=" + encodeURIComponent(mensagem);

    // Removendo os itens do localStorage
    localStorage.removeItem('carrinho');
    localStorage.removeItem('dadosPedido');
    localStorage.removeItem('resumoPedidos');
    localStorage.removeItem('ultimaCategoria');

    // Abrindo o WhatsApp com a mensagem pronta
    window.open(url, "_blank");
}
