# Multiple Behaviours

This example combines one one-shot behaviour, one cyclic behaviour, and one periodic behaviour to build a simple alarm.

## Create the agent

First of all, drag the "on agent start" block. The example also includes a button handler that stops the alarm and clears the screen.

```blocks
let alerta = false
let nivelLuz = 0
input.onButtonPressed(Button.A, function () {
    music.stopAllSounds()
    basic.clearScreen()
    alerta = false
})
```

## One-shot behaviour

Use this block to run a startup greeting once when the agent begins.

```blocks
microspade.addOneShotBehaviour("startupGreeting", function () {
    basic.showIcon(IconNames.Happy)
    music.play(music.tonePlayable(523, music.beat(BeatFraction.Quarter)), music.PlaybackMode.UntilDone)
    basic.pause(1000)
    basic.clearScreen()
})
```

## Periodic behaviour

Use this block to monitor the light level every second and activate the alert when it goes below the threshold.

```blocks
microspade.addPeriodicBehaviour("lightMonitor", 1000, function () {
    nivelLuz = input.lightLevel()
    if (nivelLuz < 50) {
        alerta = true
    }
})
```

## Cyclic behaviour

Use this block to keep the alarm active while the alert flag is set.

```blocks
microspade.addCyclicBehaviour("alarmLoop", function () {
    if (alerta) {
        basic.showIcon(IconNames.Skull)
        music.play(music.builtinPlayableSoundEffect(soundExpression.slide), music.PlaybackMode.UntilDone)
    }
})
```

## Complete example

Here is the complete code. You can try it and make changes to check its functionality.

```blocks
let alerta = false
let nivelLuz = 0
input.onButtonPressed(Button.A, function () {
    music.stopAllSounds()
    basic.clearScreen()
    alerta = false
})
microspade.addCyclicBehaviour("alarmLoop", function () {
    if (alerta) {
        basic.showIcon(IconNames.Skull)
        music.play(music.builtinPlayableSoundEffect(soundExpression.slide), music.PlaybackMode.UntilDone)
    }
})
microspade.addOneShotBehaviour("startupGreeting", function () {
    basic.showIcon(IconNames.Happy)
    music.play(music.tonePlayable(523, music.beat(BeatFraction.Quarter)), music.PlaybackMode.UntilDone)
    basic.pause(1000)
    basic.clearScreen()
})
microspade.addPeriodicBehaviour("lightMonitor", 1000, function () {
    nivelLuz = input.lightLevel()
    if (nivelLuz < 50) {
        alerta = true
    }
})
```

---
Source in repository: [examples/multiple_behaviours.ts](../../examples/multiple_behaviours.ts)
```package
microspade=github:mrebollo/pxt-microspade
```

<script src="https://makecode.com/gh-pages-embed.js"></script>
<script>
  makeCodeRender("https://makecode.microbit.org/", "mrebollo/pxt-microspade");
</script>
