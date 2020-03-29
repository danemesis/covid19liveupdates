const NodeCache = require( "node-cache" );

export const Cache = new NodeCache( { stdTTL: 100000, checkperiod: 0 } );
