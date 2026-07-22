# Mailbox Client

This agent reads messages from its mailbox and shows the message body on the display.

## Create the agent

First of all, drag the "on agent start" block and give the client agent a name. In this example, the receiver is called `cli`.

```blocks
microspade.onAgentStart("cli", function () {
    
})
```

## Create the behaviour

Drag and drop the "cyclic" block. Inside it, obtain a new message from the mailbox (using receive), check if it exists, and display its body if so.

```blocks
microspade.addCyclicBehaviour("mailboxReader", function () {
    received = microspade.receive()
    if (microspade.messageExists(received)) {
        basic.showString(microspade.getMessageField(received, microspade.MessageField.Body))
    }
})
```

---
Source in repository: [examples/mailbox_client.ts](../../examples/mailbox_client.ts)
```package
microspade=github:mrebollo/pxt-microspade
```

<script src="https://makecode.com/gh-pages-embed.js"></script>
<script>
  makeCodeRender("https://makecode.microbit.org/", "mrebollo/pxt-microspade");
</script>