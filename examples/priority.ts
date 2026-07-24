let obstaculo = false

microspade.onAgentStart("robot", function () {
    obstaculo = false
})

microspade.addCyclicBehaviour("patrol", function () {
    basic.showIcon(IconNames.SmallDiamond)
    basic.pause(150)
    basic.showIcon(IconNames.Diamond)
    basic.pause(150)
})

microspade.addPeriodicBehaviour("obstacleAvoidance", 50, function () {
    if (input.lightLevel() < 30) {
        microspade.setPriority(30)
        obstaculo = true
        basic.showIcon(IconNames.No)
        music.play(music.builtinPlayableSoundEffect(soundExpression.giggle), music.PlaybackMode.UntilDone)
    } else {
        microspade.releasePriority()
        obstaculo = false
    }
})
