# micro:spade — Intelligent Agents Reference Manual

![](/icon.png/)

This document serves as a detailed reference manual for the **micro:spade** extension. It explains in depth the theory of agents, the behaviour-based concurrency model, and the FIPA-ACL messaging protocol.

---

## What is an Agent

An agent is an entity with a certain degree of autonomy that acts on an environment to achieve its own goals. It can be software, a robot, or any system capable of perceiving, thinking, and acting. Typically, it is defined as a reactive entity (reacts to changes in the environment), proactive (establishes its own goals), and social (capable of communicating with other agents, devices, or users).

---

## Why Use Agents on the micro:bit

In the context of the micro:bit, the agent abstraction makes it easier to program certain behaviours, especially when we want to program interactions between multiple devices located in the same physical environment, collaborating or competing with each other. We can view the micro:bit board as a physical agent.

micro:spade provides a series of basic behaviours that run in the background while still responding to events from various sensors. This allows us to program tasks to run cyclically, at fixed time intervals (periodic), or just once (one-shot, or timed-out if it has a delay). This enriches the way you work with the micro:bit, without giving up traditional reactive programming.

Furthermore, the messaging model facilitates the design of applications requiring agent-to-agent communication. It is built on top of the micro:bit's radio module but does not disable it. Traditional radio messages can be still used as usual, while micro:spade also provides a higher-level mechanism and a mailbox queue for agent communication. The concept of *performative* comes from the [speech act theory](https://www.communicationtheory.org/speech-act-theory/). For example, a "temperature=22" message can mean different things depending on whether we are:
- stating what the temperature is (inform)
- asking what the temperature is (query)
- requesting that the room be set to that temperature (request)
The performative defines the meaning of the message, hence the importance of choosing the correct one.

micro:spade is designed to run distributed programs on a group of micro:bits in the same physical environment, creating a new programming paradigm suited to these devices. It can be used to develop distributed robotics experiments and other artificial intelligence techniques related to multi-agent systems.

---

## Main Features

*   **Encapsulated Lifecycle**: Configure the agent's identity using the floating block `on agent start`.
*   **Concurrent Behaviours**: Cooperative execution in the background without blocking loops:
    *   *Cyclic*: Continuous loop execution.
    *   *Periodic*: Execution at fixed time intervals.
    *   *One Shot*: Immediate one-time execution in the background.
    *   *Timeout*: One-time execution after a delay.
*   **FIPA-ACL like Messaging**: Structured messages containing sender, destination, performative (message type), and body.
*   **FIFO Mailbox**: Secure queue storage on the receiving board with a maximum size to avoid RAM saturation.
*   **Filtering Templates**: Filter mailbox messages by destination, sender, or message type.

---

## How to Import the Extension

To use this library in MakeCode:

