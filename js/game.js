// Phaser Game Configuration and Logic

// Global variables
let currentMachineNumber = null;
let isModalOpen = false;

// Main game scene
class ArcadeWorkshop extends Phaser.Scene {
  constructor() {
    super('ArcadeWorkshop');
    this.player = null;
    this.cursors = null;
    this.wasd = null;
    this.arcadeMachines = [];
    this.npcs = [];
  }

  preload() {
    console.log('📦 Starting preload...');

    // Load the Tiled map (JSON format works better with collection tilesets)
    this.load.tilemapTiledJSON('arcadeMap', 'assets/map/arcade.json');

    // Add error handler
    this.load.on('loaderror', (file) => {
      console.error('❌ Failed to load file:', file.src);
    });

    this.load.on('complete', () => {
      console.log('✓ All assets loaded successfully');
    });

    // Load all tileset images (matching arcade-tiles.tsx)
    this.load.image('tile_arcadeTile', 'assets/arcadeset/ArcadeTile.png');
    this.load.image('tile_arcadeTile2', 'assets/arcadeset/ArcadeTile2.png');
    this.load.image('tile_arcadeTile3', 'assets/arcadeset/ArcadeTile3.png');
    this.load.image('tile_arcadeTopDown', 'assets/arcadeset/ArcadeTopDown.png');
    this.load.image('tile_arcadeTopDown2', 'assets/arcadeset/ArcadeTopDown2.png');
    this.load.image('tile_asteroid', 'assets/arcadeset/Asteroid.png');
    this.load.image('tile_carpet1', 'assets/arcadeset/Carpet1.png');
    this.load.image('tile_carpet2', 'assets/arcadeset/Carpet2.png');
    this.load.image('tile_carpet3', 'assets/arcadeset/Carpet3.png');
    this.load.image('tile_carpet4', 'assets/arcadeset/Carpet4.png');
    this.load.image('tile_carpetWithBars', 'assets/arcadeset/CarpetWithBars.png');
    this.load.image('tile_carpetWithBars2', 'assets/arcadeset/CarpetWithBars2.png');
    this.load.image('tile_carpetWithBars3', 'assets/arcadeset/CarpetWithBars3.png');
    this.load.image('tile_carpetWithBars4', 'assets/arcadeset/CarpetWithBars4.png');
    this.load.image('tile_carpetWithBars5', 'assets/arcadeset/CarpetWithBars5.png');
    this.load.image('tile_carpetWithBarsVertical2', 'assets/arcadeset/CarpetWithBarsVertical2.png');
    this.load.image('tile_bar', 'assets/arcadeset/Bar.png');
    this.load.image('tile_foosballTable', 'assets/arcadeset/FoosballTable.png');
    this.load.image('tile_poolTable', 'assets/arcadeset/PoolTable.png');
    this.load.image('tile_poolTable2', 'assets/arcadeset/PoolTable2.png');
    this.load.image('tile_whackAMole', 'assets/arcadeset/WhackAMole.png');

    // Load arcade machine sprites (for interactive objects)
    this.load.image('arcadeTopDown', 'assets/arcadeset/ArcadeTopDown.png');
    this.load.image('arcadeTopDown2', 'assets/arcadeset/ArcadeTopDown2.png');

    // Load player sprites
    this.load.image('player_elephant', 'assets/player_sprites/elephant.png');
    this.load.image('player_giraffe', 'assets/player_sprites/giraffe.png');
    this.load.image('player_hippo', 'assets/player_sprites/hippo.png');
    this.load.image('player_monkey', 'assets/player_sprites/monkey.png');
    this.load.image('player_panda', 'assets/player_sprites/panda.png');
    this.load.image('player_parrot', 'assets/player_sprites/parrot.png');
    this.load.image('player_penguin', 'assets/player_sprites/penguin.png');
    this.load.image('player_pig', 'assets/player_sprites/pig.png');
    this.load.image('player_rabbit', 'assets/player_sprites/rabbit.png');
    this.load.image('player_snake', 'assets/player_sprites/snake.png');

    // Load NPC sprites (matching sprites-tiles.tsx)
    // sprites tileset has firstgid=22 and tile IDs 4, 5, 6
    // GID = firstgid + tile_id
    this.load.image('npc_sprite_26', 'assets/npc_sprites/ben.png');    // GID 26 = 22 + 4
    this.load.image('npc_sprite_27', 'assets/npc_sprites/jacob.png');  // GID 27 = 22 + 5
    this.load.image('npc_sprite_28', 'assets/npc_sprites/kb.png');     // GID 28 = 22 + 6
  }

