# Priority Behaviours

This example demonstrates how to use behaviour priorities to implement a Subsumption Architecture. A high-priority obstacle avoidance behaviour automatically inhibits a low-priority patrol behaviour when a hazard is detected.

Higher numeric priority values indicate higher precedence (e.g., priority 30 overrides priority 10).

## Agent initialization

First, initialize the agent identity and global variables.

```blocks
microspade.onAgentStart("robot", function () {
    obstaculo = false
})
```

## Low-priority behaviour (Patrol)

This cyclic behaviour runs the normal patrol routine with a low priority (10). It displays alternating diamond icons to indicate movement.

```blocks
microspade.addCyclicBehaviour("patrol", 10, function () {
    basic.showIcon(IconNames.SmallDiamond)
    basic.pause(150)
    basic.showIcon(IconNames.Diamond)
    basic.pause(150)
})
```

## High-priority behaviour (Obstacle avoidance)

This periodic behaviour runs every 50 ms with a high priority (30). When the light level falls below the threshold (simulating an obstacle sensor), it executes an emergency alert and holds high-priority control. While active, it automatically inhibits the lower-priority patrol behaviour.

```blocks
microspade.addPeriodicBehaviour("obstacleAvoidance", 50, 30, function () {
    if (input.lightLevel() < 30) {
        obstaculo = true
        basic.showIcon(IconNames.No)
        music.play(music.builtinPlayableSoundEffect(soundExpression.giggle), music.PlaybackMode.UntilDone)
    } else {
        obstaculo = false
    }
})
```

## Complete example

Here is the complete code. You can test it in MakeCode to observe how the high-priority behaviour overrides the low-priority patrol when triggered.

```blocks
let obstaculo = false

microspade.onAgentStart("robot", function () {
    obstaculo = false
})

microspade.addCyclicBehaviour("patrol", 10, function () {
    basic.showIcon(IconNames.SmallDiamond)
    basic.pause(150)
    basic.showIcon(IconNames.Diamond)
    basic.pause(150)
})

microspade.addPeriodicBehaviour("obstacleAvoidance", 50, 30, function () {
    if (input.lightLevel() < 30) {
        obstaculo = true
        basic.showIcon(IconNames.No)
        music.play(music.builtinPlayableSoundEffect(soundExpression.giggle), music.PlaybackMode.UntilDone)
    } else {
        obstaculo = false
    }
})
```

---
Source in repository: [examples/priority.ts](../../examples/priority.ts)
```package
microspade=github:mrebollo/pxt-microspade
```

<script src="https://makecode.com/gh-pages-embed.js"></script>
<script>
  makeCodeRender("https://makecode.microbit.org/", "mrebollo/pxt-microspade");
</script>
