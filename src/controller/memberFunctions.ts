import * as JSZip from 'jszip'
import Log from "../Util";
import * as fs from 'fs';
import { IInsightFacade, InsightResponse, QueryRequest, FILTER, LOGICCOMPARISON, MCOMPARISON, SCOMPARISON, NEGATION } from "./IInsightFacade";


let filterForString = (filter: Object) => {
    return new Promise((fulfill, reject) => {
        let columnName: string;
        let value: string;
        for (let key in filter) {
            columnName = key;
            value = (<any>filter)[key];
        }
        console.log(columnName, value);
    })
}

let filterForMath = (filter: Object, comp: string) => {
    return new Promise((fulfill, reject) => {
        let columnName: string;
        let value: string;
        for (let key in filter) {
            columnName = key;
            value = (<any>filter)[key];
        }
        switch (comp) {
            case "GT": {
                console.log(columnName, value, "In GT");
                break;
            }
            case "LT": {
                console.log(columnName, value, "In LT");
                break;
            }
            case "EQ": {
                console.log(columnName, value, "In Eq");
                break;
            }
            default: {
                console.log("err");
            }
        }
    });
}


export default class Helpers {

    constructor() {
        Log.trace('HelpersImpl::init()');
    }

    convertToBase64(file: string): Promise<string> {
        return new Promise(function (fulfill, reject) {
            fs.open(file, 'r', function (err, fd) {
                console.log(fd);
                if (fd) {
                    fs.fstat(fd, function (err, stats) {
                        var bufferSize = stats.size,
                            chunkSize = 512,
                            buffer = new Buffer(bufferSize),
                            bytesRead = 0;

                        while (bytesRead < bufferSize) {
                            if ((bytesRead + chunkSize) > bufferSize) {
                                chunkSize = (bufferSize - bytesRead);
                            }
                            fs.read(fd, buffer, bytesRead, chunkSize, bytesRead);
                            bytesRead += chunkSize;
                        }
                        let result = buffer.toString('base64', 0, bufferSize);
                        fs.close(fd);
                        fulfill(result);
                    });
                }
                else {
                    reject(err);
                }
            });

        });
    }

    uncompressFile(fileString: any): Promise<any> {
        return new Promise((fulfill, reject) => {
            let zip = JSZip(fileString, { "base64": true });
            zip.folder("courses/").forEach(function (relativePath, file) {
                console.log("iterating over", relativePath);
            });
            console.log(zip);
        });
    }

    runForFilter(query: FILTER): Promise<InsightResponse> {
        let filterKeys = Object.keys(query);
        let promiseArray: any = [];
        filterKeys.forEach(key => {
            if (key === "IS") {
                let x = filterForString(query[key])
                    .then((value) => {
                        return value;
                    })
                    .catch((err) => {
                        // reject(err);
                    });
                promiseArray.push(x);
            }
            else if (key === "GT" || key === "LT" || key === "EQ") {
                let x = filterForMath(query[key], key)
                    .then((value) => {
                        return value;
                    })
                    .catch((err) => {
                        // reject(err);
                    });
                promiseArray.push(x);
            }
            else if (key === "AND" || key === "OR") {

            }
            else if (key === "NOT") {

            }
        });

        return null;
    }
}