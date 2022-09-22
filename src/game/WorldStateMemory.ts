import { SerializedWorld, Serializer } from '@physics/Serializer';
import { World } from '@physics/World';

type WorldStateSnapshot = {
    time: number;
    dt: number;
    serialized: SerializedWorld;
};

const WORLD_STATE_SNAPSHOT_LIMIT = 1000;

export class WorldStateMemory {
    private index = 0;
    private timeProgressed = 0;
    private worldStateSnapshots: WorldStateSnapshot[] = [];

    update(dt: number, world: World): void {
        this.index += 1;

        if (this.worldStateSnapshots[this.index]) return; // don't overwrite

        this.timeProgressed += dt;

        if (this.worldStateSnapshots.length >= WORLD_STATE_SNAPSHOT_LIMIT) {
            this.worldStateSnapshots.shift();
        }

        this.worldStateSnapshots.push({
            time: this.timeProgressed,
            dt,
            serialized: Serializer.getSerializedWorld(world),
        });
    }

    getSnapshot(): WorldStateSnapshot | null {
        return this.worldStateSnapshots[this.index] || null;
    }

    goForward(): void {
        this.index += 1;
    }

    goBackward(): void {
        if (this.worldStateSnapshots[this.index - 1]) this.index -= 1;
    }
}
