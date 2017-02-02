import Log from "../Util";
import * as fs from 'fs';
import { IInsightFacade, InsightResponse, QueryRequest, FILTER, OPTIONS, LOGICCOMPARISON, MCOMPARISON, SCOMPARISON, NEGATION, courseRecord } from "./IInsightFacade";
let JSZip = require("jszip");

export default class Helpers {

    private dataSet: [any];
    constructor() {
        Log.trace('HelpersImpl::init()');
    }

    // convertToBase64(file: string): Promise<string> {
    //     return new Promise(function (fulfill, reject) {
    //         fs.open(file, 'r', function (err, fd) {
    //             //console.log(fd);
    //             if (fd) {
    //                 fs.fstat(fd, function (err, stats) {
    //                     var bufferSize = stats.size,
    //                         chunkSize = 512,
    //                         buffer = new Buffer(bufferSize),
    //                         bytesRead = 0;
    //                     while (bytesRead < bufferSize) {
    //                         if ((bytesRead + chunkSize) > bufferSize) {
    //                             chunkSize = (bufferSize - bytesRead);
    //                         }
    //                         fs.read(fd, buffer, bytesRead, chunkSize, bytesRead);
    //                         bytesRead += chunkSize;
    //                     }
    //                     let result = buffer.toString('base64', 0, bufferSize);
    //                     fs.close(fd);
    //                     fs.writeFile("coursesBase64", result);
    //                     fulfill(result);
    //                 });
    //             }
    //             else {
    //                 reject(err);
    //             }
    //         });

    //     });
    // }

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
                        course.courses_id = entry.id;
                        course.courses_audit = entry.Audit;
                        course.courses_avg = entry.Avg;
                        course.courses_fail = entry.Fail;
                        course.courses_pass = entry.Pass;
                        course.courses_title = entry.Title;
                        course.courses_instructor = entry.Professors;
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
                    Promise.all(promiseArray)
                        .then(val => {
                            self.dataSet = val;
                            fulfill(val);
                        })
                        .catch(err => {
                            console.log(err);
                            reject(err);
                        });
                })
                .catch(function (err: any) {
                    console.log(err);
                    reject(err);
                });

        });
    }

    loadData() {
        fs.readFile("courses", 'utf8', (err: any, data: any) => {
            if (!err) {
                this.dataSet = JSON.parse(data);
            }
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
            let finalObj: [Object];
            console.log(self.dataSet.length);
            self.dataSet.forEach(course => {
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
            switch (comp) {
                case "GT": {
                    console.log(columnName, value, "In GT");
                    self.dataSet.forEach(course => {
                        if (course.length > 0) {
                            course.forEach((record: any) => {
                                if (record[columnName] > value) {
                                    if (finalObj && finalObj.length > 0)
                                        finalObj.push(record);
                                    else {
                                        finalObj = [record];
                                    }
                                }
                            })
                        }
                    });
                    fulfill(finalObj)
                    break;
                }
                case "LT": {
                    console.log(columnName, value, "In LT");
                    self.dataSet.forEach(course => {
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
                    fulfill(finalObj)
                    break;
                }
                case "EQ": {
                    console.log(columnName, value, "In Eq");
                    self.dataSet.forEach(course => {
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
                    fulfill(finalObj)
                    break;
                }
                default: {
                    console.log("err");
                }
            }
        });
    }

    runForFilter(query: FILTER): Promise<[Object]> {
        let self = this;
        if (self.dataSet.length == 0) {
            self.loadData();
        }
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
                            reject(err);
                        });
                }
                else if (key === "GT" || key === "LT" || key === "EQ") {
                    this.filterForMath(query[key], key)
                        .then((records) => {
                            // console.log(records);
                            fulfill(records);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                }
                else if (key === "AND" || key === "OR") {
                    let filters = query[key];
                    let promiseArray: [Promise<[Object]>];
                    let finalObj: any = [];
                    filters.forEach(filter => {
                        if (promiseArray && promiseArray.length > 0)
                            promiseArray.push(this.runForFilter(filter));
                        else
                            promiseArray = [this.runForFilter(filter)];
                    });
                    Promise.all(promiseArray)
                        .then(records => {
                            // Check of key == AND || OR
                            if (key === "OR") {
                                finalObj = records[0].concat(records[1]);
                                console.log(finalObj.length, "OR lenght");
                            }
                            else if (key === "AND") {
                                finalObj = records[0].filter(function (n) {
                                    return records[1].indexOf(n) != -1;
                                });
                            }
                            //Check for records in each element
                            // console.log(key);
                            fulfill(finalObj);
                        })
                        .catch(err => {
                            //throw err
                            console.log(err);
                        });
                }
                else if (key === "NOT") {
                    this.runForFilter(query[key])
                        .then(records => {
                            console.log(key);
                            let finalObj: any = [];
                            console.log("Records length", records.length);
                            self.dataSet.forEach((courseArray => {
                                let test = courseArray.filter(function (n: courseRecord) {
                                    return records.indexOf(n) === -1;
                                });
                                finalObj = finalObj.concat(test);
                            }));
                            //Need to find records that do not exist in the returned array
                            fulfill(finalObj);
                        })
                }
            });

        })
    }

    runForOptions(records: [courseRecord], options: OPTIONS): Promise<[Object]> {
        return new Promise((fulfill, reject) => {
            let columns = options.COLUMNS;
            let order = options.ORDER;
            let finalRecords :any = [];
            records.forEach((record : any)=>{
                let recordObj:any = {};
                columns.forEach(columnName=>{
                    recordObj[columnName] = record[columnName];
                })
                finalRecords.push(recordObj);
            });
            finalRecords.sort((a:any,b:any)=>{
                return a[order]>b[order] ? 1 : -1;
            });
            fulfill(finalRecords);
        })
    }
}