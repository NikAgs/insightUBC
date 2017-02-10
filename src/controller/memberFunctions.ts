import Log from "../Util";
import * as fs from 'fs';
import { IInsightFacade, InsightResponse, QueryRequest, FILTER, OPTIONS, LOGICCOMPARISON, MCOMPARISON, SCOMPARISON, NEGATION, courseRecord } from "./IInsightFacade";
let JSZip = require("jszip");

export default class Helpers {

    public union(a: any, b: any): Promise<any> {
        return a.concat(b.filter(function (r: any) {
            return a.indexOf(r) < 0;
        }));
    };


    public dataSet: Map<string, any[]> = new Map<any, any>();
    constructor() {
        Log.trace('HelpersImpl::init()');
    }

    public columnNames: [String] =
    ["courses_dept",
        "courses_id",
        "courses_avg",
        "courses_instructor",
        "courses_title",
        "courses_pass",
        "courses_fail",
        "courses_audit",
        "courses_uuid"];



    loadFromFile(file: any): Promise<[Object]> {
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
                        arr.push(course);
                    }
                    // console.log("In file function", arr.length);
                    fulfill(arr);
                }).catch((err: any) => {
                    console.log("Error", err);
                    reject(err);
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
                    zip.folder(id)
                        .forEach(function (relativePath: any, file: any) {
                            promiseArray.push(self.loadFromFile(file));
                        });
                    return promiseArray;
                })
                .then((response: any) => {
                    Promise.all(response)
                        .then(val => {
                            fulfill(val);
                        })
                })
                .catch(function (err: any) {
                    console.log(err);
                    reject(err);
                });
        });
    }

    checkColumnIsValid(columnNames: [string], type: string): Promise<{}> {
        let self = this;
        return new Promise((fulfill, reject) => {
            columnNames.forEach(column => {
                if (self.columnNames.indexOf(column) == -1) {
                    reject({
                        code: 400,
                        body: {
                            "error": "Column " + column + " is invalid"
                        }
                    });
                }
                else {
                    switch (type) {
                        case 'string':
                            {
                                if (['courses_dept', 'courses_id', 'courses_instructor', 'courses_title'].indexOf(column) == -1) {
                                    reject({
                                        code: 400,
                                        body: {
                                            "error": "Column " + column + " is invalid"
                                        }
                                    });
                                }
                                break;
                            }
                        case 'integer': {
                            if (['courses_avg', 'courses_pass', 'courses_fail', 'courses_audit', 'courses_id'].indexOf(column) == -1) {
                                reject({
                                    code: 400,
                                    body: {
                                        "error": "Column " + column + " is invalid"
                                    }
                                });
                            }
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                }
            });
            fulfill();
        });
    }

    checkForOptions(options: OPTIONS) {
        let self = this;
        return new Promise((fulfill, reject) => {
            let columns = options.COLUMNS;
            let order = options.ORDER;
            let form = options.FORM;
            if (form !== "TABLE") {
                reject(
                    {
                        code: 400,
                        body: {
                            "error": "Only TABLE form is supported"
                        }
                    });
            }
            self.checkColumnIsValid(columns, '')
                .then(() => {
                    if (columns.indexOf(order) == -1) {
                        reject(
                            {
                                code: 400,
                                body: {
                                    "error": "You can only sort on column declared in options"
                                }
                            });
                    }
                    else {
                        fulfill();
                    }
                }).catch(err => {
                    reject(
                        {
                            code: 400,
                            body: {
                                "error": "Invalid key in options"
                            }
                        });
                })
        })
    }

    comparePartial(str: string, partial: string): Boolean {
        let clean = partial.replace(/\*/g,'');
        let first = partial.indexOf('*'); 
        let last = partial.lastIndexOf('*'); 
        if (first == -1) {
            return str == partial;
        } else if (first == (partial.length - 1)) {
            return str.startsWith(clean);
        } else if (last == (partial.length - 1)) {
            return str.includes(clean);
        } else {
            return str.endsWith(clean);
        }
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
            self.checkColumnIsValid([columnName], 'string')
                .then(() => {
                    let finalObj: [Object];
                    // console.log(self.dataSet.length);
                    self.dataSet.get("courses").forEach(course => {
                        if (course.length > 0) {
                            course.forEach((record: any) => {
                                if (self.comparePartial(record[columnName], value)) {
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
            let value: string;
            let finalObj: [Object];
            for (let key in filter) {
                columnName = key;
                value = (<any>filter)[key];
            }
            self.checkColumnIsValid([columnName], 'integer')
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
                            reject(
                                {
                                    code: 400,
                                    body: {
                                        "error": "Invalid IS Filter"
                                    }
                                });
                        });
                }
                else if (key === "GT" || key === "LT" || key === "EQ") {
                    this.filterForMath(query[key], key)
                        .then((recordsFromMath) => {
                            fulfill(recordsFromMath);
                        })
                        .catch((err) => {
                            reject(
                                {
                                    code: 400,
                                    body: {
                                        "error": "Invalid " + key + " Filter"
                                    }
                                });
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
                                        finalObj = this.union(finalObj, recordArray);
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
                            reject(
                                {
                                    code: 400,
                                    body: {
                                        "error": "Unexpected"
                                    }
                                });
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
            finalRecords.sort((a: any, b: any) => {
                return a[order] > b[order] ? 1 : -1;
            });
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