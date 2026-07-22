# Incoming

This example reacts as soon as a message arrives and shows its body on the display.

## Create the agent

First of all, drag the "on agent start" block. In this example, the board keeps waiting for incoming messages while a button press sends a test message to itself.

```blocks
let received: microspade.Message = null
microspade.onAgentStart("listener", function () {
})
```

## Self-sending a message (testing)

Add a button A input event and use it to compose and send a test message.

This self-send pattern is only for local testing on one board. In a real setup, another agent would send the message.

```blocks
input.onButtonPressed(Button.A, function () {
    microspade.sendMessage(microspade.createMessage("listener", "hello", microspade.MessagePerformative.Inform))
})
```


## React to incoming messages

Drag the "on message received" block. Capture the incoming message and show the content of its body.

```blocks
microspade.onMessageReceived(function (message) {
    received = message
    basic.showString(microspade.getMessageField(received, microspade.MessageField.Body))
})
```

## Complete example

Here is the complete code. You can try it and make changes to check its functionality.

```blocks
let received: microspade.Message = null
microspade.onAgentStart("listener", function () {
})
input.onButtonPressed(Button.A, function () {
  microspade.sendMessage(microspade.createMessage("listener", "hello", microspade.MessagePerformative.Inform))
})
microspade.onMessageReceived(function (message) {
  received = message
  basic.showString(microspade.getMessageField(received, microspade.MessageField.Body))
})
```

---
Source in repository: [examples/incoming.ts](../../examples/incoming.ts)
```package
microspade=github:mrebollo/pxt-microspade
```

<script src="https://makecode.com/gh-pages-embed.js"></script>
<script>
  makeCodeRender("https://makecode.microbit.org/", "mrebollo/pxt-microspade");
</script>
