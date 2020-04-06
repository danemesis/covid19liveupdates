import * as NodeCache from "node-cache";

const nodeCache = new NodeCache({stdTTL: 100000, checkperiod: 0});

export const Cache = {
    get(key) {
        if (key && key.endsWith("_commands_country")) {
            //TODO: Add type for get returned value
            return (nodeCache.get(key) || [])
                .slice(0, 3);
        }
        return nodeCache.get(key);
    },
    set(key: string, value: any) {
        if (key && key.endsWith("_commands_country")) {
            let existingValue: string[] = (nodeCache.get(key) || []).splice(0, 3);
            if (!existingValue.includes(value)) {
                existingValue.unshift(value);
            }
            nodeCache.set(
                key,
                existingValue
            );
            return;
        }

        nodeCache.set(key, value);
    }
};
