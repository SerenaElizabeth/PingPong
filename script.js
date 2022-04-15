const canvas = document.querySelector('canvas')
canvas.width = 800;
canvas.height = 400;
let loopMs = 15
console.log(loopMs)

const ctx = canvas.getContext('2d') //gives us access to the 2d drawing features

let modeButtons = document.getElementsByClassName('mode-button')
for (let i = 0; i < modeButtons.length; i++) {
    modeButtons[i].addEventListener('click', (e) => changeMode(e))

}


function changeMode(e) {
    console.log(e.target.id)
    loopMs = Number(e.target.attributes['data-mode-ms'].value)
    document.querySelector(".selected").classList.remove("selected")
    document.getElementById(e.target.id).classList.add("selected")
    console.log(loopMs)
}

//set game variables

const paddleWidth = 8
const paddleHeight = 80
let playerScore = 0;
let computerScore = 0;
let ballX = canvas.width / 2
let ballY = canvas.height / 2
let playerPosition = canvas.height / 2
let computerPosition = canvas.height / 2
const winnerScore = 3

let moveX;
let moveY;
let ballRadius = 10
let gameloop;
let gameRunning = false

//ball move in different directions at random
function randomizeDirection() {
    const randomX = Math.ceil(Math.random() * 3) + 1; //random num between 2-4
    const randomY = Math.round(Math.random() * 3); //random num between 0-2
    const plusOrMinusX = Math.random() < 0.5 ? "-" : "+"; //50% change of being positive or negative 
    const plusOrMinusY = Math.random() < 0.5 ? "-" : "+";
    const randomNumber = Math.random()
    moveX = Number(plusOrMinusX + randomX) + randomNumber; //create a number from the string '+' or '-' and the number
    moveY = Number(plusOrMinusY + randomY) + randomNumber;
}

//listen for arrows / space to be pressed
document.addEventListener("keydown", handleKeyPressed)
function handleKeyPressed(e) {
    switch (e.code) {
        case "Space":
            startGame()
            break;
        case "ArrowUp":
            if (playerPosition - paddleHeight / 2 <= 0) return; //checks if paddle is already at top of canvas and returns out if it is
            playerPosition -= 15; //move paddle up when up arrow pressed 
            break;
        case "ArrowDown":
            if (playerPosition + paddleHeight / 2 >= canvas.height) return; //checks if paddle is already at bottom of canvas and returns out if it is
            playerPosition += 15;
            break;
    }
}

function startGame() {
    if (gameRunning) return; //prevents game from restarting if already running
    gameRunning = true
    randomizeDirection()
    ballX = canvas.width / 2
    playerScore = 0 //reset scores
    computerScore = 0
    clearInterval(gameloop)
    gameloop = setInterval(loop, loopMs) //calls loop function every 15 ms (draws ball every 15s)
    for (let i = 0; i < modeButtons.length; i++) { //disable mode buttons when game running
        modeButtons[i].disabled = true
    }
}

ctx.fillStyle = "limegreen"
ctx.font = "30px Courier New"
ctx.textAlign = "center"
ctx.fillText("Press space to start game", canvas.width / 2, canvas.height / 2) //place text in middle

//create players paddle
function createPlayerPaddle() {
    ctx.fillStyle = "white"
    ctx.fillRect(0, playerPosition - paddleHeight / 2, paddleWidth, paddleHeight) //creates a rectangle, pass in where to put it (top left x and y coordinates) & width and height. 
}


//create computer's paddle
function createComputerPAddle() {
    ctx.fillStyle = 'white'
    ctx.fillRect(canvas.width - paddleWidth, computerPosition - paddleHeight / 2, paddleWidth, paddleHeight)
}

//create ball
function createBall() {
    ctx.beginPath()
    ctx.fillStyle = "white"
    ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI) //create circle
    ctx.fill() //fill circle
    ballX += moveX //move position of ball on x axis
    ballY += moveY // move position of ball on y axis
}

//adding text to canvas
function createScoreText() {
    ctx.fillStyle = "limegreen"
    ctx.font = "30px Courier New"
    ctx.fillText(playerScore, canvas.width / 4, 50)
    ctx.fillText(computerScore, canvas.width * 0.75, 50)
}


//create centre line & circle
function createBoardMarkings() {
    ctx.beginPath() //clears all existing paths above
    ctx.strokeStyle = "#fff";
    ctx.setLineDash([6])
    ctx.moveTo(canvas.width / 2, 0) //like lifting your pen off the canvas and moving it to a location, move to middle of canvas at top
    ctx.lineTo(canvas.width / 2, canvas.height) //where to draw
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, 20, 0, 2 * Math.PI)
    ctx.stroke()
}

//add random bounce so bounce isn't always at 90 degrees
function randomBounce() {
    const randomNum = Math.floor(Math.random() * 3) // 0 or 1
    const positiveOrNegative = randomNum === 0 ? "-" : "+"
    return Number(positiveOrNegative + Math.random() / 2) //returns number between 0 and 0.5
}

//check for collision every time ball moves
function collide() {

    //bounce from top/bottom
    if (ballY > canvas.height - ballRadius || ballY - ballRadius <= 0) { //check if ball is off canvas in the y axis or x axis
        moveY = -moveY //reverses the location of the ball
    }

    //check for score (ball has hit left or right wall of canvas)
    if (ballX <= ballRadius) { //check if ball has hit side walls
        score('comp')
    } else if (ballX >= canvas.width) {
        score('player')
    }

    //check player paddle collision
    if (ballX <= ballRadius + paddleWidth && Math.abs(ballY - playerPosition) <= paddleHeight / 2 + ballRadius) {
        moveX = -moveX + randomBounce()
    }

    //check computer paddle collision
    if (ballX + ballRadius >= canvas.width - paddleWidth && Math.abs(ballY - computerPosition) <= paddleHeight / 2 + ballRadius) {
        moveX = -moveX + randomBounce()
    }
}

function score(player) {
    if (player === 'comp') {
        computerScore++
    } else {
        playerScore++
    }

    if (computerScore === winnerScore) {
        endgame('comp')
        return
    } else if (playerScore === winnerScore) {
        endgame('player')
        return
    }

    ballX = canvas.width / 2;
    ballY = canvas.height / 2

}

function computerMovement() {
    if (computerPosition < ballY) {
        computerPosition++
    } else {
        computerPosition--
    }
}

function endgame(winner) {
    gameRunning = false
    for (let i = 0; i < modeButtons.length; i++) {
        modeButtons[i].disabled = false
    }
    clearInterval(gameloop)
    ctx.clearRect(0, 0, canvas.width, canvas.height) //clear canvas
    createScoreText()

    if (winner === 'comp') {
        ctx.fillStyle = 'white'
        ctx.fillText(`Computer Wins :(`, canvas.width / 2, canvas.height / 2)
    } else {
        ctx.fillStyle = 'limegreen'
        ctx.fillText(`You Win!!!`, canvas.width / 2, canvas.height / 2)
    }
    ctx.textAlign = 'center'

}



function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height) //clear canvas
    createBall()
    createPlayerPaddle()
    createComputerPAddle()
    createScoreText()
    createBoardMarkings()
    collide()
    computerMovement()
}
