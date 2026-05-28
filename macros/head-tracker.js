var p = Player.getPlayer();
var inv = Player.openInventory();
var container = null;

const pitches = [70, 0, -70];
const toTrackSlotIndex = 8;
const trackedSlotIndex = 7;
const nonHeadSlotIndex = 6;
const containerSlotCount = 54;
const inventorySlotCount = 27;
const outputDirectory = "";



// ----------------------------------------------------------------------------------------------------------
// NBT Parsing and Data Extraction Functions
// ----------------------------------------------------------------------------------------------------------

/**
 * Recursively converts NBT helper objects to plain JavaScript objects.
 * Handles all NBT types: COMPOUND (10), LIST (9), STRING (8), DOUBLE (6), FLOAT (5), LONG (4), INT (3), SHORT (2), BYTE (1).
 * @param {NBTHelper} helper - the NBT helper object to convert
 * @returns {Object|Array|string|number} the converted JavaScript value
 */
function nbtToObj(helper) {
    switch (helper.getType()) {
        // Compound
        case 10:
            const obj = {};
            const compound = helper.asCompoundHelper();
            for (const k of compound.getKeys()) obj[k] = nbtToObj(compound.get(k));
            return obj;
        // List
        case 9:
            const arr = [];
            const list = helper.asListHelper();
            for (let i = 0; i < list.length(); i++) arr.push(nbtToObj(list.get(i)));
            return arr;
        // String
        case 8:
            return helper.asString();
        // Double
        case 6:
        case 5:
            return helper.asDouble();
        // Long
        case 4:
            return helper.asLong();
        // Integer
        case 3:
        case 2:
        case 1:
            return helper.asInt();
        // Unhandled types - fallback to string representation
        default:
            return helper.toString();
    }
}

/**
 * Extracts player head metadata from an item including name, rarity, and base64-encoded texture.
 * @param {Item} item - the item to scrape data from
 * @returns {Object|null} object with name, rarity, and texture_b64 properties, or null if item has no NBT
 */
function scrapeHeadData(item) {
    const nbt = item.getNBT();
    if (!nbt) return null;

    const obj = nbtToObj(nbt);
    const emf = obj["minecraft:custom_data"]?.["evenmorefish"];
    const textureProp = obj["minecraft:profile"]?.properties?.find(p => p.name === "textures");
    const name = obj["minecraft:custom_name"]?.extra?.[0]?.extra?.[0]?.text ?? null;

    return {
        name: name,
        rarity: emf ? emf["emf-fish-rarity"] : null,
        texture_b64: textureProp ? textureProp.value : null
    };
}

/**
 * Saves an array of head data objects to a JSON file in the output directory.
 * @param {Object[]} data - array of head data objects to save
 */
function saveDataToFile(data) {
    const File = Java.type("java.io.File");
    const FileWriter = Java.type("java.io.FileWriter");
    const fileName = "head_data_" + Date.now() + ".json";
    const file = new File(outputDirectory, fileName);
    try {
        const writer = new FileWriter(file);
        writer.write(JSON.stringify(data, null, 2));
        writer.close();
    } catch (e) {
        Chat.log(`Error saving data to file: ${e}`);
    }
}



// ----------------------------------------------------------------------------------------------------------
// Bundle and Inventory Handler Functions
// ----------------------------------------------------------------------------------------------------------

/**
 * Checks if an item is a bundle.
 * @param {Item} item - the item to check
 * @returns {boolean} true if the item is a minecraft:bundle, false otherwise
 */
function isBundle(item) {
    try {
        return item.getItemId() === "minecraft:bundle";
    } catch (e) {
        return false;
    }
}

/**
 * Checks if a bundle item contains a player head.
 * @param {Item} item - the bundle item to check
 * @returns {boolean} true if the bundle's NBT data contains minecraft:player_head, false otherwise
 */
function bundleContainsHead(item) {
    try {
        const nbt = item.getNBT();
        const hasHead = nbt && nbt.toString().includes("minecraft:player_head");
        return hasHead;
    } catch (e) {        
        return false;
    }
}

/**
 * Checks if a bundle item is empty.
 * @param {Item} item - the bundle item to check
 * @returns {boolean} true if the bundle has no NBT data, false otherwise
 */
