import { world, system } from "@minecraft/server";

// ─────────────────────────────────────────
//  WELCOME MESSAGE ON JOIN
// ─────────────────────────────────────────
world.afterEvents.playerSpawn.subscribe((event) => {
  const player = event.player;
  const initialSpawn = event.initialSpawn;

  if (initialSpawn) {
    system.runTimeout(() => {
      player.onScreenDisplay.setTitle("§6§lWELCOME!", {
        subtitle: `§aHello, §e${player.name}§a! 👋`,
        fadeInDuration: 20,
        stayDuration: 80,
        fadeOutDuration: 20,
      });

      player.sendMessage(
        `\n§8§m-----------------------------§r\n` +
        `§6★ §eWelcome to the server, §b${player.name}§e! §6★\n` +
        `§aWe're so happy to have you here!\n` +
        `§7Have fun and enjoy your stay. 😊\n` +
        `§8§m-----------------------------§r\n`
      );

      player.playSound("random.levelup", { volume: 1.0, pitch: 1.0 });
    }, 40);
  }
});

world.afterEvents.playerJoin.subscribe((event) => {
  world.sendMessage(`§7[§a+§7] §e${event.playerName} §ahas joined the world!`);
});

// ─────────────────────────────────────────
//  FIREWORKS ON BLOCK BREAK
// ─────────────────────────────────────────

// Firework sounds to cycle through
const fireworkSounds = [
  "firework.launch",
  "firework.blast",
  "firework.large_blast",
  "firework.twinkle",
];

function spawnFirework(dimension, location) {
  // Center on the broken block
  const x = Math.floor(location.x) + 0.5;
  const y = Math.floor(location.y) + 1;   // slightly above the block
  const z = Math.floor(location.z) + 0.5;

  try {
    // Spawn a fireworks_rocket entity using the script API (no NBT needed)
    const firework = dimension.spawnEntity(
      "minecraft:fireworks_rocket",
      { x, y, z }
    );

    // Pick a random sound
    const sound = fireworkSounds[Math.floor(Math.random() * fireworkSounds.length)];

    // Play firework sounds
    dimension.runCommand(`playsound firework.launch @a ${x} ${y} ${z} 1 1`);
    dimension.runCommand(`playsound ${sound} @a ${x} ${y} ${z} 1 1.2`);

    // Remove entity after short delay so it doesn't fly away
    system.runTimeout(() => {
      try { firework.remove(); } catch (_) {}
    }, 5);

  } catch (err) {
    // Fallback — command-only sound approach if entity spawn fails
    try {
      dimension.runCommand(`playsound firework.launch @a ${x} ${y} ${z} 1 1`);
      dimension.runCommand(`playsound firework.blast @a ${x} ${y} ${z} 1 1`);
    } catch (_) {}
  }
}

world.afterEvents.playerBreakBlock.subscribe((event) => {
  const { dimension, block } = event;
  const location = block.location;

  // Small delay so the block is fully broken first
  system.runTimeout(() => spawnFirework(dimension, location), 1);
});
