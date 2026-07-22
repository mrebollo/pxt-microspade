# Timeout

This example uses a timeout behaviour to show a farewell message after a short delay.

The agent starts automatically, so you only need `on agent start` if you want to initialize shared state before the behaviour runs.

## Create the behaviour

Drag and drop the "timeout" block. Set the delay to 2000 ms and make it show a farewell message when the timer ends.

```blocks
microspade.addTimeoutBehaviour("farewellTask", 2000, function () {
    basic.showString("Bye")
})
```

---
Source in repository: [examples/timeout.ts](../../examples/timeout.ts)
```package
microspade=github:mrebollo/pxt-microspade
```

<script src="https://makecode.com/gh-pages-embed.js"></script>
<script>
  makeCodeRender("https://makecode.microbit.org/", "mrebollo/pxt-microspade");
</script>
