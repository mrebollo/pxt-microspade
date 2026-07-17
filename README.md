# microspade — Agentes Inteligentes Ligeros para BBC micro:bit

Esta extensión añade soporte para la programación de **Sistemas Multi-Agente (MAS)** ligeros en BBC micro:bit utilizando **TypeScript Estático** en MakeCode. Está especialmente diseñada para entornos educativos, permitiendo programar agentes mediante bloques o código.

El modelo sigue la filosofía de agentes inteligentes ligeros basados en comportamientos concurrentes (inspirado en [https://spadeagents.eu/](SPADE)) y mensajería basada en el estándar [https://www.allaboutai.com/ai-glossary/fipa-acl/](FIPA-ACL) que se transmite mediante la radio nativa del micro:bit.

## Qué es un agente

Un agente es una entidad dotada de cierto grado de autonomía que actúa sobre un entorno para alcanzar unos objetivos determinados. Puede ser un software, un robot o cualquier sistema capaz de percibir, pensar y actuar. Habitualmente, se define como una entidad reactiva (reacciona ante cambios en el entorno), proactiva (establece sus propios objetivos) y social (es capaz de comunicarse con otros agentes, dispositivos o usuarios). 

---

## Porqué usar agentes en micro:bit 

En el contexto de micro:bit, la abstracción de agente nos facilita la programación de determinados comportamientos, especialmente cuando queremos programar interacciones entre varios dispositivos que se encuentran situados en el mismo entorno, colaborando entre sí o compitiendo entre ellos. Podemos ver la micro:bit como un agente físico. 

Microspade proporciona una serie de comportamientos básicos que se ejecutan en segundo plano mientras se sigue atendiendo a los eventos que llegan por los distintos sensores. De esta manera podemos programar tareas que queremos que se ejecuten de forma cíclica, a intervalos de tiempo fijos (periódica) o una sola vez (oneshot o timeout si tiene un plazo de tiempo). Gracias a ellos se enriquece la forma de trabajar con la micro:bit, pero sin renunciar a la programación reactiva tradicional. 

Además, el modelo de mensajería nos facilita el diseño de aplicaciones que requieren la comunicación entre agentes. Está construido sobre el módulo de radio de micro:bit pero sin anularlo. De esta forma se puede seguir usando los mesajes de radio de la forma habitual, pero además se dispone de un mecanismo de más alto nivel y de un buzón para la comunicación entre agentes. El concepto de *performativa* viene de la [https://www.communicationtheory.org/speech-act-theory/](teoría de los actos de habla--speech acts--). Por ejemplo, un mensaje "temperatura=22" puede significar cosas distintas según estamos
- indicando qué temperatura hace (inform)
- preguntando qué temperatura hace (query)
- pidiendo que la habitación esté a esa temperatura (request)
La performativa es la que da el significado al mensaje y de ahí la importancia de elegir la performativa adecuada. 

Microspade está pensada para ejecutar programas de forma distribuida en un grupo de micro:bits que se encuentran en el mismo entorno físico, lo que da lugar a una nueva forma de programar más acorde con la naturaleza de estos dispositivos. Se puede utilizar para el desarrollo de experimentos en robótica distribuida y otras técnicas de inteligencia artificial relacionadas con sistemas multi-agente.

---

## Características Principales

*   **Ciclo de vida encapsulado**: Creación, arranque y parada de agentes con muescas nativas de MakeCode.
*   **Comportamientos Concurrentes**: Ejecución cooperativa en segundo plano:
    *   *Cyclic (Cíclico)*: Ejecución en bucle continuo.
    *   *Periodic (Periódico)*: Ejecución a intervalos de tiempo fijos.
    *   *One Shot (Una vez)*: Ejecución única inmediata en segundo plano.
    *   *Timeout (Espera)*: Ejecución única tras un retardo de tiempo.
*   **Mensajería FIPA-ACL**: Mensajes con emisor, destinatario, performativa (tipo de mensaje) y cuerpo.
*   **Buzón de correo FIFO**: Almacenamiento seguro en cola con tamaño máximo para evitar saturación de memoria.
*   **Plantillas de filtrado**: Filtra los mensajes del buzón por destinatario, emisor o tipo de mensaje.

---

## Cómo importar la extensión

Para usar esta librería en MakeCode:

1.  Abre [https://makecode.microbit.org/](https://makecode.microbit.org/).
2.  Crea un nuevo proyecto o abre uno existente.
3.  Haz clic en el menú del engranaje (arriba a la derecha) y selecciona **Extensiones**.
4.  Pega la URL de tu repositorio de GitHub: `https://github.com/mrebollo/pxt-microspade` e impórtala.

---

## Mi primer agente: hola mundo

Como es habitual, vamos a empezar con el clásico "hola mundo". Vamos a crear un comportamiento para que el agente lo ejecute una sola vez al arrancar y muestre el mensaje en la pantalla.

```blocks
let myname = ""

microspade.onAgentStart("saludador", function () {
    myname = "pepe"
})

microspade.addOneShotBehaviour(function () {
    basic.showString("Hello " + myname)
})
```
En este ejemplo, arrastramos la caja "on agent start" y añadimos el nombre de nuestro agente, "saludador". Este nombre se utiliza para identificarlo en un entorno con varios agentes y poder enviarle mensajes. Si no se indica ningún nombre, por defecto se llamará "agente". Crea una variable "texto" y escribe lo que quieras que incluya en el saludo. 

Para añadir un comportamiento que se ejecute una sola vez, arrastra el bloque "add one shot behaviour".  Dentro, añade el bloque "show string" y rellena con el texto que quieres mostrar, que sera "Hello" más el contenido de la variable "texto" (arrástrala a la zona correspondiente).

Cuando arranques la placa, verás como se muestra en los leds el saludo.

---

## Envío y recepción de mensajes simples

En este otro ejemplo puedes ver cómo se realiza la comunicación entre agentes. Vamos a crear dos agentes: un emisor y un receptor. El emisor enviará cada 5 segundos el valor de su sensor de temperatura al receptor, que lo mostrará en su pantalla.


### 1. El Emisor (Termómetro)

Este agente mide periódicamente la temperatura y envía un mensaje de tipo `inform` al receptor.

Crea un bloque "on agent start" y escribe en el cuadro de texto el nombre del agente, por ejemplo "temp". A continuación, arrastra el bloque "add periodic behaviour" e indica el período de ejecución en milisegundos, por ejemplo 5000 para que se ejecute cada 5 segundos. Dentro vamos a añadir los bloques para enviar el valor de la temperatura al otro agente. Arrastra dentro el bloque "set message..." y rellena los campos del mensaje que quieres enviar
- en "to" pon el nombre del agente receptor, por ejemplo "cli" (de client). 
- en "body" arrastra el control que proporciona el valor del sensor de temperatura, se se encuentra en "Input"
- pincha en (+) para ver el campo "performative". Por defecto tiene el valor "inform", así que no hace falta cambiarlo. Si no, selecciona el adecuado en la lista desplegable.

Por último coloca el bloque "send message" a continuación y arrastra la variable "message" al campo vacio. Puedes cambiar el nombre de la variable "message" por cualquier otro.

No es neceario, pero para validar que funciona correctamente puedes añadir un bloque para que muestre el valor de la temperatura en la pantalla y confirmar en el ciente que está recibiendo el valor correcto.

```blocks
microspade.onAgentStart("temp", function () {

})

microspade.addPeriodicBehaviour(5000, function () {
    let temp = input.temperature()
    basic.showNumber(temp)
    let message = microspade.createMessage("cli", "" + temp, microspade.MessagePerformative.Inform)
    microspade.sendMessage(message)
})
```

### 2. El Receptor (Cliente)

Este agente escucha continuamente en segundo plano y muestra en los leds cualquier mensaje de temperatura que reciba de parte de `"temp"`. Crea un nuevo proyecto para este agente (solo puede haber un agente por placa).

Arrastra un bloque "on agent start" y escribe en el cuadro de texto el nombre del agente que has usado en el envío, en este caso "cli". Para estar pendiente de los mensajes, simplemente arrastra el bloque de evento "on message received".

Dentro de este evento, añade el bloque "show string" y muestra la temperatura extrayendo el campo de texto ("body") del mensaje recibido:

```blocks
microspade.onAgentStart("cli", function () {
    // Inicialización de variables locales del agente si son necesarias
})

microspade.onMessageReceived(function (received) {
    let bodyText = microspade.getMessageField(received, microspade.MessageField.Body)
    basic.showString(bodyText)
})
```

---

## Proyectos de Ejemplo Listos para Usar

Para facilitar el aprendizaje, puedes importar proyectos de ejemplo completos en MakeCode que ya tienen la extensión cargada y los bloques colocados:

1.  **Hola Mundo (ms hello world)**: 
    *   Un agente simple ("saludador") que utiliza un comportamiento de tipo *One Shot* para mostrar un saludo en pantalla.
    *   [Abrir proyecto en MakeCode Blocks](https://makecode.microbit.org/S51167-61185-00431-40389)
    *   Código fuente: [examples/hello_world.ts](file:///Users/mrebollo/devel/pxt-microspade/examples/hello_world.ts)
2.  **Contador Cíclico (ms counter)**:
    *   Uso de un comportamiento cíclico (*Cyclic*) para decrementar y mostrar una cuenta atrás hasta llegar a cero, parando el agente de forma controlada.
    *   [Abrir proyecto en MakeCode Blocks](https://makecode.microbit.org/S99434-71277-80785-71507)
    *   Código fuente: [examples/counter.ts](file:///Users/mrebollo/devel/pxt-microspade/examples/counter.ts)
3.  **Diamante Parpadeante (periodic)**:
    *   Uso de un comportamiento periódico (*Periodic*) para alternar un icono de diamante en pantalla cada segundo.
    *   [Abrir proyecto en MakeCode Blocks](https://makecode.microbit.org/S76143-51587-91236-62138)
    *   Código fuente: [examples/periodic.ts](file:///Users/mrebollo/devel/pxt-microspade/examples/periodic.ts)
4.  **Despedida Diferida (timeout)**:
    *   Uso de un comportamiento de temporización (*Timeout*) para mostrar un mensaje de despedida pasados 2 segundos desde el inicio.
    *   [Abrir proyecto en MakeCode Blocks](https://makecode.microbit.org/S70375-59229-77988-72570)
    *   Código fuente: [examples/timeout.ts](file:///Users/mrebollo/devel/pxt-microspade/examples/timeout.ts)
5.  **Múltiples Comportamientos Concurrentes (multiple behaviours)**:
    *   Ejemplo avanzado de un sistema de alarma que coordina un comportamiento cíclico (sonido/alerta visual), uno periódico (lectura de nivel de luz del sensor) y uno inicial de un solo disparo (saludo al arrancar).
    *   [Abrir proyecto en MakeCode Blocks](https://makecode.microbit.org/S61477-30178-40152-19010)
    *   Código fuente: [examples/multiple_behaviours.ts](file:///Users/mrebollo/devel/pxt-microspade/examples/multiple_behaviours.ts)
6.  **Mensajes Ping-Pong Básicos (ping pong)**:
    *   Inicialización y envío de un mensaje de tipo *Inform* de un agente emisor `"ping"` a uno receptor `"pong"`, inspeccionando sus campos.
    *   [Abrir proyecto en MakeCode Blocks](https://makecode.microbit.org/S53359-29013-76397-15353)
    *   Código fuente: [examples/ping_pong.ts](file:///Users/mrebollo/devel/pxt-microspade/examples/ping_pong.ts)
7.  **Emisor del Buzón (mailbox server)**:
    *   Un agente emisor `"ter"` que mide la temperatura periódicamente y la transmite por radio empaquetada como un mensaje FIPA-ACL dirigido a `"cli"`.
    *   [Abrir proyecto en MakeCode Blocks](https://makecode.microbit.org/S98072-57342-02581-51604)
    *   Código fuente: [examples/mailbox_server.ts](file:///Users/mrebollo/devel/pxt-microspade/examples/mailbox_server.ts)
8.  **Receptor del Buzón (mailbox client)**:
    *   Un agente receptor `"cli"` que consume de forma cíclica los mensajes de su buzón FIFO y los muestra tanto por pantalla led como por la consola serie.
    *   [Abrir proyecto en MakeCode Blocks](https://makecode.microbit.org/S98372-55681-97269-00640)
    *   Código fuente: [examples/mailbox_client.ts](file:///Users/mrebollo/devel/pxt-microspade/examples/mailbox_client.ts)

---

## Licencia

MIT
