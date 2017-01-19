/**
 * This is the main programmatic entry point for the project.
 */
import { IInsightFacade, InsightResponse, QueryRequest } from "./IInsightFacade";
import Helpers from './memberFunctions'

import Log from "../Util";

export default class InsightFacade implements IInsightFacade {

    private helpers: Helpers = null;
    private stringZip: any = null;
    constructor() {
        this.helpers = new Helpers();
        Log.trace('InsightFacadeImpl::init()');
        this.helpers.convertToBase64('/home/aman/Desktop/courses.zip')
            .then((res: InsightResponse) => {
                // console.log(res);
                console.log("Loaded initial zip");
                this.stringZip = res.body;
                this.addDataset('courses', this.stringZip);
            });
    }

    addDataset(id: string, content: string): Promise<InsightResponse> {
        return new Promise((fulfill, reject) => {
            this.helpers.uncompressFile(content)
                .then((response) => {
                    console.log("Content Recieved, adding to Dataset");
                    fulfill(null);
                })
                .catch((err) => {
                    reject({
                        code: 400,
                        body: "Test Failed"
                    })
                });
        });

    }

    removeDataset(id: string): Promise<InsightResponse> {
        return null;
    }

    performQuery(query: QueryRequest): Promise<InsightResponse> {
        return null;
    }
}
