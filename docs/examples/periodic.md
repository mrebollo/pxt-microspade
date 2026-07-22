# Periodic

This example uses a periodic behaviour to alternate a diamond icon on the screen every second.

The agent starts automatically, so you only need `on agent start` if you want to initialize shared state before the behaviour runs.

## Create the behaviour

Drag and drop the "periodic" block. Set the interval to 1000 ms and make it alternate the icon.

```blocks
let on = false
microspade.addPeriodicBehaviour("blinkTask", 1000, function () {
    if (on) {
        basic.showIcon(IconNames.Diamond)
    } else {
        basic.showIcon(IconNames.SmallDiamond)
    }
    on = !(on)
})
```

---
Source in repository: [examples/periodic.ts](../../examples/periodic.ts)
```package
microspade=github:mrebollo/pxt-microspade
```

<script src="https://makecode.com/gh-pages-embed.js"></script>
<script>
  makeCodeRender("https://makecode.microbit.org/", "mrebollo/pxt-microspade");
</script>
