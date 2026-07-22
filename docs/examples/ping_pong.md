# Ping Pong

This example creates a message in one agent and then inspects its fields in a one-shot behaviour.

## Create the agent

First of all, drag the "on agent start" block and create the message that will be inspected later.

```blocks
let msg: microspade.Message = null
microspade.onAgentStart("ping", function () {
    msg = microspade.createMessage("pong", "hello", microspade.MessagePerformative.Inform)
})
```

## Create the behaviour

Drag and drop the "one shot" block and use it to show the message fields on the screen.

```blocks
microspade.addOneShotBehaviour("inspectMessage", function () {
    basic.showString(microspade.getMessageField(msg, microspade.MessageField.To))
    basic.showString(microspade.getMessageField(msg, microspade.MessageField.Performative))
    basic.showString(microspade.getMessageField(msg, microspade.MessageField.Body))
})
```

---
Source in repository: [examples/ping_pong.ts](../../examples/ping_pong.ts)
```package
microspade=github:mrebollo/pxt-microspade
```

<script src="https://makecode.com/gh-pages-embed.js"></script>
<script>
  makeCodeRender("https://makecode.microbit.org/", "mrebollo/pxt-microspade");
</script>
