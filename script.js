// Log a message to the console to ensure the script is linked correctly
// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let player; //Serves as the entity controlled by player
let playerX; //Global variable to handle player position

const dropCD = 50;        //Serves as the cooldown for water drop spawns
const playerSpeed = 15;   //Serves as the speed at which player moves

const difficultyPresets = {
  easy: {   //Rocks are smaller, spawn less, and reach the top of the screen slower
    rockCD: 75,
    rockBaseTime: 6,
    rockBaseSize: 30
  },
  medium: {   //Default
    rockCD: 50,
    rockBaseTime: 4,
    rockBaseSize: 60
  },
  hard: {   //Rocks are faster, bigger, and more frequent
    rockCD: 25,
    rockBaseTime: 2,
    rockBaseSize: 90
  }
};

const diffSelector = document.getElementById("diff-selector");
diffSelector.addEventListener("change", setDifficulty);

let rockCD = 50;
let rockBaseTime = 4;
let rockBaseSize = 60;

function setDifficulty() {
  const difficulty = diffSelector.value;

  const diffSettings = difficultyPresets[difficulty];
  rockCD = diffSettings.rockCD;
  rockBaseTime = diffSettings.rockBaseTime;
  rockBaseSize = diffSettings.rockBaseSize;
}

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);
let score = document.getElementById("score");
let depth = document.getElementById("depth");

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;

  //Set score & depth to 0
  score.textContent = "0";
  depth.textContent = "0";

  //Create player entity
  player = document.createElement("div");
  player.className = "player";

  //Set player starting position
  const gameWidth = document.getElementById("game-container").offsetWidth;
  playerX = gameWidth/2 - 30;
  player.style.left = playerX + "px";
  
  //Add player to game
  document.getElementById("game-container").appendChild(player);

  // Create player loop for handling collisions & movement
  requestAnimationFrame(gameLoop);
}
//Handle keypresses
const keys = {
  ArrowRight: false,
  ArrowLeft: false
};
document.addEventListener("keydown", (event) => {
  if (event.key in keys) {
    event.preventDefault();
    keys[event.key] = true;
  }
})
document.addEventListener("keyup", (event) => {
  if (event.key in keys) {
    event.preventDefault();
    keys[event.key] = false;
  }
})

let lastTime = 0;
let dropTimer = 0;
let rockTimer = 25;
function gameLoop(timestamp) {
  let gameTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  if (gameTime > 0.1) gameTime = 0.1;
  playerHandler();
  
  depth.textContent = String(parseInt(depth.textContent, 10) + 1);
  
  //Create drops & rocks when their timers hit 0, then reset their cooldowns
  if (dropTimer <= 0) {
    createDrop();
    dropTimer = dropCD;
  } else {
    dropTimer -= 1;
  }

  if (rockTimer <= 0) {
    createRock();
    rockTimer = rockCD;
  } else {
    rockTimer -= 1;
  }

  //When colliding with water droplet, get 10 points
  let dropList = document.querySelectorAll(".water-drop");
  dropList.forEach((drop) => {
    if (checkCollision(player, drop)) {
      score.textContent = String(parseInt(score.textContent, 10) + 10);
      drop.remove();
    }
  });
  //When colliding with a rock, clear game & prompt a restart by clicking start game again
  let rockList = document.querySelectorAll(".bad-drop");
  rockList.forEach((rock) => {
    if (checkCollision(player, rock)) {
      console.log("Game Over!");
      document.getElementById("game-container").replaceChildren();
      gameRunning = false;
      return;
    }
  });
  if (gameRunning) {
    requestAnimationFrame(gameLoop);
  }
}

function playerHandler() {
  //Handle left & right movement
  if (keys["ArrowLeft"]) {
    if (playerX < 0) {
      playerX = 0;
    } else {
      playerX -= playerSpeed;
    }
  } else if (keys["ArrowRight"]) {
    if (playerX > document.getElementById("game-container").offsetWidth - 60) {
      playerX = document.getElementById("game-container").offsetWidth - 60;
    } else {
      playerX += playerSpeed;
    }
  } else {
    return;
  }
  player.style.left = `${playerX}px`;
}

function checkCollision(p, nonP) {
    const rect1 = p.getBoundingClientRect();
    const rect2 = nonP.getBoundingClientRect();

    // Check if rect1 and rect2 overlap on both the X and Y axes
    return !(
        rect1.right < rect2.left ||  // rect1 is completely to the left of rect2
        rect1.left > rect2.right ||  // rect1 is completely to the right of rect2
        rect1.bottom < rect2.top ||  // rect1 is completely above rect2
        rect1.top > rect2.bottom     // rect1 is completely below rect2
    );
}

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = "water-drop";

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";
  
  // Make drops fall for 4 seconds
  drop.style.animationDuration = "4s";

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Remove drops that reach the top
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}

function createRock() {
  // Create a new div element that will be our rock
  const rock = document.createElement("div");
  rock.className = "bad-drop";

  // Make rocks different sizes for visual variety
  const initialSize = rockBaseSize;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  rock.style.width = rock.style.height = `${size}px`;

  // Position the rock randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  rock.style.left = xPosition + "px";
  
  // Make rocks fall for a random amount of seconds between (rockBaseTime - 1, rockBaseTime + 1)
  const timeMod = Math.random() * 2 - 1;
  const rockTime = rockBaseTime + timeMod;
  rock.style.animationDuration = rockTime + "s";

  // Add the new rock to the game screen
  document.getElementById("game-container").appendChild(rock);

  // Remove rocks that reach the top
  rock.addEventListener("animationend", () => {
    rock.remove(); // Clean up drops that weren't caught
  });
}
