//Socket do cliente (client-side)
var socket = io();

socket.on('userConnected', function() {
	showUserConnected();
});

socket.on('userDisconnected', function() {
	showUserDisconnected();
});

socket.on('updateClientsCount', function(count) {
	updateClientsCount(count);
});

//objetos
function BoletimOcorrencia(numeroProtocolo, dadosOcorrencia, vitima, comunicante) {
	this.numeroProtocolo = numeroProtocolo;
	this.dadosOcorrencia = dadosOcorrencia;
	this.vitima = vitima;
	this.comunicante = comunicante;
}

function DadosOcorrencia(modalidade, local, tipoLocal, dataFato, horaFato, relatoFato) {
	this.modalidade = modalidade;
	this.local = local;
	this.tipoLocal = tipoLocal;
	this.dataFato = dataFato;
	this.horaFato = horaFato;
	this.relatoFato = relatoFato;
}

function Vitima(nomeCompleto, RGCPF, nacionalidade, dataNascimento, profissao) {
	this.nomeCompleto = nomeCompleto;
	this.RGCPF = RGCPF;
	this.nacionalidade = nacionalidade;
	this.dataNascimento = dataNascimento;
	this.profissao = profissao;
}

function Comunicante(nomeCompleto, RGCPF, telefone) {
	this.nomeCompleto = nomeCompleto;
	this.RGCPF = RGCPF;
	this.telefone = telefone;
}

function cadastrarBO() {
	var form = document.getElementById('formBO');
	var dadosOcorr = new DadosOcorrencia(
		document.getElementById('chipModalidade').innerText,
		form.local.value,
		form.tipoLocalOptions.value,
		form.dataFato.value,
		form.horaFato.value,
		form.relatoFato.value		
	);
	
	var vit = new Vitima(
		form.vitimaNomeCompleto.value,
		form.vitimaRGCPF.value,
		form.vitimaNacionalidade.value,
		form.vitimaDataNascimento.value,
		form.vitimaProfissao.value
	);
	
	var com = new Comunicante(
		form.comunicanteNomeCompleto.value,
		form.comunicanteRGCPF.value,
		form.comunicanteTelefone.value
	);
	
	var strNumeroAleatorio = (Math.random() * 9999999999999).toString();
	var numeroProtocolo = strNumeroAleatorio.substring(0, strNumeroAleatorio.indexOf('.'));
	
	var bo = new BoletimOcorrencia(
		numeroProtocolo,
		dadosOcorr,
		vit,
		com
	);
		
	console.log(bo);
	
	socket.emit('registerBO', bo);
	
	document.getElementById('numeroProtocolo').innerHTML = numeroProtocolo;
	dialog.showModal();
	
	insertBO(bo);
}


var dialog = document.querySelector('dialog');
//var showModalButton = document.querySelector('.show-modal');

if (!dialog.showModal) {
	dialogPolyfill.registerDialog(dialog);
}

//showModalButton.addEventListener('click', function() {
//	dialog.showModal();
//});

dialog.querySelector('.close').addEventListener('click', function() {
	dialog.close();
	gridModalidades.style.display = 'flex';
	gridFormulario.style.display = 'none';
});

function showUserConnected() {
	var snackbarContainer = document.querySelector('#demo-toast-example');
	var data = {
		message: 'Um usuário conectou-se ao Sistema de Delegacia Eletrônica.'
	};
	snackbarContainer.MaterialSnackbar.showSnackbar(data);
};

function showUserDisconnected() {
	var snackbarContainer = document.querySelector('#demo-toast-example');
	var data = {
		message: 'Um usuário desconectou-se do Sistema de Delegacia Eletrônica.'
	};
	snackbarContainer.MaterialSnackbar.showSnackbar(data);
};

socket.on('resultSearchBO', function(bo) {
	if (bo == '') {
		document.getElementById('resultado').innerHTML = 'Não houve resultado para o Número de Protocolo informado.'
	} else {
		visualizarBO(bo)
	}
});

