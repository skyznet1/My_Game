class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  preload() {
    this.load.image("background", "assets/images/menu_screen.jpg");
    this.load.audio("menu_theme", "assets/musics/menu_theme.mp3");
  }

  create() {
    const menuTheme = this.sound.add("menu_theme", {loop: true});
    menuTheme.play();

    // Display the menu setting
    const settingsIcon = document.querySelector(".settings-btn");
    const soundIcon = document.querySelector(".sound-btn");

    settingsIcon.addEventListener("click", function() {
      console.log("Clcik sur settings")
    });

    soundIcon.addEventListener("click", function() {
      if (menuTheme.isPlaying) {
        soundIcon.children[0].src = "assets/images/sound_icon_off.png";
        menuTheme.pause();
      } else {
        soundIcon.children[0].src = "assets/images/sound_icon_on.png";
        menuTheme.resume();
      }
    });

    const { width: canvasWidth, height: canvasHeight } = this.cameras.main;

    const background = this.add.image(0, 0, "background").setOrigin(0);
    background.setDisplaySize(canvasWidth, canvasHeight);

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    const style = {
      fontSize: "70px",
      fontFamily: "Minecraft",
      fill: "#fff",
    };

    this.add.text(centerX, 80, "Oppenheimer: le jeu", style).setOrigin(0.5);

    const buttonWidth = 500;
    const buttonHeight = 120;
    const buttonColor = 0xfa9c1b;
    const buttonText = "Commencer";

    const startButton = this.add.rectangle(centerX, centerY, buttonWidth, buttonHeight, buttonColor).setInteractive();

    this.add.text(centerX, centerY, buttonText, style).setOrigin(0.5);

    startButton.on("pointerdown", () => {
      menuTheme.stop();
      this.scene.start("MainScene");
    });
  }
}

export default MenuScene;