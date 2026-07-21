# micro:spade Reference

This extension adds support for programming lightweight Multi-Agent Systems (MAS) on the BBC micro:bit using Static TypeScript.

### ~ reminder

#### Works with micro:bit V2

![works with micro:bit V2 only image](/static/v2/v2-only.png)

Using these blocks requires the [micro:bit V2](/device/v2) hardware. If you use any blocks that attempt to run on a micro:bit v1 board, you will see compatibility errors.

### ~

## Example

```code

microspade.onAgentStart("greeter", function () {
    myname = "pepe"
})

microspade.addOneShotBehaviour("helloTask", function () {
    basic.showString("Hello " + myname)
})
```

## Blocks in this extension

```cards
microspade.onAgentStart("agent", () => {})
microspade.onAgentStop(() => {})
microspade.addOneShotBehaviour("task", () => {})
microspade.addCyclicBehaviour("task", () => {})
microspade.addPeriodicBehaviour("task", 1000, () => {})
microspade.addTimeoutBehaviour("task", 2000, () => {})
microspade.createMessage("agent", "body")
microspade.onMessageReceived((message) => {})
microspade.makeReply(null, "body")
microspade.getMessageField(null, microspade.MessageField.Body)
microspade.sendMessage(null)
microspade.receive()
```
