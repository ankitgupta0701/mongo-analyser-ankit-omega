var mongoClient = require("mongodb").MongoClient,
    db;

export class MongoDBAdapter {
    private db: any;

    async connect(con_string: string, db_name: any) {
        try {
            var connection = await mongoClient.connect(con_string, { useNewUrlParser: true });
            this.db = connection.db(db_name);
            console.log("MongoClient Connection successfull.");
        }
        catch (ex) {
            console.error("MongoDB Connection Error.,", ex);
        }
    }

    private isObject(obj: any) {
        return Object.keys(obj).length > 0 && obj.constructor === Object;
    }

    async findDocFieldsByFilter(coll: string, query: any, projection: any, lmt: Number) {
        if (!query) {
            throw Error("mongoClient.findDocFieldsByFilter: query is not an object");
        }
        return await this.db.collection(coll).find(query, {
            projection: projection || {},
            limit: lmt || 0
        }).toArray();
    }

    async runAggregation(coll: string, query: any) {
        if (!query.length) {
            throw Error("mongoClient.findDocByAggregation: query is not an object");
        }
        return this.db.collection(coll).aggregate(query).toArray();
    }

    async getDocumentCountByQuery(coll: string, query: any) {
        return this.db.collection(coll).estimatedDocumentCount(query || {})
    }

    async runAdminCommand(command: any) {
        return this.db.collection("admin").runCommand(command);
    }

    async close() {
        return await this.db.close();
    }


    async calculateWorkingSet(con_string: string, db_name: any) {
        try {
            var connection = await mongoClient.connect(con_string, { useNewUrlParser: true });
            this.db = connection.db(db_name);
            //console.log(await connection.db("admin").command({dbStats: 1}));

            //let storageSize = 0
            //let dataSize = 0
            let indexSize = 0
            //let documentCount = 0

            let result = await connection.db("admin").command({ listDatabases: 1 });

            let databases = result.databases;

            /*
            const response = new Promise(() => {databases.forEach(async (element: any) => {
                let e = element;
                if ((e.name == "admin" || e.name == "config" || e.name == "local"))
                    return;
                let database = e.name;
                let context = connection.db(database);
                var s = await context.command({dbStats: 1, scale: 1024 * 1024})
                storageSize = storageSize + s.storageSize
                dataSize = dataSize + s.dataSize
                indexSize = indexSize + s.dataSize
                documentCount = documentCount + s.objects
        
                })
            });
         */
            console.log("Number of databases: " + databases.length);
            console.log("==============================");
            for (let i = 0; i < databases.length; i++) {
                let e = databases[i];
                if ((e.name == "admin" || e.name == "config" || e.name == "local"))
                    continue;
                let database = e.name;
                let context = connection.db(database);

                var s = await context.command({ dbStats: 1, scale: 1024 * 1024 })
                //console.log("Database name: " + database);
                //console.log("database: " + database+ " Storage Size: " + s.storageSize + " dataSize: " + s.dataSize + " indexSize: " + s.indexSize + " documentCount: " + s.objects + " index " + i);
                
                //storageSize = storageSize + s.storageSize;
                //dataSize = dataSize + s.dataSize;
                indexSize = indexSize + s.indexSize;
                //documentCount = documentCount + s.objects;
       
            }
            //console.log("Final Result:");
            //console.log("Total Storage Size: " + storageSize + " MB");
            //console.log("Total Data Size: " + dataSize + " MB");
            console.log("Total Index Size: " + indexSize + " MB");
            //console.log("Total Number of Documents: " + documentCount);
            
            let serverStatus = await connection.db("admin").command({ serverStatus: 1 });
            let wiredTigerCacheSize = serverStatus.wiredTiger.cache["maximum bytes configured"]/(1024*1024);
            let bytesDirtyInTheCache = serverStatus.wiredTiger.cache["tracked dirty bytes in the cache"]/(1024*1024);

            let expectedSize = (indexSize + bytesDirtyInTheCache) * 1.2;

            console.log("==============================");
            console.log("Configured WiredTigerCache Size: " + wiredTigerCacheSize + " MB");
            console.log("==============================");
            console.log("Dirty data in WiredTigerCache Size: " + bytesDirtyInTheCache + " MB");
            console.log("==============================");

            if (expectedSize > wiredTigerCacheSize)
            {
                //console.log("Cluster is undersized!", 'background: #222; color: #bada55');
                console.log("Expected Size: " + expectedSize + " is greater than allocated wiredTiger Cache: " + wiredTigerCacheSize);
                console.log("==============================");
                console.log("Additional " + (expectedSize - wiredTigerCacheSize) + " MB of WiredTiger Cache is required to accomodate the current workload.");
            }
            else{
                console.log("Enough wiredTiger allocated for the cluster!");
            }
        }
        catch (ex) {
            console.error("MongoDB Connection Error.,", ex);
        }
    }
}