function bundleIsEmpty(item) {
    try {
        return !item.getNBT();
    } catch (e) {
        return false;
    }
}


/**
 * Interacts with the block in front of the player and opens the resulting container.
 * Sets the global `container` variable on success.
 * @returns {InventoryHelper} the opened container, or undefined if not a container
 */
function openContainer() {
    p.interact();
    Client.waitTick(10);
    container = Player.openInventory();
    if (!container.isContainer()) {
        Chat.log("[ERROR] Inventory is not container. Cannot retrieve bundles!")
        return undefined;
    }
    return container;
}


/**
 * Closes the global `container` if it is currently open.
 * No-op if the container is not valid.
 */
function closeContainer() {
    if (!container.isContainer()) return;
    container.close();
}



// ----------------------------------------------------------------------------------------------------------
// Main Processing Functions
// ----------------------------------------------------------------------------------------------------------

/**
 * Scans the currently open container for bundles containing player heads.
 * @returns {number[]} array of slot indices for bundles that contain heads
 */
function getBundleSlotsInChest() {
    const bundleSlots = [];
    for (let i = 0; i < container.getTotalSlots() - 36; i++) {
        const item = container.getSlot(i);
        if (isBundle(item) && bundleContainsHead(item)) bundleSlots.push(i);
    }
    return bundleSlots;
}

/**
 * Quick-clicks a bundle slot in the container to move it to the cursor.
 * @param {number} slotIndex - the slot index of the bundle to select
 */
function swapToTrackBundle(slotIndex) {
    container.quick(slotIndex);
}

/**
 * Swaps the currently tracked bundle from the cursor back to its hotbar slot.
 * Swaps the current tracking slot with the to-track slot.
 */
function swapTrackedBundle() {
    const offset = containerSlotCount + inventorySlotCount;
    container.quick(trackedSlotIndex + offset);
    Client.waitTick(3);
    container.swapHotbar(toTrackSlotIndex + offset, trackedSlotIndex);
}

/**
 * Extracts player heads from a bundle one-by-one, writing metadata to JSON files.
 * Routes non-head items to the non-head slot. Continues until bundle is empty or contains no heads.
 */
function trackHeads() {
    const offset = containerSlotCount + inventorySlotCount;
    const toTrackContainerSlot = offset + toTrackSlotIndex;
    const trackedContainerSlot = offset + trackedSlotIndex;
    const nonHeadContainerSlot = offset + nonHeadSlotIndex;

    const data = [];
    while (true) {
        Client.waitTick();
        const bundleItem = container.getSlot(toTrackContainerSlot);
        if (!bundleItem || bundleItem.getItemId() !== "minecraft:bundle") break;
        const nbt = bundleItem.getNBT();
        if (!nbt || !nbt.toString().includes("minecraft:player_head")) break;

        container.click(toTrackContainerSlot, 1);
        Client.waitTick();

        const cursor = container.getHeld();
        if (!cursor || cursor.isEmpty()) break;

        if (cursor.getItemId() === "minecraft:player_head") {
            const headData = scrapeHeadData(cursor);
            data.push(headData);
            container.click(trackedContainerSlot);
        } else {
            container.click(nonHeadContainerSlot);
        }
    }
    return data;
}



// ----------------------------------------------------------------------------------------------------------
// Main Function and Event Listeners
// ----------------------------------------------------------------------------------------------------------


JsMacros.on("AttackBlock", JavaWrapper.methodToJava(e => {
    main();
}));

JsMacros.on("AttackEntity", JavaWrapper.methodToJava(e => {
    main();
}));

/**
 * Main entry point. Iterates through multiple container views, collects bundles with heads, and extracts head metadata.
 */
function main() {
    Client.waitTick(10);
    const allData = [];
    for (const pitch of pitches) {
        p.lookAt(-180, pitch);
        Client.waitTick(10);
        openContainer()
        for (const bundleSlot of getBundleSlotsInChest()) {
            Client.waitTick(10);
            swapToTrackBundle(bundleSlot);
            const headData = trackHeads();
            allData.push(...headData);
            swapTrackedBundle();
        }
        closeContainer();
    }
    saveDataToFile(allData);
}