const NodeCache = require( "node-cache" );

const nodeCache = new NodeCache( { stdTTL: 100000, checkperiod: 0 } );

export const Cache = {
    get(key){
        if(key && key.endsWith("_commands_country")){
            return (nodeCache.get(key) || [])
            .splice(0, 3);
        }
        return nodeCache.get(key);
    },
    set(key :string, value : any){
        if(key && key.endsWith("_commands_country")){
            const existingValue : string[] = (nodeCache.get(key) || [])
            if(!existingValue.splice(0, 3).includes(value)){
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
}