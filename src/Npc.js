class Npc extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, path) {
        super(scene, x, y, texture);
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.isTalking = false;
        this.path = path;
        this.currentPathIndex = 0;
        this.npcName = texture;
        this.name = "Npc";

        if (!texture.includes("guard")) {
            this.animationNames = {
                walkLeft: `${texture}_walk_left`,
                walkRight: `${texture}_walk_right`,
                walkUp: `${texture}_walk_up`,
                walkDown: `${texture}_walk_down`,
                walkStay: `${texture}_walk_stay`
            };
        }

        this.body.setSize(5, 5);

        scene.physics.world.enable(this);
        this.setImmovable(true);
    }

    update() {
        if (!this.isTalking && !this.npcName.includes("guard")) {
            this.followPath();
        }
    }

    followPath() {
        if (this.currentPathIndex < this.path.length) {
            const targetX = this.path[this.currentPathIndex].x;
            const targetY = this.path[this.currentPathIndex].y;

            const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
            const speed = 50;
            this.setVelocityX(Math.cos(angle) * speed);
            this.setVelocityY(Math.sin(angle) * speed);

            if (Math.abs(this.body.velocity.x) > Math.abs(this.body.velocity.y)) {
                if (this.body.velocity.x < 0) {
                    this.anims.play(this.animationNames.walkLeft, true);
                } else {
                    this.anims.play(this.animationNames.walkRight, true);
                }
            } else {
                if (this.body.velocity.y < 0) {
                    this.anims.play(this.animationNames.walkUp, true);
                } else {
                    this.anims.play(this.animationNames.walkDown, true);
                }
            }
            // Vérifier si le NPC est proche de la position cible
            const distance = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
            if (distance < 5 && !this.npcName.includes("guard")) {
                this.currentPathIndex++; // Passer à la prochaine position du trajet
                if (this.currentPathIndex >= this.path.length) {
                    this.currentPathIndex = 0; // Revenir au début du trajet
                }
            }
        }
    }


    stop() {
        this.setVelocity(0, 0);
        this.anims.stop()
    }
    
    interact() {
        if (!this.isTalking) {
            this.stop();
            this.isTalking = true;

            // Vérifiez quel NPC est en train d'interagir (en fonction de la texture par exemple)
            if (this.texture.key === 'guard') {
                this.showDialogue([
                    ["Bienvenue à Los Alamos, étranger."],
                    ["Vous avez des affaires ici ?"]
                ]);
            } else if (this.texture.key === 'colonel') {
                this.showDialogue([
                    "Bienvenue à Los Alamos, jeune recrue. Nous sommes en train de réaliser quelque chose d'incroyable ici.",
                    "Le projet Manhattan vise à développer la première bombe atomique. La puissance de l'atome entre nos mains.",
                    "Nous avons rassemblé certaines des plus grandes intelligences scientifiques du monde pour ce projet.",
                    "Mais n'oublions pas les implications éthiques et morales de ce que nous créons ici.",
                    "Le célèbre physicien Robert Oppenheimer dirige cette opération. Il a une vision radicale pour l'avenir.",
                    "Soyez prudent lorsque vous parlez de nos travaux ici. La sécurité et le secret sont primordiaux.",
                    "N'ayez pas peur de poser des questions et d'apprendre. Vous faites maintenant partie de l'histoire."
                ]);
            } else if (this.texture.key === 'femme1') {
                this.showDialogue([
                    ["Bienvenue dans notre laboratoire de pointe !"],
                    ["Nous travaillons sur des expériences passionnantes ici."]
                ]);
            } else if (this.texture.key === 'scientifique1') {
                this.showDialogue([
                    ["Oh bonjour, comment ça va ?"],
                    ["J'espère que vous profitez de votre séjour à Los Alamos."]
                ]);
            } else if (this.texture.key === 'scientifique2') {
                this.showDialogue([
                    ["Ah, vous avez entendu parler du projet Manhattan ?"],
                    ["C'est un projet secret pour développer la première bombe atomique."],
                    ["Certains pensent que c'est dangereux, d'autres disent que c'est nécessaire."]
                ]);
            }
        }
    }

    showDialogue(dialogueArray) {
        let currentDialogueIndex = 0;
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

export default Npc;
