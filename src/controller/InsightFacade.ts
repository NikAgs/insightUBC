/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";
import Helpers from './memberFunctions'

import Log from "../Util";

export default class InsightFacade implements IInsightFacade {
    
    private helpers:Helpers = new Helpers();

    constructor() {
        Log.trace('InsightFacadeImpl::init()');
    }

    addDataset(id: string, content: string): Promise<InsightResponse> {
        this.helpers.uncompressFile('courses.zip');
        return null;
    }

    removeDataset(id: string): Promise<InsightResponse> {
        return null;
    }

    performQuery(query: QueryRequest): Promise <InsightResponse> {
        return null;
    }
}
