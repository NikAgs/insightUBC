import Log from "../Util";
import * as fs from 'fs';
import {
    IInsightFacade, InsightResponse,
    QueryRequest, FILTER, OPTIONS, LOGICCOMPARISON, MCOMPARISON, SCOMPARISON, NEGATION,
    courseRecord, roomRecord
} from "./IInsightFacade";

import * as parse5 from 'parse5';

let JSZip = require("jszip");
import Validate from './validationFunctions'


export default class Helpers {

    public validate: Validate = null;
    public dataSet: Map<string, any[]> = new Map<any, any>();
    constructor() {
        this.validate = new Validate();
        // Log.trace('HelpersImpl::init()');
    }

    loadCoursesFromFile(file: any): Promise<[Object]> {
        return new Promise((fulfill, reject) => {
            let arr: courseRecord[] = [];
            file.async("string")
                .then(function (str: any) {
                    var jsonArr = JSON.parse(str);
                    for (let i in jsonArr.result) {
                        var course: courseRecord = {};
                        var entry = jsonArr.result[i];
                        course.courses_dept = entry.Subject;
                        course.courses_id = entry.Course;
                        course.courses_audit = entry.Audit;
                        course.courses_avg = entry.Avg;
                        course.courses_fail = entry.Fail;
                        course.courses_pass = entry.Pass;
                        course.courses_title = entry.Title;
                        course.courses_instructor = entry.Professor;
                        course.courses_uuid = entry.id;
                        course.courses_year = (entry.Section == 'overall') ? 1990 : entry.Year;

                        if (course != {}) {
                            arr.push(course);
                        }
                    }
                    // console.log("In file function", arr.length);
                    fulfill(arr);
                }).catch((err: any) => {
                    console.log("Error", err);
                    reject(err);
                });
        })
    }

    parseDataForRooms(zip: any): Promise<any> {
        return new Promise((fulfill, reject) => {
            zip.file('index.htm')
                .async("string")
                .then((str: string) => {
                    let Document = parse5.parse(str) as parse5.AST.Default.Document;
                    let serial = "";
                    for (let node of Document.childNodes) {
                        if (node.nodeName === 'html') {
                            // console.log(node);
                            let nodeParse: any = node;
                            for (let bodyNode of nodeParse.childNodes) {
                                if (bodyNode.nodeName == 'body') {
                                    serial = parse5.serialize(bodyNode);
                                    serial = serial.substring(serial.indexOf("<table"), serial.indexOf("</table>"));
                                    // console.log(serial);
                                }
                            }
                        }
                    }
                    let Table: any = parse5.parseFragment(serial) as parse5.AST.HtmlParser2.DocumentFragment;
                    for (let node of Table.childNodes[0].childNodes) {
                        if (node.tagName == 'tbody') {
                            //THESE CHILD NODES ARE THE TABLE ROWS
                            console.log(node.childNodes);
                            fulfill();
                        }
                    };
                });
        })
    }
    // Parses the base64 fileString into an array of courseRecords 
    parseData(id: string, fileString: string): Promise<[courseRecord]> {
        let promiseArray: any = [];
        let self = this;
        return new Promise((fulfill, reject) => {
            JSZip.loadAsync(fileString, { base64: true })
                .then(function (zip: any) {
                    if (id === "courses") {
                        zip.folder(id)
                            .forEach(function (relativePath: any, file: any) {
                                promiseArray.push(self.loadCoursesFromFile(file));
                            });
                        return promiseArray;
                    }
                    else if (id === "rooms") {
                        return self.parseDataForRooms(zip);
                    }
                    else {
                        reject({
                            code: 400,
                            body: { "error": "Invalid id" }
                        });
                    }

                })
                .then((response: any) => {
                    Promise.all(response)
                        .then(val => {
                            fulfill(val);
                        })
                })
                .catch(function (err: any) {
                    reject({
                        code: 400,
                        body: { "error": err }
                    });
                });
        });
    }