function consultarBO() {
	var numeroProtocolo = document.getElementById('consultarNumeroProtocolo').value;
	socket.emit('searchBO', numeroProtocolo);
}

function visualizarBO(bo) {
	var resultado = document.getElementById('resultado');
	var conteudo = '<p class="helena-titulo-primary-color"> Dados da Ocorrência </p>';
	
	conteudo = conteudo + bo.dadosOcorrencia.modalidade + '<br>';
	conteudo = conteudo + bo.dadosOcorrencia.local + '<br>';
	
	var tipoLocal = "";
	switch (bo.dadosOcorrencia.tipoLocal) {
		case '1': tipoLocal = 'Via pública'; break;
		case '2': tipoLocal = 'Residência'; break;
		case '3': tipoLocal = 'Outros'; break;
	}
	
	conteudo = conteudo + tipoLocal + '<br>';
	conteudo = conteudo + bo.dadosOcorrencia.dataFato + '<br>';
	conteudo = conteudo + bo.dadosOcorrencia.horaFato + '<br> <br>';
	
	conteudo = conteudo + ' <p class="helena-titulo-primary-color"> Vítima </p>';
	
	conteudo = conteudo + bo.vitima.nomeCompleto + '<br>';
	conteudo = conteudo + bo.vitima.RGCPF + '<br>';
	conteudo = conteudo + bo.vitima.nacionalidade + '<br>';
	conteudo = conteudo + bo.vitima.dataNascimento + '<br>';
	conteudo = conteudo + bo.vitima.profissao + '<br> <br>';
	
	
	conteudo = conteudo + ' <p class="helena-titulo-primary-color"> Comunicante </p>';
	
	conteudo = conteudo + bo.comunicante.nomeCompleto + '<br>';
	conteudo = conteudo + bo.comunicante.RGCPF + '<br>';
	conteudo = conteudo + bo.comunicante.telefone + '<br> <br>';
	
	conteudo = conteudo + ' <p class="helena-titulo-primary-color"> Relato do fato </p> ';
	
	conteudo = conteudo + bo.dadosOcorrencia.relatoFato + '<br> <br>';
	
	console.log(conteudo);	
	
	resultado.innerHTML = conteudo;
}


//dinamica das paginas
var clientsCount = document.getElementById('clientsCount');
var clientsCountBadge = document.getElementById('clientsCountBadge');

function updateClientsCount(count) {
	clientsCount.innerHTML = count;
	clientsCountBadge.setAttribute('data-badge', count);
}

var buttonsModalidade = document.getElementsByClassName('helena-button-modalidade');

for(var i = 0; i < buttonsModalidade.length; i++) {
	buttonsModalidade[i].addEventListener('click', loadForm);
}

var gridModalidades = document.getElementById('gridModalidades');
var gridFormulario  = document.getElementById('gridFormulario');
var chipModalidade  = document.getElementById('chipModalidade');

function loadForm(element) {
//	console.log(element.target.innerHTML);
	gridModalidades.style.display = 'none';
	chipModalidade.innerHTML = element.target.innerHTML;
	gridFormulario.style.display = 'flex';
}

function insertBO(bo) {
	var tableBO = document.getElementById('tableBO');
	
	var newtr = document.createElement('tr');
	
	var tdProtocolo = document.createElement('td');	
	tdProtocolo.innerText = bo.numeroProtocolo;
	
	var tdModalidade = document.createElement('td');
	tdModalidade.innerText = bo.dadosOcorrencia.modalidade;
	
	var tdData = document.createElement('td');
	tdData.innerText = bo.dadosOcorrencia.dataFato;
	
	var tdHora = document.createElement('td');
	tdHora.innerText = bo.dadosOcorrencia.horaFato;
	
	newtr.append(tdProtocolo);
	newtr.append(tdModalidade);
	newtr.append(tdData);
	newtr.append(tdHora);
	
	tableBO.append(newtr);
}