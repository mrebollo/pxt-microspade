# Counter

This example uses a cyclic behaviour to update a countdown until it reaches zero and stops the agent.

## Create the agent

First of all, drag the "on agent start" block and give a name to the agent. In this example, the startup code initializes the countdown and shows its initial value.

```blocks
microspade.onAgentStart("launcher", function () {
    countdown = 9
    basic.showNumber(countdown)
})
```

## Create the behaviour

Drag and drop the "cyclic" block. Inside it, decrease the counter, show the current value, and stop the agent when the counter reaches zero.

```blocks
microspade.addCyclicBehaviour("countdownTask", function () {
    countdown += -1
    basic.showNumber(countdown)
    if (countdown == 0) {
        basic.showArrow(ArrowNames.North)
        microspade.stopAgent()
    }
})
```

---
Source in repository: [examples/counter.ts](../../examples/counter.ts)
```package
microspade=github:mrebollo/pxt-microspade
```

<script src="https://makecode.com/gh-pages-embed.js"></script>
<script>
  makeCodeRender("https://makecode.microbit.org/", "mrebollo/pxt-microspade");
</script>