1.  Open [https://makecode.microbit.org/](https://makecode.microbit.org/).
2.  Create a new project or open an existing one.
3.  Click the gear menu (top right) and select **Extensions**.
4.  Paste your GitHub repository URL: `https://github.com/mrebollo/pxt-microspade` and import it.

---

## My First Agent: Hello World

As usual, let's start with the classic "Hello World". We will create a behaviour for the agent to execute once on startup to display a greeting on the screen.

```code

microspade.onAgentStart("saludador", function () {
    myname = "pepe"
})

microspade.addOneShotBehaviour("helloTask", function () {
    basic.showString("Hello " + myname)
})
```
In this example, we drag the "on agent start" block and name our agent "saludador". This name is used to identify it in an environment with multiple agents and send messages to it. If no name is provided, it defaults to "agent". Create a variable "name" and write the text you want the greeting to show.

To add a behaviour that runs once, drag the "one shot behaviour" block. Inside, add a "show string" block and fill it with the greeting text (e.g. "Hello " joined with the "name" variable).

When you start the board, you will see the greeting display on the LEDs.

---

## Sending and Receiving Simple Messages

In this example, you can see how communication between agents is performed. We will create two agents: a sender and a receiver. The sender will send its temperature sensor reading to the receiver every 5 seconds, and the receiver will display it.

### 1. The Sender (Thermometer)

This agent periodically measures the temperature and sends an `inform` message to the receiver.

Create an "on agent start" block and name it, for example, "temp". Then drag the "periodic behaviour" block and specify the execution period in milliseconds, for example, 5000 (every 5 seconds). Inside, we will add blocks to send the temperature. Drag the "set message..." block inside and fill in:
- in "to" put the receiver agent name, e.g. "cli".
- in "body" drag the temperature sensor reading block from "Input".
- click (+) to show "performative", which defaults to "inform".

Finally, place the "send message" block and drag the "message" variable into it.

```code
microspade.onAgentStart("temp", function () {

})

microspade.addPeriodicBehaviour("sendTemperature", 5000, function () {
    let temp = input.temperature()
    basic.showNumber(temp)
    let message = microspade.createMessage("cli", "" + temp, microspade.MessagePerformative.Inform)
    microspade.sendMessage(message)
})
```

### 2. The Receiver (Client)

This agent listens continuously in the background and displays any temperature message it receives from "temp". Create a new project for this agent (only one agent per board).

Drag the "on agent start" block and name it "cli". Drag the "on message received" event block.

Inside the event, add a "show string" block and display the temperature by extracting the "body" field of the received message:

```code
microspade.onAgentStart("cli", function () {
    // Local variables initialization if needed
})

microspade.onMessageReceived(function (message) {
    let bodyText = microspade.getMessageField(message, microspade.MessageField.Body)
    basic.showString(bodyText)
})
```

---

## Ready-to-Use Example Projects

You can import complete example projects in MakeCode that already have the extension loaded and the blocks laid out for simulation or download:

1.  **Hello World (ms hello world)**: 
    *   A simple agent ("saludador") that uses a *One Shot* behaviour to show a greeting on the display.
    *   [Open project in MakeCode Blocks](https://makecode.microbit.org/S51167-61185-00431-40389)
    *   Source code: [examples/hello_world.ts](./examples/hello_world.ts)
2.  **Cyclic Counter (ms counter)**:
    *   Uses a *Cyclic* behaviour to decrement and show a countdown until it reaches zero, stopping the agent cleanly.
    *   [Open project in MakeCode Blocks](https://makecode.microbit.org/S99434-71277-80785-71507)
    *   Source code: [examples/counter.ts](./examples/counter.ts)
3.  **Blinking Diamond (periodic)**:
    *   Uses a *Periodic* behaviour to alternate a diamond icon on the screen every second.
    *   [Open project in MakeCode Blocks](https://makecode.microbit.org/S76143-51587-91236-62138)
    *   Source code: [examples/periodic.ts](./examples/periodic.ts)
4.  **Delayed Farewell (timeout)**:
    *   Uses a *Timeout* behaviour to display a farewell message after a 2-second delay from startup.
    *   [Open project in MakeCode Blocks](https://makecode.microbit.org/S70375-59229-77988-72570)
    *   Source code: [examples/timeout.ts](./examples/timeout.ts)
5.  **Multiple Concurrent Behaviours (multiple behaviours)**:
    *   An advanced security alarm example that coordinates a cyclic behaviour (sound/visual alert), a periodic behaviour (light level reading), and a startup one-shot greeting.
    *   [Open project in MakeCode Blocks](https://makecode.microbit.org/S61477-30178-40152-19010)
    *   Source code: [examples/multiple_behaviours.ts](./examples/multiple_behaviours.ts)
6.  **Basic Ping-Pong Messages (ping pong)**:
    *   Initializes and sends an *Inform* message from a "ping" agent to a "pong" agent, inspecting fields.
    *   [Open project in MakeCode Blocks](https://makecode.microbit.org/S53359-29013-76397-15353)
    *   Source code: [examples/ping_pong.ts](./examples/ping_pong.ts)
7.  **Mailbox Sender (mailbox server)**:
    *   An agent named "ter" that periodically measures the temperature and transmits it via radio as a FIPA-ACL message addressed to "cli".
    *   [Open project in MakeCode Blocks](https://makecode.microbit.org/S98072-57342-02581-51604)
    *   Source code: [examples/mailbox_server.ts](./examples/mailbox_server.ts)
8.  **Mailbox Receiver (mailbox client)**:
    *   An agent named "cli" that cyclically consumes messages from its FIFO mailbox and displays them on the screen and serial console.
    *   [Open project in MakeCode Blocks](https://makecode.microbit.org/S98372-55681-97269-00640)
    *   Source code: [examples/mailbox_client.ts](./examples/mailbox_client.ts)

---

## License

MIT
