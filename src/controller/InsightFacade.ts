/**
 * This is the main programmatic entry point for the project.
 */
import { IInsightFacade, InsightResponse, QueryRequest, FILTER, LOGICCOMPARISON, MCOMPARISON, SCOMPARISON, NEGATION } from "./IInsightFacade";
import Helpers from './memberFunctions'
import Log from "../Util";
import * as fs from "fs";


export default class InsightFacade implements IInsightFacade {

    private helpers: Helpers = null;
    private stringZip: any = null;
    constructor() {
        this.helpers = new Helpers();
        Log.trace('InsightFacadeImpl::init()');
    }

    addDataset(id: string, content: string): Promise<InsightResponse> {
        // console.log("In addDataset");
        return new Promise((fulfill, reject) => {
            this.helpers.parseData(id, content)
                .then((response) => {
                    fs.exists(id, function (exists) {
                        if (exists) {
                            fs.writeFile(id, JSON.stringify(response), function (err: any) {
                                fulfill({
                                    code: 201,
                                    body: {}
                                });
                            });
                        }
                        else {
                            fs.writeFile(id, JSON.stringify(response), function (err: any) {
                                fulfill({
                                    code: 204,
                                    body: {}
                                });
                            });
                        }
                    });

                })
                .catch((err) => {
                    console.log(err);
                    reject({
                        code: 400,
                        body: { "error": err }
                    });
                });
        });
    }

    removeDataset(id: string): Promise<InsightResponse> {
        return new Promise((fulfill, reject) => {
            fs.readFile(id, (err: any, data: any) => {
                if (err) {
                    reject({
                        code: 404,
                        body: {}
                    });
                } else {
                    fs.unlink(id);
                    fulfill({
                        code: 204,
                        body: {}
                    });
                }
            });
        });
    }

    performQuery(query: QueryRequest): Promise<InsightResponse> {
        return new Promise((fulfill, reject) => {
            let filter = query.WHERE;
            let optionsRequest = query.OPTIONS;
            this.helpers.runForFilter(filter)
                .then((response) => {
                    // console.log(response);
                    // fulfill(response);
                    this.helpers.runForOptions(response, optionsRequest)
                        .then((response) => {
                            // console.log(response);
                            fulfill(
                                {
                                    code: 200,
                                    body: {
                                        render: 'TABLE',
                                        result: response
                                    }
                                });
                        });
                })
                .catch(err => {
                    console.log(err);
                    reject({
                        code: 400,
                        body: {
                            "error": err
                        }
                    })
                });
        })
    }
}