  create() {
    console.log('🎮 Starting game create...');

    // Set up the scene
    this.cameras.main.setBackgroundColor('#0a0a0a');

    // Get the raw map data directly from cache (skip Phaser's tilemap system)
    const mapData = this.cache.tilemap.get('arcadeMap');
    if (!mapData || !mapData.data) {
      console.error('❌ Failed to load map data');
      return;
    }

    console.log('✓ Map data loaded directly from cache');

    // Calculate world size from map
    const worldWidth = mapData.data.width * mapData.data.tilewidth;
    const worldHeight = mapData.data.height * mapData.data.tileheight;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    console.log(`✓ World size: ${worldWidth}x${worldHeight}`);

    // Manually render tiles from raw data
    this.renderMapManually();

    // Render non-interactive objects (decorations)
    this.renderNonInteractiveObjects();

    // Render room labels
    this.renderRoomLabels();

    // Parse arcade machines from object layer
    this.createArcadeMachinesFromMap();

    // Find spawn point (center of lobby area - tile 9)
    const lobbyCenter = this.findLobbyCenterFromMap();

    // Create NPCs from object layer
    this.createNPCsFromMap();

    // Create player
    this.createPlayer(lobbyCenter.x, lobbyCenter.y);

    // Create collision walls based on void tiles
    this.createCollisionWallsFromTiles();

    // Set up camera to follow player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);

    // Set up controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // Add title text
    const titleText = this.add.text(600, 50, 'VIRTUAL ARCADE WORKSHOP', {
      fontSize: '20px',
      fontFamily: '"Press Start 2P", monospace',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0);

    // Make the title flicker
    this.tweens.add({
      targets: titleText,
      alpha: 0.7,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Add machine count indicator
    const machineCountText = this.add.text(600, 750, `${this.arcadeMachines.length} ARCADE MACHINES`, {
      fontSize: '12px',
      fontFamily: '"Press Start 2P", monospace',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setScrollFactor(0);
  }

  renderMapManually() {
    // Mapping from tile ID to texture key
    // In Tiled JSON, tile IDs in the data start from 1 (firstgid)
    // But the tileset tile IDs start from 0
    // So we need to map: data value -> tileset ID (data - firstgid) -> texture
    const tileIdToTexture = {
      1: 'tile_arcadeTile',      // Tileset tile 0
      2: 'tile_arcadeTile2',     // Tileset tile 1
      3: 'tile_arcadeTile3',     // Tileset tile 2
      4: 'tile_arcadeTopDown',   // Tileset tile 3
      5: 'tile_arcadeTopDown2',  // Tileset tile 4
      6: 'tile_asteroid',        // Tileset tile 5
      7: 'tile_carpet1',         // Tileset tile 6
      8: 'tile_carpet2',         // Tileset tile 7
      9: 'tile_carpet3',         // Tileset tile 8
      10: 'tile_carpet4',        // Tileset tile 9
      11: 'tile_carpetWithBars',      // Tileset tile 10
      12: 'tile_carpetWithBars2',     // Tileset tile 11
      13: 'tile_carpetWithBars3',     // Tileset tile 12
      14: 'tile_carpetWithBars4',     // Tileset tile 13
      15: 'tile_carpetWithBars5',     // Tileset tile 14
      16: 'tile_carpetWithBarsVertical2', // Tileset tile 15
      17: 'tile_bar',            // Tileset tile 16
      18: 'tile_foosballTable',  // Tileset tile 17
      19: 'tile_poolTable',      // Tileset tile 18
      20: 'tile_poolTable2',     // Tileset tile 19
      21: 'tile_whackAMole'      // Tileset tile 20
    };

    console.log('🗺️ Starting to render map manually...');

    // Get the raw layer data from the cache
    const mapData = this.cache.tilemap.get('arcadeMap');
    if (!mapData || !mapData.data || !mapData.data.layers) {
      console.error('❌ No map data found');
      return;
    }

    // Find the floor layer
    const floorLayerData = mapData.data.layers.find(layer => layer.name === 'floor');
    if (!floorLayerData) {
      console.error('❌ No floor layer found');
      return;
    }

    console.log(`✓ Floor layer found: ${floorLayerData.width}x${floorLayerData.height}`);
    console.log(`✓ Data length: ${floorLayerData.data.length}`);

    let tileCount = 0;
    // Manually render each tile as an image
    for (let y = 0; y < floorLayerData.height; y++) {
      for (let x = 0; x < floorLayerData.width; x++) {
        const index = y * floorLayerData.width + x;
        const tileId = floorLayerData.data[index];

        if (tileId > 0) {
          const textureKey = tileIdToTexture[tileId];
          if (textureKey) {
            const tileImage = this.add.image(
              x * 64 + 32,
              y * 64 + 32,
              textureKey
            );
            tileImage.setDepth(-1);
            tileCount++;
          } else {
            console.warn(`⚠️ No texture for tile ID ${tileId} at (${x}, ${y})`);
          }
        }
      }
    }

    console.log(`✓ Rendered ${tileCount} tiles`);
  }

  renderNonInteractiveObjects() {
    console.log('🎨 Rendering non-interactive objects...');

    // Get the raw map data
    const mapData = this.cache.tilemap.get('arcadeMap');
    if (!mapData || !mapData.data || !mapData.data.layers) {
      console.warn('No map data found');
      return;
    }

    // Debug: log all layer names
    console.log('Available layers:', mapData.data.layers.map(l => `"${l.name}" (type: ${l.type})`).join(', '));

    // Mapping from tile ID to texture key (same as tiles)
    const tileIdToTexture = {
      1: 'tile_arcadeTile',
      2: 'tile_arcadeTile2',
      3: 'tile_arcadeTile3',
      4: 'tile_arcadeTopDown',
      5: 'tile_arcadeTopDown2',
      6: 'tile_asteroid',
      7: 'tile_carpet1',
      8: 'tile_carpet2',
      9: 'tile_carpet3',
      10: 'tile_carpet4',
      11: 'tile_carpetWithBars',
      12: 'tile_carpetWithBars2',
      13: 'tile_carpetWithBars3',
      14: 'tile_carpetWithBars4',
      15: 'tile_carpetWithBars5',
      16: 'tile_carpetWithBarsVertical2',
      17: 'tile_bar',
      18: 'tile_foosballTable',
      19: 'tile_poolTable',
      20: 'tile_poolTable2',
      21: 'tile_whackAMole'
    };

    // Find the non-interactives tile layer
    const nonInteractiveLayer = mapData.data.layers.find(layer =>
      layer.type === 'tilelayer' && layer.name === 'non-interactives'
    );

    if (!nonInteractiveLayer) {
      console.warn('No non-interactives layer found in map');
      return;
    }

    let objectCount = 0;

    // Render tiles from the non-interactives layer (same as floor rendering)
    for (let y = 0; y < nonInteractiveLayer.height; y++) {
      for (let x = 0; x < nonInteractiveLayer.width; x++) {
        const index = y * nonInteractiveLayer.width + x;
        const tileGid = nonInteractiveLayer.data[index];

        if (tileGid > 0) {
          // Extract flip flags
          const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
          const FLIPPED_VERTICALLY_FLAG = 0x40000000;
          const FLIPPED_DIAGONALLY_FLAG = 0x20000000;

          const flippedH = (tileGid & FLIPPED_HORIZONTALLY_FLAG) !== 0;
          const flippedV = (tileGid & FLIPPED_VERTICALLY_FLAG) !== 0;
          const flippedD = (tileGid & FLIPPED_DIAGONALLY_FLAG) !== 0;

          // Clear the flags to get the actual tile ID
          const tileId = tileGid & ~(FLIPPED_HORIZONTALLY_FLAG | FLIPPED_VERTICALLY_FLAG | FLIPPED_DIAGONALLY_FLAG);

          const textureKey = tileIdToTexture[tileId];
          if (textureKey) {
            const image = this.add.image(
              x * 64 + 32,
              y * 64 + 32,
              textureKey
            );

            // Handle rotation and flips based on Tiled's encoding
            // Tiled uses flip flags to encode rotation for tile layers:
            // - Diagonal flag alone = 90° CW rotation
            // - H + V flags = 180° rotation
            // - Diagonal + H + V flags = 270° CW rotation

            if (flippedD) {
              // Diagonal flip means we need to rotate
              if (flippedH && flippedV) {
                // Diagonal + H + V = 270° CW (or 90° CCW)
                image.setAngle(270);
              } else if (flippedH) {
                // Diagonal + H = 90° CW + flip Y
                image.setAngle(90);
                image.setFlipY(true);
              } else if (flippedV) {
                // Diagonal + V = 90° CW + flip X
                image.setAngle(90);
                image.setFlipX(true);
              } else {
                // Just diagonal = 90° CW
                image.setAngle(90);
              }
            } else {
              // No diagonal flip, just apply H and V flips normally
              if (flippedH && flippedV) {
                // H + V without diagonal = 180° rotation
                image.setAngle(180);
              } else {
                if (flippedH) image.setFlipX(true);
                if (flippedV) image.setFlipY(true);
              }
            }

            // Set depth between floor and machines
            image.setDepth(0);
            objectCount++;
          }
        }
      }
    }

    console.log(`✓ Rendered ${objectCount} non-interactive objects`);
  }

  renderRoomLabels() {
    console.log('🏷️ Rendering room labels...');

    // Get the raw map data
    const mapData = this.cache.tilemap.get('arcadeMap');
    if (!mapData || !mapData.data || !mapData.data.layers) {
      console.warn('No map data found');
      return;
    }

    // Find the room-labels object layer
    const labelsLayer = mapData.data.layers.find(layer =>
      layer.type === 'objectgroup' && layer.name === 'room-labels'
    );

    if (!labelsLayer || !labelsLayer.objects) {
      console.warn('No room-labels layer found in map');
      return;
    }

    let labelCount = 0;

    // Render each label object
    labelsLayer.objects.forEach((obj) => {
      // Text objects have a "text" property
      if (obj.text) {
        const x = obj.x;
        const y = obj.y;

        // Create the text object with styling
        const labelText = this.add.text(x, y, obj.text.text || obj.name || '', {
          fontSize: obj.text.pixelsize ? `${obj.text.pixelsize}px` : '16px',
          fontFamily: obj.text.fontfamily || '"Press Start 2P", monospace',
          color: obj.text.color || '#ffffff',
          align: obj.text.halign || 'left',
          wordWrap: obj.text.wrap ? { width: obj.width } : undefined
        });

        // Apply text alignment/anchor based on Tiled's alignment
        if (obj.text.halign === 'center') {
          labelText.setOrigin(0.5, 0);
        } else if (obj.text.halign === 'right') {
          labelText.setOrigin(1, 0);
        } else {
          labelText.setOrigin(0, 0);
        }

        // Set depth to be above floor and decorations
        labelText.setDepth(1);

        labelCount++;
      }
    });

    console.log(`✓ Rendered ${labelCount} room labels`);
  }

  createArcadeMachinesFromMap() {
    // Get the raw map data
    const mapData = this.cache.tilemap.get('arcadeMap');
    if (!mapData || !mapData.data || !mapData.data.layers) {
      console.warn('No map data found');
      return;
    }

    // Find the arcade-machines object layer
    const machineLayer = mapData.data.layers.find(layer => layer.type === 'objectgroup' && layer.name === 'arcade-machines');
    if (!machineLayer || !machineLayer.objects) {
      console.warn('No arcade-machines layer found in map');
      return;
    }

    // Clear existing machines array
    this.arcadeMachines = [];

    // Parse each machine object
    machineLayer.objects.forEach((obj, index) => {
      // Machine number is the index + 1
      const machineNumber = index + 1;

      // Object coordinates in Tiled are at the bottom-left of the object
      const x = obj.x;
      const y = obj.y;

      // Extract rotation and flip flags
      // Note: For objects in Tiled, rotation is stored in obj.rotation
      // GID flip flags should only be used if there's no rotation
      const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
      const FLIPPED_VERTICALLY_FLAG = 0x40000000;

      let rotation = obj.rotation || 0;
      let flipX = false;
      let flipY = false;

      // Only use GID flip flags if there's no rotation
      // (rotation and GID flips shouldn't be combined)
      if (obj.gid && rotation === 0) {
        flipX = (obj.gid & FLIPPED_HORIZONTALLY_FLAG) !== 0;
        flipY = (obj.gid & FLIPPED_VERTICALLY_FLAG) !== 0;
      }

      // Debug log for specific machines
      if (index === 4 || index === 5) { // Log machines 5 and 6
        console.log(`Machine ${machineNumber}: rotation=${rotation}, flipX=${flipX}, flipY=${flipY}, gid=${obj.gid}, obj.rotation=${obj.rotation}`);
      }

      const machine = this.createArcadeMachine(x, y, machineNumber, rotation, flipX, flipY);
      this.arcadeMachines.push({
        sprite: machine,
        number: machineNumber,
        data: { x, y, number: machineNumber }
      });
    });

    console.log(`✓ Created ${this.arcadeMachines.length} arcade machines from map`);
  }

  createNPCsFromMap() {
    console.log('👥 Creating NPCs from map...');

    // Get the raw map data
    const mapData = this.cache.tilemap.get('arcadeMap');
    if (!mapData || !mapData.data || !mapData.data.layers) {
      console.warn('No map data found');
      return;
    }

    // Find the npcs object layer
    const npcsLayer = mapData.data.layers.find(layer =>
      layer.type === 'objectgroup' && layer.name === 'npcs'
    );

    if (!npcsLayer || !npcsLayer.objects) {
      console.warn('No npcs layer found in map');
      return;
    }

    // Clear existing NPCs array
    this.npcs = [];

    // Parse each NPC object
    npcsLayer.objects.forEach((obj, index) => {
      // Position in Tiled (bottom-left corner)
      const x = obj.x + 32; // Center the 64px sprite
      const y = obj.y - 32; // Move up to center

      // Get the sprite from the object's gid
      // The gid tells us which tile/sprite from the tileset to use
      const gid = obj.gid;
      const spriteKey = `npc_sprite_${gid}`;

      console.log(`Creating NPC ${index + 1}: gid=${gid}, sprite=${spriteKey}`);

      // Create NPC sprite with physics
      const npc = this.physics.add.sprite(x, y, spriteKey);
      npc.setScale(1); // Use actual sprite size (not scaled like player)
      npc.setDepth(10); // Same depth as player
      npc.setCollideWorldBounds(true);

      // Add random movement properties
      npc.moveSpeed = 50 + Math.random() * 50; // Random speed between 50-100
      npc.changeDirectionTimer = 0;
      npc.changeDirectionInterval = 1000 + Math.random() * 2000; // Change direction every 1-3 seconds
      npc.currentDirection = { x: 0, y: 0 };

      this.npcs.push(npc);
    });

    console.log(`✓ Created ${this.npcs.length} NPCs`);
  }

  findLobbyCenterFromMap() {
    // Find all tiles with ID 9 (Carpet3 - lobby tiles)
    const lobbyTileId = 9;
    let sumX = 0;
    let sumY = 0;
    let count = 0;

    // Get the raw layer data
    const mapData = this.cache.tilemap.get('arcadeMap');
    if (mapData && mapData.data && mapData.data.layers) {
      const floorLayerData = mapData.data.layers.find(layer => layer.name === 'floor');
      if (floorLayerData) {
        for (let y = 0; y < floorLayerData.height; y++) {
          for (let x = 0; x < floorLayerData.width; x++) {
            const index = y * floorLayerData.width + x;
            const tileId = floorLayerData.data[index];

            if (tileId === lobbyTileId) {
              sumX += x * 64 + 32;
              sumY += y * 64 + 32;
              count++;
            }
          }
        }
      }
    }

    if (count > 0) {
      console.log(`✓ Found ${count} lobby tiles, spawning at center`);
      return {
        x: sumX / count,
        y: sumY / count
      };
    }

    // Fallback to map center
    console.log('⚠️ No lobby tiles found, spawning at map center');
    return {
      x: this.worldWidth / 2,
      y: this.worldHeight / 2
    };
  }

  createCollisionWallsFromTiles() {
    // Create collision for all void tiles (tile index 0)
    this.walls = this.physics.add.staticGroup();

    // Get the raw layer data
    const mapData = this.cache.tilemap.get('arcadeMap');
    if (mapData && mapData.data && mapData.data.layers) {
      const floorLayerData = mapData.data.layers.find(layer => layer.name === 'floor');
      if (floorLayerData) {
        let wallCount = 0;
        for (let y = 0; y < floorLayerData.height; y++) {
          for (let x = 0; x < floorLayerData.width; x++) {
            const index = y * floorLayerData.width + x;
            const tileId = floorLayerData.data[index];

            // Tile ID 0 means void/black area
            if (tileId === 0) {
              const rect = this.add.rectangle(
                x * 64 + 32,
                y * 64 + 32,
                64,
                64,
                0x000000,
                0
              );
              this.physics.add.existing(rect, true);
              this.walls.add(rect);
              wallCount++;
            }
          }
        }
        console.log(`✓ Created ${wallCount} collision tiles`);
      }
    }

    // Enable collision between player and walls
    this.physics.add.collider(this.player, this.walls);

    // Enable collision between NPCs and walls
    this.npcs.forEach(npc => {
      this.physics.add.collider(npc, this.walls);
    });

    // Enable collision between NPCs and player
    this.npcs.forEach(npc => {
      this.physics.add.collider(npc, this.player);
    });

    // Enable collision between NPCs themselves
    for (let i = 0; i < this.npcs.length; i++) {
      for (let j = i + 1; j < this.npcs.length; j++) {
        this.physics.add.collider(this.npcs[i], this.npcs[j]);
      }
    }
  }


  createArcadeMachine(x, y, number, rotation = 0, flipX = false, flipY = false) {
    // Tiled object coordinates are at bottom-left, but Phaser defaults to center
    // The offset from bottom-left to center needs to be rotated based on object rotation

    const spriteWidth = 64;
    const spriteHeight = 64;

    // Calculate offset from bottom-left to center, accounting for rotation
    // Base offset (unrotated): right 32, up 32
    const baseOffsetX = spriteWidth / 2;
    const baseOffsetY = -spriteHeight / 2;

    // Rotate the offset vector by the rotation angle
    const rad = rotation * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const rotatedOffsetX = baseOffsetX * cos - baseOffsetY * sin;
    const rotatedOffsetY = baseOffsetX * sin + baseOffsetY * cos;

    const adjustedX = x + rotatedOffsetX;
    const adjustedY = y + rotatedOffsetY;

    // Create arcade machine using sprite
    const machine = this.add.container(adjustedX, adjustedY);

    // Alternate between two arcade machine sprites
    const spriteKey = number % 2 === 0 ? 'arcadeTopDown2' : 'arcadeTopDown';
    const arcadeSprite = this.add.image(0, 0, spriteKey);

    // Apply rotation and flips
    if (rotation !== 0) {
      arcadeSprite.setAngle(rotation);
      console.log(`🔄 Machine ${number}: Applied rotation ${rotation}°, final angle: ${arcadeSprite.angle}`);
    }
    if (flipX) {
      arcadeSprite.setFlipX(true);
    }
    if (flipY) {
      arcadeSprite.setFlipY(true);
    }

    // Debug: log final state for machines with rotation
    if (rotation !== 0 || flipX || flipY) {
      console.log(`🎮 Machine ${number} final state: angle=${arcadeSprite.angle}, flipX=${arcadeSprite.flipX}, flipY=${arcadeSprite.flipY}`);
    }

    // Machine number label (small and positioned at the top)
    const label = this.add.text(0, -24, number.toString(), {
      fontSize: '10px',
      fontFamily: '"Press Start 2P", monospace',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5);

    // Add subtle blinking effect to label
    this.tweens.add({
      targets: label,
      alpha: 0.6,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      delay: number * 50 // Stagger the blinking
    });

    machine.add([arcadeSprite, label]);
    machine.setDepth(5); // Above floor/lobby/walls, below player

    // Make the container interactive
    // Hit area covers the entire sprite (64x64)
    machine.setInteractive(new Phaser.Geom.Rectangle(-32, -32, 64, 64), Phaser.Geom.Rectangle.Contains);
    machine.on('pointerdown', () => {
      this.onMachineClicked(number);
    });

    // Add hover effect by tinting the sprite
    machine.on('pointerover', () => {
      arcadeSprite.setTint(0xff6666); // Red tint on hover
      this.input.setDefaultCursor('pointer');
    });

    machine.on('pointerout', () => {
      arcadeSprite.clearTint(); // Remove tint
      this.input.setDefaultCursor('default');
    });

    return machine;
  }

  createPlayer(startX, startY) {
    // Randomly select a player sprite
    const playerSprites = [
      'player_elephant', 'player_giraffe', 'player_hippo', 'player_monkey',
      'player_panda', 'player_parrot', 'player_penguin', 'player_pig',
      'player_rabbit', 'player_snake'
    ];
    const randomSprite = Phaser.Utils.Array.GetRandom(playerSprites);

    this.player = this.physics.add.sprite(startX, startY, randomSprite);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10); // Ensure player is above floor and machines
    this.player.setScale(0.25); // Scale down the sprite to 25%

    // Set world bounds based on world size
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
  }


  onMachineClicked(machineNumber) {
    // Ignore clicks if modal is already open
    if (isModalOpen) {
      return;
    }
    console.log(`Machine ${machineNumber} clicked`);
    currentMachineNumber = machineNumber;
    openMachineModal(machineNumber);
  }

  update(time, delta) {
    // Don't process input if modal is open
    if (isModalOpen) {
      this.player.setVelocity(0);
      return;
    }

    // Handle player movement
    const speed = 200;

    this.player.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // Normalize diagonal movement
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }

    // Update NPCs
    this.updateNPCs(delta);
  }

  updateNPCs(delta) {
    // Update each NPC's movement
    this.npcs.forEach(npc => {
      // Update the timer
      npc.changeDirectionTimer += delta;

      // Change direction at random intervals
      if (npc.changeDirectionTimer >= npc.changeDirectionInterval) {
        npc.changeDirectionTimer = 0;
        npc.changeDirectionInterval = 1000 + Math.random() * 2000; // New random interval

        // Pick a random direction or stop
        const directions = [
          { x: 0, y: 0 },      // Stop
          { x: 1, y: 0 },      // Right
          { x: -1, y: 0 },     // Left
          { x: 0, y: 1 },      // Down
          { x: 0, y: -1 },     // Up
          { x: 1, y: 1 },      // Down-Right
          { x: -1, y: 1 },     // Down-Left
          { x: 1, y: -1 },     // Up-Right
          { x: -1, y: -1 }     // Up-Left
        ];

        npc.currentDirection = Phaser.Utils.Array.GetRandom(directions);
      }

      // Apply velocity based on current direction
      const vx = npc.currentDirection.x * npc.moveSpeed;
      const vy = npc.currentDirection.y * npc.moveSpeed;

      npc.setVelocity(vx, vy);

      // Normalize diagonal movement
      if (npc.body.velocity.x !== 0 && npc.body.velocity.y !== 0) {
        npc.body.velocity.normalize().scale(npc.moveSpeed);
      }
    });
  }
}

// Phaser game configuration
const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
  parent: 'game-container',
  backgroundColor: '#0a0a0a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [ArcadeWorkshop],
  pixelArt: true, // Enable pixel art mode for crisp sprites
  antialias: false
};

// Initialize the game
const game = new Phaser.Game(config);

// Helper functions to pause/resume game input
function pauseGameInput() {
  console.log('🔴 PAUSING GAME INPUT');
  const scene = game.scene.getScene('ArcadeWorkshop');
  if (scene) {
    // Pause the entire scene (this pauses update loop and time)
    scene.scene.pause();
    console.log('  ✓ Scene paused');

    // Remove keyboard capture so keys work in form inputs
    // This releases the preventDefault() on these keys
    scene.input.keyboard.removeCapture('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE');
    console.log('  ✓ Keyboard capture removed for WASD, arrows, and space');

    // Stop the player's velocity
    if (scene.player) {
      scene.player.setVelocity(0);
    }

    // Stop all NPC velocities
    if (scene.npcs) {
      scene.npcs.forEach(npc => {
        npc.setVelocity(0);
      });
    }

    // Pause all tweens to stop animations
    scene.tweens.pauseAll();
    console.log('  ✓ Tweens paused');

    // Disable ALL interactive objects in the scene
    scene.input.removeAllListeners();
    console.log('  ✓ Input listeners removed');

    // Disable interactivity on all arcade machines
    scene.arcadeMachines.forEach((machine, index) => {
      if (machine.sprite) {
        machine.sprite.disableInteractive();
        console.log(`  ✓ Machine ${index + 1} disabled`);
      }
    });
  }

  // Block pointer events on the game canvas
  const canvas = game.canvas;
  if (canvas) {
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = '0.5'; // Dim the game when paused
    console.log('  ✓ Canvas pointer events blocked and dimmed');
  }
}

function resumeGameInput() {
  console.log('🟢 RESUMING GAME INPUT');
  const scene = game.scene.getScene('ArcadeWorkshop');
  if (scene) {
    // Resume the scene
    scene.scene.resume();
    console.log('  ✓ Scene resumed');

    // Re-add keyboard capture for game controls
    scene.input.keyboard.addCapture('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE');
    console.log('  ✓ Keyboard capture restored for WASD, arrows, and space');

    // Resume all tweens to restart animations
    scene.tweens.resumeAll();
    console.log('  ✓ Tweens resumed');

    // Re-enable interactivity on all arcade machines
    scene.arcadeMachines.forEach((machine, index) => {
      if (machine.sprite) {
        machine.sprite.setInteractive(new Phaser.Geom.Rectangle(-32, -32, 64, 64), Phaser.Geom.Rectangle.Contains);
        console.log(`  ✓ Machine ${index + 1} re-enabled`);
      }
    });
  }

  // Re-enable pointer events on the game canvas
  const canvas = game.canvas;
  if (canvas) {
    canvas.style.pointerEvents = 'auto';
    canvas.style.opacity = '1'; // Restore full opacity
    console.log('  ✓ Canvas pointer events restored and brightened');
  }
}

// Modal management functions
function openMachineModal(machineNumber) {
  // Set modal open flag
  isModalOpen = true;

  showModalView('loading');
  document.getElementById('modal-overlay').classList.remove('hidden');

  // Pause game input while modal is open
  pauseGameInput();

  // Fetch machine data from database
  getMachineData(machineNumber).then(data => {
    if (data && data.game_title) {
      // Machine has a game - show game info
      showGameInfo(data);
    } else {
      // Machine is empty - show out of order
      showOutOfOrder();
    }
  }).catch(error => {
    console.error('Error loading machine data:', error);
    showOutOfOrder();
  });
}

function closeModal() {
  // Clear modal open flag
  isModalOpen = false;

  document.getElementById('modal-overlay').classList.add('hidden');
  hideAllModalViews();
  currentMachineNumber = null;

  // Resume game input when modal is closed
  resumeGameInput();
}

function showModalView(viewName) {
  hideAllModalViews();
  const viewMap = {
    'loading': 'loading-view',
    'out-of-order': 'out-of-order-view',
    'add-game': 'add-game-view',
    'game-info': 'game-info-view'
  };

  const viewId = viewMap[viewName];
  if (viewId) {
    document.getElementById(viewId).classList.remove('hidden');
  }
}

function hideAllModalViews() {
  document.querySelectorAll('.modal-content').forEach(view => {
    view.classList.add('hidden');
  });
}

function showOutOfOrder() {
  showModalView('out-of-order');
}

function showAddGameForm() {
  showModalView('add-game');
  document.getElementById('add-game-form').reset();
}

function showGameInfo(gameData) {
  showModalView('game-info');

  document.querySelector('.game-title-display').textContent = gameData.game_title;
  document.querySelector('.student-name-display').textContent = gameData.student_name;
  document.getElementById('play-game-link').href = gameData.game_link;
}

// Event listeners for modal interactions
document.getElementById('close-modal').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay')) {
    closeModal();
  }
});

document.getElementById('add-game-button').addEventListener('click', () => {
  showAddGameForm();
});

document.getElementById('cancel-add').addEventListener('click', () => {
  showOutOfOrder();
});

document.getElementById('add-game-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const gameTitle = document.getElementById('game-title').value;
  const studentName = document.getElementById('student-name').value;
  const gameLink = document.getElementById('game-link').value;

  try {
    showModalView('loading');
    await saveMachineData(currentMachineNumber, gameTitle, studentName, gameLink);

    // Show success and then close
    const data = await getMachineData(currentMachineNumber);
    showGameInfo(data);
  } catch (error) {
    alert('Error saving game data. Please try again.');
    console.error(error);
    showAddGameForm();
  }
});

document.getElementById('remove-game-button').addEventListener('click', async () => {
  if (confirm('Are you sure you want to remove this game?')) {
    try {
      showModalView('loading');
      await removeMachineData(currentMachineNumber);
      showOutOfOrder();
    } catch (error) {
      alert('Error removing game. Please try again.');
      console.error(error);
    }
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !document.getElementById('modal-overlay').classList.contains('hidden')) {
    closeModal();
  }
});
