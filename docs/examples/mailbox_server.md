# Mailbox Server

This agent measures the temperature and sends it periodically to another agent.

## Create the agent

First of all, drag the "on agent start" block and give the server agent a name. In this example, the sender is called `ter` (termometer).

```blocks
microspade.onAgentStart("ter", function () {
    
})
```

## Create the behaviour

Drag and drop the "periodic" block. Inside it, read the temperature, show it on the display, create a message for the `cli` agent, and send it. You can do it in two steps: store the new message in a variable and then send that variable.

```blocks
microspade.addPeriodicBehaviour("temperaturePublisher", 2000, function () {
    temp = input.temperature()
    basic.showNumber(temp)
    microspade.sendMessage(microspade.createMessageNumber("cli", temp))
})
```

---
Source in repository: [examples/mailbox_server.ts](../../examples/mailbox_server.ts)
```package
microspade=github:mrebollo/pxt-microspade
```

<script src="https://makecode.com/gh-pages-embed.js"></script>
<script>
  makeCodeRender("https://makecode.microbit.org/", "mrebollo/pxt-microspade");
</script>