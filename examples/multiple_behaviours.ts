let alerta = false
let nivelLuz = 0
input.onButtonPressed(Button.A, function () {
    music.stopAllSounds()
    basic.clearScreen()
    alerta = false
})
microspade.addCyclicBehaviour(function () {
    if (alerta) {
        basic.showIcon(IconNames.Skull)
        music.play(music.builtinPlayableSoundEffect(soundExpression.slide), music.PlaybackMode.UntilDone)
    }
})
microspade.addOneShotBehaviour(function () {
    basic.showIcon(IconNames.Happy)
    music.play(music.tonePlayable(523, music.beat(BeatFraction.Quarter)), music.PlaybackMode.UntilDone)
    basic.pause(1000)
    basic.clearScreen()
})
microspade.addPeriodicBehaviour(1000, function () {
    nivelLuz = input.lightLevel()
    if (nivelLuz < 50) {
        alerta = true
    }
})
