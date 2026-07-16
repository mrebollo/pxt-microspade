# microspade — Agentes Inteligentes Ligeros para BBC micro:bit

Esta extensión añade soporte para la programación de **Sistemas Multi-Agente (MAS)** ligeros en BBC micro:bit utilizando **TypeScript Estático** en MakeCode. Está especialmente diseñada para entornos educativos, permitiendo programar agentes mediante bloques o código.

El modelo sigue la filosofía de agentes inteligentes ligeros basados en comportamientos concurrentes (inspirado en SPADE) y mensajería basada en el estándar FIPA-ACL que se transmite mediante la radio nativa del micro:bit.

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
*   **Optimización de Radio**: Codificación compacta y compresión de performativas en formato numérico (0-7) para no superar el límite físico de 19 caracteres de la radio de micro:bit.

---

## Cómo importar la extensión

Para usar esta librería en MakeCode:

1.  Abre [https://makecode.microbit.org/](https://makecode.microbit.org/).
2.  Crea un nuevo proyecto o abre uno existente.
3.  Haz clic en el menú del engranaje (arriba a la derecha) y selecciona **Extensiones**.
4.  Pega la URL de tu repositorio de GitHub: `https://github.com/mrebollo/pxt-microspade` e impórtala.

---

## Ejemplos de código (Bloques y TypeScript)

El simulador de MakeCode es capaz de simular la comunicación por radio entre múltiples micro:bits en la pantalla. Puedes probar a cargar este código en dos proyectos diferentes:

### 1. El Emisor (Termómetro)
Este agente mide periódicamente la temperatura y envía un mensaje de tipo `inform` al receptor:

```blocks
microspade.createAgent("termometer", function () {
    // Inicialización de variables locales del agente si son necesarias
})
microspade.addPeriodicBehaviour(2000, function () {
    let temp = input.temperature()
    basic.showNumber(temp)
    let msg = microspade.createMessage("client", "" + temp, microspade.MessagePerformative.Inform)
    microspade.sendMessage(msg)
})
microspade.startAgent()
```

### 2. El Receptor (Cliente)
Este agente escucha continuamente en segundo plano y muestra en los leds cualquier mensaje de temperatura que reciba de parte de `"termometer"`:

```blocks
microspade.createAgent("client", function () {
    // Inicialización de variables locales del agente si son necesarias
})
microspade.addCyclicBehaviour(function () {
    let received = microspade.receive()
    if (received) {
        let bodyText = microspade.getMessageField(received, microspade.MessageField.Body)
        basic.showString(bodyText)
    }
})
microspade.startAgent()
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
