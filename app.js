var express = require('express');
var app = express();

//Entregar arquivos estáticos como imagens, arquivos CSS, e arquivos JavaScript
//Exemplo:
//pasta raiz/public/helloworld.txt
//http://localhost:3000/helloworld.txt
app.use(express.static('public'));

//Entretanto, o caminho fornecido para a função express.static é relativa ao diretório a partir do qual você inicia o seu node de processo. 
//Se você executar o aplicativo express a partir de outro diretório, é mais seguro utilizar o caminho absoluto do diretório para o qual deseja entregar.
//app.use('/static', express.static(__dirname + '/public'));

//Roteamento básico
//app.METHOD(PATH, HANDLER) {}
//app é uma instância do express.
//METHOD é um método de solicitação HTTP. (GET, POST, PUT, DELETE)
//PATH é um caminho no servidor.
//HANDLER é a função executada quando a rota é correspondida.

//raiz
app.get('/', function(req, res){
    //res.send('Hello World!');
	res.sendFile(__dirname + '//index.html');
});

//register
app.get('/teste', function(req, res){
    res.send('Rota teste');
});

/*
app.listen(3000, function () {
  console.log('app listening on port 3000!');
});

var server = app.listen(3000, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("app listening at http://%s:%s", host, port)
})
*/

/*******************************************/

var http = require('http').Server(app);
var io = require('socket.io')(http)

//Ao utilizar o Scocket.io a criação da porta deve ser com a variável http
http.listen(3000, function(){
  console.log('listening on port 3000');
});

var clientsCount = 0;

//array de todos os boletins de ocorrencia cadastrados no sistema
var bos = [];

//io     = socket servidor
//client = socket cliente
io.on('connection', function (client) {
	var socketId = client.id;
	var clientIp = client.request.connection.remoteAddress;
	console.log('A client connected    - Socket ID = ' + socketId + ' | IP Address = ' + clientIp);
	clientsCount++;
	
	// enviar para todos os clientes, exceto o atual
	client.broadcast.emit('userConnected');
	
	// enviar apenas para o cliente atual
	client.emit('BOsRegistered', bos);
	
	// enviar para todos os clientes, inclusive o atual
	io.emit('updateClientsCount', clientsCount);
		
	client.on('disconnect', function () {
		var socketId = client.id;
		var clientIp = client.request.connection.remoteAddress;
		console.log('A client disconnected - Socket ID = ' + socketId + ' | IP Address = ' +clientIp);
		clientsCount--;
		io.emit('userDisconnected');
		io.emit('updateClientsCount', clientsCount);
	});
	
	client.on('registerBO', function (bo) {
		bos.push(bo);
		io.emit('newBORegistered', bo);
	});
	
	client.on('searchBO', function (numeroProtocolo) {
		var boolean = false;
		for(var i = 0; i < bos.length; i++) {
			if (numeroProtocolo == bos[i].numeroProtocolo) {
				boolean = true;
				client.emit('resultSearchBO', bos[i]);
			}
		}
		if (!boolean) {
			client.emit('resultSearchBO', '');
		}
	});
	
});






