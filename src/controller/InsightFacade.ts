/**
 * This is the main programmatic entry point for the project.
 */
import { IInsightFacade, InsightResponse, QueryRequest } from "./IInsightFacade";
import Helpers from './memberFunctions'

import Log from "../Util";

export default class InsightFacade implements IInsightFacade {

    private helpers: Helpers = null;

    constructor() {
        this.helpers = new Helpers();
        Log.trace('InsightFacadeImpl::init()');
    }

    addDataset(id: string, content: string): Promise<InsightResponse> {
        return new Promise((fulfill, reject) => {
            this.helpers.uncompressFile('courses.zip')
                .then((response) => {

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
