# Template

This example shows how to use a receive template (message filter) to consume only messages that match specific conditions.

## Create the agent

First of all, drag the "on agent start" block. This example initializes one variable to store the message selected by the template.

```blocks
let selected: microspade.Message = null
microspade.onAgentStart("listener", function () {
})
```

## Send test messages

Use button events to send two different messages to the same agent. Only one of them will match the receive template.

```blocks
input.onButtonPressed(Button.A, function () {
  microspade.sendMessage(microspade.createMessage("listener", "temp:22", microspade.MessagePerformative.Inform))
})
input.onButtonPressed(Button.B, function () {
  microspade.sendMessage(microspade.createMessage("listener", "turn_on", microspade.MessagePerformative.Request))
})
```

## Receive with template

Use `receive` with filters to consume only `inform` messages whose body contains `temp`. If a matching message is found, show its body.

```blocks
microspade.addCyclicBehaviour("templateReader", function () {
  selected = microspade.receive(microspade.PerformativeFilter.Inform, "temp")
  if (microspade.messageExists(selected)) {
    basic.showString(microspade.getMessageField(selected, microspade.MessageField.Body))
  }
})
```

## Complete example

Here is the complete code. You can try it and make changes to check its functionality.

```blocks
let selected: microspade.Message = null
microspade.onAgentStart("listener", function () {
})
input.onButtonPressed(Button.A, function () {
  microspade.sendMessage(microspade.createMessage("listener", "temp:22", microspade.MessagePerformative.Inform))
})
input.onButtonPressed(Button.B, function () {
  microspade.sendMessage(microspade.createMessage("listener", "turn_on", microspade.MessagePerformative.Request))
})
microspade.addCyclicBehaviour("templateReader", function () {
  selected = microspade.receive(microspade.PerformativeFilter.Inform, "temp")
  if (microspade.messageExists(selected)) {
    basic.showString(microspade.getMessageField(selected, microspade.MessageField.Body))
  }
})
```

---
Source in repository: [examples/template.ts](../../examples/template.ts)
```package
microspade=github:mrebollo/pxt-microspade
```

<script src="https://makecode.com/gh-pages-embed.js"></script>
<script>
  makeCodeRender("https://makecode.microbit.org/", "mrebollo/pxt-microspade");
</script>
