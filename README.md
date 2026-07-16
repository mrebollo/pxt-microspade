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
    microspade.addPeriodicBehaviour(2000, function () {
        let temp = input.temperature()
        basic.showNumber(temp)
        let msg = microspade.createMessage("client", convertToText(temp), microspade.MessagePerformative.Inform)
        microspade.sendMessage(msg)
    })
})
microspade.startAgent()
```

### 2. El Receptor (Cliente)
Este agente escucha continuamente en segundo plano y muestra en los leds cualquier mensaje de temperatura que reciba de parte de `"termometer"`:

```blocks
microspade.createAgent("client", function () {
    microspade.addCyclicBehaviour(function () {
        let received = microspade.receive()
        if (received !== null) {
            let bodyText = microspade.getMessageField(received, microspade.MessageField.Body)
            basic.showString(bodyText)
        }
    })
})
microspade.startAgent()
```

---

## Proyectos de Ejemplo Listos para Usar

Para facilitar el aprendizaje, puedes importar proyectos de ejemplo completos en MakeCode que ya tienen la extensión cargada y los bloques colocados:

1.  **Hola Mundo (ms hello world)**: 
    *   Un agente simple ("saludador") que utiliza un comportamiento de tipo *One Shot* para mostrar un saludo en pantalla.
    *   [Abrir proyecto en MakeCode Blocks](https://makecode.microbit.org/S10623-05005-73085-52255)
    *   Código fuente: [examples/hello_world.ts](file:///Users/mrebollo/devel/pxt-microspade/examples/hello_world.ts)

---

## Licencia

MIT
