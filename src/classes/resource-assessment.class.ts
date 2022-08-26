import { MongoClient } from "mongodb";
import { MongoDBAdapter } from "../adapters/mongodb.adapter";

export class ResourceAssessment {
    private connectionString: string;

    constructor(connString: string) {
        this.connectionString = connString
        new MongoDBAdapter().calculateWorkingSet(this.connectionString, "test");
    }

    async initiateAssessment(){
        //let adapter = new MongoDBAdapter();
        //adapter.connect(this.connectionString, "admin");
        //console.log(adapter);
        //adapter.close();

        //let result = adapter.runAdminCommand({serverStatus:1});
        //console.log(result);
    }



}