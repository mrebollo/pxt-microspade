# Hello World

This is the simplest micro:spade example: an agent initializes a variable and runs a one-shot behaviour.

## Create the agent

First of all, drag the "on agent start" block. Optionally, 
write a name for the agent. It can contain any variable initialization or code preparation.

```block
microspade.onAgentStart("agent", function () {
    text = "world"
```

## Create the behabiour

Drag and drop the "one shot" behaviour and add a block to compose and write the sentence.


```block
microspade.addOneShotBehaviour("helloTask", function () {
    basic.showString("Hello " + text)
})
```

## Complete example.

Here there is the complete code. You can try it and make changes to check its functionality.

```blocks
let text = ""
microspade.onAgentStart("agent", function () {
    text = "world"
})
microspade.addOneShotBehaviour("helloTask", function () {
    basic.showString("Hello " + text)
})
```

## Package

```package
microspade=github:mrebollo/pxt-microspade
```

Source in repository: [examples/hello_world.ts](../../examples/hello_world.ts)

<script src="https://makecode.com/gh-pages-embed.js"></script>
<script>
  makeCodeRender("https://makecode.microbit.org/", "mrebollo/pxt-microspade");
</script>