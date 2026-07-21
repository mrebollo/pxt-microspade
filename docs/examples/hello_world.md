# Hello World

This is the simplest micro:spade example: an agent initializes a variable and runs a one-shot behaviour.

## Blocks

```blocks
let text = ""
microspade.onAgentStart("agent", function () {
    text = "pepe"
})
microspade.addOneShotBehaviour("helloTask", function () {
    basic.showString("Hello " + text)
})
```

## JavaScript

```typescript
let text = ""
microspade.onAgentStart("agent", function () {
    text = "pepe"
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
