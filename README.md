# voicejs
---------

Criei esta biblioteca para ajudar a utilizar o reconhecimento de voz e a fala nativa dos navegadores.

Lembrando que em toda a página que for utilizar é necessário executar o seguinte código:
> voicejs.init();

Para utilizar a fala do navegador basta executar o seguinte código:
> voicejs.speak("texto desejado");

Para utilizar os comandos de voz é necessário efetuar o cadastro de comandos, o comando é um objeto com duas propriedades:
- command: é responsável pelo que o usuário deverá falar para ser executado, ele poderá possuir parâmetros que devem ser passados por chaves duplas. Ex: "abrir site {{site}}"
- callback: deve ser uma função que será executada ao comando de voz ser executado, caso o command possua parâmetros será enviado um objeto com todos os parâmetros a esta função.

Exemplo de cadastro de commandos:
>voicejs.listeningCommands.push({
command: "abrir site {{site}}",
callback: function(parametro) { console.log('Comando ativado', parametro); }
});

Para começar a escutar o que o usuário está falando basta executar o comando:
> voicejs.startListening();

Para parar de escutar o que o usuário está falando basta executar o comando:
> voicejs.stopListening();