    filterForString(filter: Object): Promise<[Object]> {
        let self = this;
        return new Promise((fulfill, reject) => {
            let columnName: string;
            let value: string;
            for (let key in filter) {
                columnName = key;
                value = (<any>filter)[key];
            }
            if (typeof value != 'string') {
                reject(
                    {
                        code: 400,
                        body: {
                            "error": value + " is not a valid string"
                        }
                    });
            }
            self.validate.checkColumnIsValid([columnName], 'string')
                .then(() => {
                    let finalObj: [Object];
                    // console.log(self.dataSet.length);
                    self.dataSet.get("courses").forEach(course => {
                        if (course.length > 0) {
                            course.forEach((record: any) => {
                                if (self.validate.comparePartial(record[columnName], value)) {
                                    if (finalObj && finalObj.length > 0)
                                        finalObj.push(record);
                                    else {
                                        finalObj = [record];
                                    }
                                }
                            })
                        }
                    });
                    fulfill(finalObj);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    filterForMath(filter: Object, comp: string): Promise<[Object]> {
        let self = this;
        return new Promise((fulfill, reject) => {
            let columnName: string;
            let value: number;
            let finalObj: [Object];
            for (let key in filter) {
                columnName = key;
                value = (<any>filter)[key];
            }
            if (typeof value != 'number') {
                reject(
                    {
                        code: 400,
                        body: {
                            "error": value + " is not a number"
                        }
                    });
            }
            self.validate.checkColumnIsValid([columnName], 'integer')
                .then(() => {
                    switch (comp) {
                        case "GT": {
                            // console.log(columnName, value, "In GT");
                            self.dataSet.get("courses").forEach(course => {
                                if (course.length > 0) {
                                    course.forEach((record: any) => {
                                        let recordValue = record[columnName];
                                        if (recordValue > value) {
                                            if (finalObj && finalObj.length > 0)
                                                finalObj.push(record);
                                            else {
                                                finalObj = [record];
                                            }
                                        }
                                    })
                                }
                            });
                            fulfill(finalObj);
                            break;
                        }
                        case "LT": {
                            // console.log(columnName, value, "In LT");
                            self.dataSet.get("courses").forEach(course => {
                                if (course.length > 0) {
                                    course.forEach((record: any) => {
                                        if (record[columnName] < value) {
                                            if (finalObj && finalObj.length > 0)
                                                finalObj.push(record);
                                            else {
                                                finalObj = [record];
                                            }
                                        }
                                    })
                                }
                            });
                            fulfill(finalObj);
                            break;
                        }
                        case "EQ": {
                            // console.log(columnName, value, "In Eq");
                            self.dataSet.get("courses").forEach(course => {
                                if (course.length > 0) {
                                    course.forEach((record: any) => {
                                        if (record[columnName] == value) {
                                            if (finalObj && finalObj.length > 0)
                                                finalObj.push(record);
                                            else {
                                                finalObj = [record];
                                            }
                                        }
                                    })
                                }
                            });
                            fulfill(finalObj);
                            break;
                        }
                    }
                })
                .catch(err => {
                    reject(err);
                })
        });
    }

    runForFilter(query: FILTER): Promise<[courseRecord]> {
        let self = this;
        return new Promise((fulfill, reject) => {
            let filterKeys = Object.keys(query);
            filterKeys.forEach(key => {
                if (key === "IS") {
                    this.filterForString(query[key])
                        .then((records) => {
                            // console.log(records);
                            fulfill(records);
                        })
                        .catch((err) => {
                            if (err.code != 400)
                                reject(
                                    {
                                        code: 400,
                                        body: {
                                            "error": "Invalid IS Filter"
                                        }
                                    });
                            else {
                                reject(err);
                            }
                        });
                }
                else if (key === "GT" || key === "LT" || key === "EQ") {
                    this.filterForMath(query[key], key)
                        .then((recordsFromMath) => {
                            fulfill(recordsFromMath);
                        })
                        .catch((err) => {
                            if (err.code != 400)
                                reject(
                                    {
                                        code: 400,
                                        body: {
                                            "error": "Invalid " + key + " Filter"
                                        }
                                    });
                            else {
                                reject(err);
                            }
                        });
                }
                else if (key === "AND" || key === "OR") {
                    let filters = query[key];
                    let promiseArray: [Promise<[courseRecord]>];
                    let finalObj: any = [];
                    if (filters.length < 2) {
                        reject({
                            code: 400,
                            body: {
                                "error": "Must have at least two filters"
                            }
                        })
                    }
                    filters.forEach(filter => {
                        if (promiseArray && promiseArray.length > 0)
                            promiseArray.push(this.runForFilter(filter));
                        else
                            promiseArray = [this.runForFilter(filter)];
                    });
                    Promise.all(promiseArray)
                        .then(records => {
                            if (key === "OR") {
                                records.forEach((recordArray) => {
                                    if (finalObj.length < 1) {
                                        finalObj = recordArray;
                                    }
                                    else {
                                        finalObj = this.validate.union(finalObj, recordArray);
                                    }
                                })
                            }
                            else if (key === "AND") {
                                for (let i = 0; i < records.length; i++) {
                                    if (finalObj.length < 1) {
                                        finalObj = records[i];
                                    }
                                    else {
                                        finalObj = finalObj.filter(function (n: any) {
                                            return records[i].indexOf(n) != -1;
                                        });
                                    }
                                }
                            }
                            fulfill(finalObj);
                        })
                        .catch(err => {
                            // console.log(err);
                            if (err.code != 400)
                                reject(
                                    {
                                        code: 400,
                                        body: {
                                            "error": "Unexpected"
                                        }
                                    });
                            else {
                                reject(err);
                            }
                        });
                }
                else if (key === "NOT") {
                    this.runForFilter(query[key])
                        .then(records => {
                            // console.log(key);
                            let finalObj: any = [];
                            // console.log("Records length", records.length);
                            self.dataSet.get("courses").forEach((courseArray => {
                                let test = courseArray.filter(function (n: courseRecord) {
                                    return records.indexOf(n) === -1;
                                });
                                finalObj = finalObj.concat(test);
                            }));
                            fulfill(finalObj);
                        })
                        .catch(err => {
                            reject(
                                {
                                    code: 400,
                                    body: {
                                        "error": "Invalid NOT Filter"
                                    }
                                });
                        })
                }
                else {
                    reject(
                        {
                            code: 400,
                            body: {
                                "error": "Filter " + key + " not found"
                            }
                        }
                    );
                }
            });
        })
    }

    runForOptions(records: [courseRecord], options: OPTIONS): Promise<[courseRecord]> {
        let self = this;
        return new Promise((fulfill, reject) => {
            // console.log("BEFORE OPTIONS", records.length);
            let columns = options.COLUMNS;
            let order = options.ORDER;
            let form = options.FORM;
            let finalRecords: any = [];
            records.forEach((record: any) => {
                let recordObj: any = {};
                columns.forEach(columnName => {
                    recordObj[columnName] = record[columnName];
                })
                finalRecords.push(recordObj);
            });
            if (order) {
                finalRecords.sort((a: any, b: any) => {
                    return a[order] > b[order] ? 1 : -1;
                });
            }
            // console.log("BEFORE OPTIONS", finalRecords.length);
            fulfill(finalRecords);
        });
    }

    /* convertToBase64(file: string): Promise<string> {
         return new Promise(function (fulfill, reject) {
             fs.open(file, 'r', function (err, fd) {
                 //console.log(fd);
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
                         fs.writeFile("coursesBase64", result);
                         fulfill(result);
                     });
                 }
                 else {
                     reject(err);
                 }
             });
 
         });
     }
 
     loadData() {
         fs.readFile("courses", 'utf8', (err: any, data: any) => {
             if (!err) {
                 this.dataSet = JSON.parse(data);
             }
         });
     }*/
}