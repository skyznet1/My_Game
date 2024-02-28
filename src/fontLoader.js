let minecraftFont = new FontFace("Minecraft", "url(assets/fonts/Minecraft.ttf)", { style: "normal", weight: 700 });

minecraftFont.load().then(function (loadedFont) {
    document.fonts.add(loadedFont);
});