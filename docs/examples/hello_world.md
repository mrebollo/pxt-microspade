# Hello World

This is the simplest micro:spade example: an agent initializes a variable and runs a one-shot behaviour.

## Create the agent

First of all, drag the "on agent start" block. Optionally, 
write a name for the agent. It can contain any variable initialization or code preparation.

```blocks
microspade.onAgentStart("agent", function () {
    text = "world"
```

## Create the behaviour

Drag and drop the "one shot" behaviour and add a block to compose and write the sentence.


```blocks
microspade.addOneShotBehaviour("helloTask", function () {
    basic.showString("Hello " + text)
})
```

---
Source in repository: [examples/hello_world.ts](../../examples/hello_world.ts)
```package
microspade=github:mrebollo/pxt-microspade
```



<script src="https://makecode.com/gh-pages-embed.js"></script>
<script>
  makeCodeRender("https://makecode.microbit.org/", "mrebollo/pxt-microspade");
</script>