import { houseCoordinates } from "./houseCoordinates.js";
import { houseExitCoordinates } from "./houseExitCoordinates.js";

const chestsDialogue = {
  house1: "Vous récuperez des câbles pour amorcer la bombe",
  house4: "Vous récuperez un accélérateur de particules",
  house5: "Vous récuperez un tableau blanc et une craie",
  house6: "Vous récuperez un microscope atomique",
  house7: "Vous récuperez des barres d'Uranium 235",
  house12: "Vous récuperez un détonateur",
  house13: "Vous récuperez des sondes pour la télémétrie",
  house15: "Vous récuperez des fusibles d'armement de la bombe",
};

class HouseScene extends Phaser.Scene {
  constructor() {
    super({ key: "HouseScene" });
  }

  preload() {
    this.houseName = sessionStorage.getItem("house");
    this.load.audio("house_theme", "assets/musics/house_theme.mp3");
    this.load.tilemapTiledJSON(
      `${this.houseName}Map`,
      `assets/maps/${this.houseName}.json`
    );
    this.load.image("pipoya-rpg", "assets/maps/tilesets/pipoya-rpg.png");
    this.load.spritesheet("player", "assets/sprites/player.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  create() {
    if (!this.houseTheme) {
      const houseTheme = this.sound.add("house_theme", {
        loop: true,
        volume: 0.3,
      });
      houseTheme.play();
      this.houseTheme = houseTheme;
    } else {
      this.houseTheme.resume();
    }

    const map = this.make.tilemap({ key: `${this.houseName}Map` });
    this.map = map;
    const tileset = map.addTilesetImage("pipoya-rpg", "pipoya-rpg");
    map.createLayer("ground", tileset);
    map.createLayer("objects", tileset);
    map.createLayer("objectsTop", tileset);

    const hitboxWidth = 30;
    const hitboxHeight = 20;

    // Create the player as a sprite
    this.player = this.physics.add.sprite(
      1200,
      map.heightInPixels - hitboxHeight / 2,
      "player"
    );
    this.player.body.setSize(hitboxWidth, hitboxHeight);

    // Relocate player at house entrance
    this.player.setPosition(map.widthInPixels / 2, map.heightInPixels - 50);

    const wallObjects = map.createFromObjects("collisions");
    wallObjects.forEach((wall) => {
      wall.setOrigin(0.5);
      this.physics.world.enable(wall);
      wall.body.setImmovable(true);
      wall.alpha = 0;
      this.physics.add.collider(this.player, wall);
    });

    // Configure chest
    const chestObject = map.createFromObjects("chest");
    if (chestObject && chestObject[0]) {
      this.chestObject = chestObject[0];
      this.chestObject.alpha = 0;
    }

    // Configure camera
    const centerX = map.widthInPixels / 2;
    const centerY = map.heightInPixels / 2;
    const zoomFactor = 3; // Adjust this value as needed
    this.cameras.main.centerOn(centerX, centerY);
    this.cameras.main.setZoom(zoomFactor);

    this.cameras.main.startFollow(this.player);

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    if (this.player.active) {
      const { cursors, player } = this;

      const isLeftPressed = cursors.left.isDown;
      const isRightPressed = cursors.right.isDown;
      const isUpPressed = cursors.up.isDown;
      const isDownPressed = cursors.down.isDown;

      const tileWidth = this.map.tileWidth;
      const tileHeight = this.map.tileHeight;

      // Calculate the player's tile coordinates
      const playerTileX = Math.floor(player.x / tileWidth);
      const playerTileY = Math.floor(player.y / tileHeight);

      const movePlayerX = (velocityX, animation) => {
        player.setVelocityX(velocityX);
        player.anims.play(animation, true);
      };

      // Chest interaction
      if (
        !sessionStorage.getItem(`${this.houseName}_item_found`) &&
        Phaser.Input.Keyboard.JustDown(
          this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
        )
      ) {
        const interactionDistance = 50;
        const distance = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          this.chestObject.x,
          this.chestObject.y
        );

        if (distance < interactionDistance) {
          sessionStorage.setItem(`${this.houseName}_item_found`, true);
          this.showDialogue(chestsDialogue);
        }
      }

      const movePlayerY = (velocityY, animation) => {
        if (animation === "down") {
          if (
            (playerTileX === houseExitCoordinates[this.houseName].x ||
              playerTileX === houseExitCoordinates[this.houseName].x - 1 ||
              playerTileX === houseExitCoordinates[this.houseName].x + 1) &&
            playerTileY + 2 === houseExitCoordinates[this.houseName].y
          ) {
            // Storing house entrance
            sessionStorage.removeItem("playerX");
            sessionStorage.removeItem("playerY");
            sessionStorage.setItem(
              "playerX",
              houseCoordinates[this.houseName].x
            );
            sessionStorage.setItem(
              "playerY",
              houseCoordinates[this.houseName].y
            );
            sessionStorage.removeItem("house"); // Clear any house-related data¨
            this.houseTheme.pause();
            this.scene.stop("HouseScene");
            this.scene.start("MainScene");
          }
        }

        player.setVelocityY(velocityY);
        player.anims.play(animation, true);
      };

      if (isLeftPressed && !isRightPressed && !isUpPressed && !isDownPressed) {
        movePlayerX(-160, "left");
      } else if (
        isRightPressed &&
        !isLeftPressed &&
        !isUpPressed &&
        !isDownPressed
      ) {
        movePlayerX(160, "right");
      } else {
        player.setVelocityX(0);
      }

      if (isUpPressed && !isRightPressed && !isLeftPressed && !isDownPressed) {
        movePlayerY(-160, "up");
      } else if (
        isDownPressed &&
        !isRightPressed &&
        !isUpPressed &&
        !isLeftPressed
      ) {
        movePlayerY(160, "down");
      } else {
        player.setVelocityY(0);
      }

      if (
        !isLeftPressed &&
        !isRightPressed &&
        !isUpPressed &&
        !isDownPressed &&
        player.anims.currentAnim
      ) {
        player.anims.currentAnim.pause();
      } else if (player.anims.currentAnim) {
        player.anims.currentAnim.resume();
      }
    }
  }

  showDialogue(dialogueArray) {
    let currentDialogueIndex = this.houseName;
    let dialogBox = document.createElement("div");
    dialogBox.className = "dialog-box";
    dialogBox.textContent = dialogueArray[currentDialogueIndex];
    document.body.appendChild(dialogBox);

    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        currentDialogueIndex++;
        if (currentDialogueIndex < dialogueArray.length) {
          dialogBox.textContent = dialogueArray[currentDialogueIndex];
        } else {
          document.removeEventListener("keydown", handleKeyDown); // Remove the event listener
          if (dialogBox.parentNode === document.body) {
            document.body.removeChild(dialogBox);
          }
          this.isTalking = false;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
  }
}

export default HouseScene;
