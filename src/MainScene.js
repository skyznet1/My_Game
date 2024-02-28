import Npc from "./Npc.js";
import { houseCoordinates } from "./houseCoordinates.js";
class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  preload() {
    this.load.tilemapTiledJSON("map", "assets/maps/los-alamos.json");
    this.load.image("pipoya-rpg", "assets/maps/tilesets/pipoya-rpg.png");
    this.load.image("buildings", "assets/maps/tilesets/buildings.png");
    this.load.audio("game_theme", "assets/musics/game_theme.mp3");
    this.load.spritesheet("player", "assets/sprites/player.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("colonel", "assets/sprites/colo.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("scientifique1", "assets/sprites/sci1.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("scientifique2", "assets/sprites/sci2.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("scientifique3", "assets/sprites/sci3.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("femme1", "assets/sprites/femme1.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("guard", "assets/sprites/guard.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  create() {
    if (!this.gameTheme) {
      const gameTheme = this.sound.add("game_theme", {
        loop: true,
        volume: 0.3,
      });
      gameTheme.play();
      this.gameTheme = gameTheme;
    } else {
      this.gameTheme.resume();
    }

    const map = this.make.tilemap({ key: "map" });
    this.map = map;
    const tileset = map.addTilesetImage("pipoya-rpg", "pipoya-rpg");
    const tileset2 = map.addTilesetImage("buildings", "buildings");
    map.createLayer("ground", tileset);
    map.createLayer("objects", tileset);
    map.createLayer("buildings", tileset2);
    const wallObjects = map.createFromObjects("collisions");
    const oppenheimerDialogues = [
      "Bienvenue à Los Alamos, jeune recrue. Nous sommes en train de réaliser quelque chose d'incroyable ici.",
      "Le projet Manhattan vise à développer la première bombe atomique. La puissance de l'atome entre nos mains.",
      "Nous avons rassemblé certaines des plus grandes intelligences scientifiques du monde pour ce projet.",
      "Mais n'oublions pas les implications éthiques et morales de ce que nous créons ici.",
      "Le célèbre physicien Robert Oppenheimer dirige cette opération. Il a une vision radicale pour l'avenir.",
      "Soyez prudent lorsque vous parlez de nos travaux ici. La sécurité et le secret sont primordiaux.",
      "N'ayez pas peur de poser des questions et d'apprendre. Vous faites maintenant partie de l'histoire.",
    ];

    const hitboxWidth = 30;
    const hitboxHeight = 10;

    // Resize the game to fit the screen
    this.scale.resize(window.innerWidth, window.innerHeight);

    // Create the player as a sprite
    this.player = this.physics.add.sprite(1200, 800, "player");
    this.player.body.setSize(hitboxWidth, hitboxHeight);

    if (
      sessionStorage.getItem("playerX") &&
      sessionStorage.getItem("playerY")
    ) {
      this.player.setPosition(
        map.tileToWorldX(parseInt(sessionStorage.getItem("playerX"))),
        map.tileToWorldY(parseInt(sessionStorage.getItem("playerY")))
      );
    }

    wallObjects.forEach((wall) => {
      wall.setOrigin(0.5);
      this.physics.world.enable(wall);
      wall.body.setImmovable(true);
      wall.alpha = 0;
      this.physics.add.collider(this.player, wall);
    });

    // Set camera bounds to match the dimensions of the tilemap
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setDeadzone(
      this.cameras.main.width / 6,
      this.cameras.main.height / 6
    );

    this.cursors = this.input.keyboard.createCursorKeys();

    this.characters = [
      "femme1",
      "colonel",
      "scientifique1",
      "scientifique2",
      "guard1",
      "guard2",
      "guard3",
      "guard4",
      "guard5",
    ];

    const animOffsets = {
      left: 117,
      right: 143,
      up: 105,
      down: 130,
      stay: 130,
    };

    const paths = [
      [
        { x: 720, y: 208 },
        { x: 720, y: 336 },
        { x: 504, y: 336 },
        { x: 720, y: 336 },
        { x: 720, y: 208 },
      ],
      [
        { x: 1360, y: 340 },
        { x: 1360, y: 988 },
        { x: 1360, y: 192 },
      ],
      [
        { x: 432, y: 1072 },
        { x: 720, y: 1072 },
        { x: 720, y: 600 },
        { x: 720, y: 1072 },
        { x: 432, y: 1072 },
      ],
      [
        { x: 930, y: 432 },
        { x: 720, y: 432 },
        { x: 720, y: 762 },
        { x: 930, y: 762 },
        { x: 720, y: 762 },
        { x: 720, y: 432 },
        { x: 930, y: 432 },
      ],
      [{ x: 288, y: 528 }],
      [{ x: 224, y: 112 }],
      [{ x: 352, y: 1072 }],
      [{ x: 1245, y: 96 }],
      [{ x: 2336, y: 320 }],
    ];

    this.charactersGroup = this.add.group();

    paths.forEach((path, index) => {
      const character = new Npc(
        this,
        path[0].x,
        path[0].y,
        this.characters[index],
        path
      );

      this.charactersGroup.add(character);
      this.physics.add.collider(this.player, character);

      wallObjects.forEach((wall) => {
        this.physics.add.collider(character, wall);
      });

      this["character" + (index + 1)] = character;
    });

    // Create animations dynamically for characters
    this.characters.forEach((character, index) => {
      const walkAnims = ["left", "right", "up", "down", "stay"];
      walkAnims.forEach((direction) => {
        let key = character.includes("guard") ? "guard" : character;

        if (
          !this.anims.exists(`${key}_walk_${direction}`, index) &&
          !character.includes("guard")
        ) {
          // Check if animation doesn't exist
          this.anims.create({
            key: `${key}_walk_${direction}`,
            frames: this.anims.generateFrameNumbers(key, {
              start: animOffsets[direction],
              end:
                index === 4
                  ? animOffsets[direction]
                  : animOffsets[direction] + 7,
            }),
            frameRate: 10,
            repeat: -1,
          });
        }
      });
    });

    const guardsAnimations = [
      {
        key: "character5",
        frame: 91,
      },
      {
        key: "character6",
        frame: 14,
      },
      {
        key: "character7",
        frame: 32,
      },
    ];

    guardsAnimations.forEach((animation) => {
      if (!this.anims.exists(animation.key)) {
        this.anims.create({
          key: animation.key,
          frames: [{ key: "guard", frame: animation.frame }],
          frameRate: 20,
        });
      }
    });

    this.character5.anims.play("character5", true);
    this.character6.anims.play("character7", true);
    this.character7.anims.play("character5", true);
    this.character8.anims.play("character7", true);
    this.character9.anims.play("character6", true);

    // Add animations for the player outside of the loop
    const playerWalkAnims = ["left", "right", "up", "down", "stay"];
    playerWalkAnims.forEach((direction) => {
      const animKey = direction;
      if (!this.anims.exists(animKey)) {
        // Check if animation doesn't exist
        this.anims.create({
          key: animKey,
          frames: this.anims.generateFrameNumbers("player", {
            start: animOffsets[direction],
            end: animOffsets[direction] + 7,
          }),
          frameRate: 10,
          repeat: -1,
        });
      }
    });

    const turnAnimKey = "turn";
    if (!this.anims.exists(turnAnimKey)) {
      // Check if animation doesn't exist
      this.anims.create({
        key: turnAnimKey,
        frames: [{ key: "player", frame: 1 }],
        frameRate: 20,
      });
    }
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

      const movePlayerY = (velocityY, animation) => {
        if (animation === "up") {
          // Check if the player's tile coordinates match any house coordinates
          for (const houseName in houseCoordinates) {
            const house = houseCoordinates[houseName];
            if (
              (playerTileX === house.x ||
                playerTileX === house.x - 1 ||
                playerTileX === house.x + 1) &&
              playerTileY === house.y
            ) {
              // Do something when the player is at the house coordinates
              sessionStorage.setItem("house", houseName);
              this.gameTheme.pause();
              this.scene.stop("MainScene");
              this.scene.start("HouseScene");
            }
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

    const interactionDistance = 100;

    if (
      Phaser.Input.Keyboard.JustDown(
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
      )
    ) {
      this.charactersGroup.getChildren().forEach((character) => {
        if (character instanceof Npc || character.isGuard) {
          const distance = Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            character.x,
            character.y
          );
          if (distance < interactionDistance) {
            character.interact();
          }
        }
      });
    }

    let allCharacters = [
      this.character1,
      this.character2,
      this.character3,
      this.character4,
      this.character5,
      this.character6,
      this.character7,
      this.character8,
      this.character9,
    ];

    allCharacters.forEach((character) => {
      character.update();
    });
  }
}

export default MainScene;
