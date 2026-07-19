# micro:spade — Lightweight Intelligent Agents for BBC micro:bit

#![](/image.png/)

![micro:bit V2 Only](https://img.shields.io/badge/micro%3Abit-V2%20only-blue)

This extension adds support for programming lightweight **Multi-Agent Systems (MAS)** on the BBC micro:bit in MakeCode. 

> [!IMPORTANT]
> **V2 Compatibility Required**: This extension requires the **micro:bit V2** hardware version and will not work on V1 boards. This is due to system memory requirements and the native support for long messages (up to 250 characters) transmitted over the radio.

---

## My First Agent: Hello World!

A basic intelligent agent in micro:bit is defined by declaring its identity on startup and its concurrent background behaviours.

```blocks
microspade.onAgentStart("greater", function () {
    myname = "pepe"
})

microspade.addOneShotBehaviour(function () {
    basic.showString("Hello " + myname)
})
```

---

## Ready-to-Use Example Projects

You can import complete example projects in MakeCode that already have the extension loaded and the blocks laid out for simulation or download:

1.  **Hello World (ms hello world)**: 
    *   A simple agent ("greeter") that uses a *One Shot* behaviour to show a greeting on the display.
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

## Documentation & Resources

For learning and reference, the following organized resources are available:

*   **[Start Interactive Tutorial in MakeCode](https://makecode.microbit.org/#tutorial:github:mrebollo/pxt-microspade/TUTORIAL)**: A step-by-step interactive guide built directly into the editor to help you build your first agent.
*   **[Read the Full Reference Manual](./MANUAL.md)**: A detailed theoretical guide explaining the agent philosophy, behaviour-based concurrency, and the FIPA-ACL messaging protocol.

---

## License

MIT

<!-- target for local offline docs render -->
<script src="https://makecode.com/gh-pages-embed.js"></script>
<script>
  makeCodeRender("https://makecode.microbit.org/", "mrebollo/pxt-microspade");
</script>
