import Log from "../Util";
import * as fs from 'fs';
import {
    IInsightFacade, InsightResponse,
    QueryRequest, FILTER, OPTIONS, LOGICCOMPARISON, MCOMPARISON, SCOMPARISON, NEGATION,
    courseRecord, roomRecord, GeoResponse, TRANSFORMATIONS, APPLYTOKEN
} from "./IInsightFacade";

import * as parse5 from 'parse5';
import Validate from './validationFunctions'
let JSZip = require("jszip");
let http = require('http');

export default class Helpers {

    public validate: Validate = null;
    public dataSet: Map<string, any[]> = new Map<any, any>();
    constructor() {
        this.validate = new Validate();
        // Log.trace('HelpersImpl::init()');
    }

    parseTable(str: string): any {
        let Document = parse5.parse(str) as parse5.AST.Default.Document;
        let serial = "";
        for (let node of Document.childNodes) {
            if (node.nodeName === 'html') {
                let nodeParse: any = node;
                for (let bodyNode of nodeParse.childNodes) {
                    if (bodyNode.nodeName == 'body') {
                        serial = parse5.serialize(bodyNode);
                        serial = serial.substring(serial.indexOf("<table"), serial.indexOf("</table>"));
                    }
                }
            }
        }
        return parse5.parseFragment(serial) as parse5.AST.HtmlParser2.DocumentFragment;
    }

    parseDataForRooms(fileString: any): Promise<[[Object]]> {
        let promiseArray: any = [];
        let self = this;
        return new Promise((fulfill, reject) => {
            JSZip.loadAsync(fileString, { base64: true })
                .then(function (zip: any) {
                    zip.file('index.htm')
                        .async("string")
                        .then((str: string) => {
                            let Table = self.parseTable(str);
                            for (let node of Table.childNodes[0].childNodes) {
                                if (node.tagName == 'tbody') {
                                    //THESE CHILD NODES ARE THE TABLE ROWS
                                    let arr: roomRecord[] = [];
                                    for (let building of node.childNodes) {
                                        if (building.nodeName == 'tr') {
                                            let room: roomRecord = {};
                                            for (let data of building.childNodes) {
                                                if (data.nodeName == 'td') {
                                                    switch (data.attrs[0].value) {
                                                        case 'views-field views-field-field-building-code':
                                                            room.rooms_shortname = data.childNodes[0].value.trim();
                                                            break;

                                                        case 'views-field views-field-title':
                                                            room.rooms_fullname = data.childNodes[1].childNodes[0].value;
                                                            room.rooms_href = data.childNodes[1].attrs[0].value;
                                                            break;

                                                        case 'views-field views-field-field-building-address':
                                                            room.rooms_address = data.childNodes[0].value.trim();
                                                            break;
                                                    }
                                                }
                                            }
                                            promiseArray.push(self.loadRoomInfo(room, zip));
                                        }
                                    }
                                    Promise.all(promiseArray)
                                        .then(val => {
                                            let filter = val.filter(function isEmpty(value) {
                                                return value !== null;
                                            })
                                            //console.log(filter);
                                            fulfill(filter);
                                        });
                                }
                            };
                        });
                })
                .catch(function () {
                    reject({
                        code: 400,
                        body: { "error": "There was a problem while opening index.htm" }
                    });
                });
        });
    }

    loadRoomInfo(room: roomRecord, zip: any): Promise<[roomRecord]> {
        let roomRec = JSON.parse(JSON.stringify(room));
        let self = this;
        let relPath = roomRec.rooms_href.substr(2);
        roomRec.rooms_href = 'http://students.ubc.ca' + roomRec.rooms_href.substr(1);
        return self.loadGeoInfo(roomRec, roomRec.rooms_address)
            .then(val => self.parseRoomInfo(relPath, val, zip));
    }

    parseRoomInfo(relPath: string, roomRec: any, zip: any) {
        let self = this;
        let arr: roomRecord[] = [];
        return new Promise((fulfill, reject) => {
            zip.file(relPath)
                .async("string")
                .then((str: string) => {
                    let table = self.parseTable(str);
                    if (table.childNodes.length != 0) {
                        for (let node of table.childNodes[0].childNodes) {
                            if (node.tagName == 'tbody') {
                                for (let room of node.childNodes) {
                                    let retRoom = JSON.parse(JSON.stringify(roomRec));
                                    if (room.nodeName == 'tr') {
                                        for (let data of room.childNodes) {
                                            if (data.nodeName == 'td') {
                                                switch (data.attrs[0].value) {
                                                    case "views-field views-field-field-room-number":
                                                        retRoom.rooms_number = data.childNodes[1].childNodes[0].value;
                                                        break;

                                                    case "views-field views-field-field-room-capacity":
                                                        retRoom.rooms_seats = parseInt(data.childNodes[0].value.trim());
                                                        break;

                                                    case "views-field views-field-field-room-furniture":
                                                        retRoom.rooms_furniture = data.childNodes[0].value.trim();
                                                        break;

                                                    case "views-field views-field-field-room-type":
                                                        retRoom.rooms_type = data.childNodes[0].value.trim();
                                                        break;
                                                }
                                            }
                                        }
                                        retRoom.rooms_name = retRoom.rooms_shortname + "_" + retRoom.rooms_number;
                                        retRoom.rooms_href = 'http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/' + retRoom.rooms_shortname + "-" + retRoom.rooms_number;
                                        arr.push(retRoom);
                                    }
                                }
                            }
                        }
                        fulfill(arr);
                    } else {
                        fulfill(null);
                    }
                })
                .catch(function () {
                    reject({
                        code: 400,
                        body: { "error": "There was a problem while opening " + relPath }
                    });
                });
        });
    }

    loadGeoInfo(room: roomRecord, address: string): Promise<roomRecord> {
        return new Promise((fulfill, reject) => {
            let parsedAddress = encodeURI(address);
            let uri = 'http://skaha.cs.ubc.ca:11316/api/v1/team114/' + parsedAddress;
            http.get(uri, (res: any) => {
                res.setEncoding('utf8');
                let rawData = '';
                res.on('data', (chunk: any) => rawData += chunk);
                res.on('end', () => {
                    try {
                        let geoRes = JSON.parse(rawData);
                        let roomRec = JSON.parse(JSON.stringify(room));
                        if (!geoRes.error) {
                            roomRec.rooms_lat = geoRes.lat;
                            roomRec.rooms_lon = geoRes.lon;
                        }
                        // console.log(roomRec);
                        fulfill(roomRec);
                    } catch (e) {
                        reject(null);
                    }
                });

            });

        });
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
                        course.courses_year = (entry.Section === 'overall') ? 1900 : entry.Year;
                        if (course != {}) {
                            arr.push(course);
                        }
                    }
                    // console.log("In file function", arr.length);
                    if (arr.length == 0) {
                        fulfill(null);
                    } else {
                        fulfill(arr);
                    }

                }).catch((err: any) => {
                    console.log("Error", err);
                    reject(err);
                });
        })
    }

    // Parses the base64 fileString into an array of courseRecord arrays
    parseCourseData(fileString: string): Promise<[[Object]]> {
        let promiseArray: any = [];
        let self = this;
        return new Promise((fulfill, reject) => {
            JSZip.loadAsync(fileString, { base64: true })
                .then(function (zip: any) {
                    zip.folder("courses")
                        .forEach(function (relativePath: any, file: any) {
                            promiseArray.push(self.loadCoursesFromFile(file));
                        });
                    return promiseArray;
                })
                .then((response: any) => {
                    if (response !== undefined) {
                        Promise.all(response)
                            .then(val => {
                                let filter = val.filter(function isEmpty(value) {
                                    return value !== null;
                                })
                                //console.log(JSON.stringify(filter));
                                fulfill(filter);
                            });
                    }
                })
                .catch(function (err: any) {
                    reject({
                        code: 400,
                        body: { "error": err }
                    });
                });
        });
    }

    filterForString(filter: Object, table: string): Promise<[Object]> {
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
                    self.dataSet.get(table).forEach(record => {
                        if (record.length > 0) {
                            record.forEach((record: any) => {
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

    filterForMath(filter: Object, comp: string, table: string): Promise<[Object]> {
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
                            self.dataSet.get(table).forEach(record => {
                                if (record.length > 0) {
                                    record.forEach((record: any) => {
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
                            self.dataSet.get(table).forEach(record => {
                                if (record.length > 0) {
                                    record.forEach((record: any) => {
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
                            self.dataSet.get(table).forEach(record => {
                                if (record.length > 0) {
                                    record.forEach((record: any) => {
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

    runForFilter(query: FILTER, id: string): Promise<[Object]> {
        let self = this;
        return new Promise((fulfill, reject) => {
            let filterKeys = Object.keys(query);
            if (filterKeys.length < 1) {
                let finalRecords: any = [];
                self.dataSet.get(id).forEach((dataType: any) => {
                    dataType.forEach((record: any) => {
                        finalRecords.push(record);
                    })
                })
                fulfill(finalRecords);
            }
            filterKeys.forEach(key => {
                if (key === "IS") {
                    this.filterForString(query[key], id)
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
                    this.filterForMath(query[key], key, id)
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
                    let promiseArray: [Promise<[Object]>];
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
                            promiseArray.push(this.runForFilter(filter, id));
                        else
                            promiseArray = [this.runForFilter(filter, id)];
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
                    this.runForFilter(query[key], id)
                        .then(records => {
                            // console.log(key);
                            let finalObj: any = [];
                            // console.log("Records length", records.length);
                            self.dataSet.get(id).forEach((recordArray => {
                                let test = recordArray.filter(function (n: Object) {
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

    groupBy(grouping: any[], records: [Object]): Promise<Object> {
        return new Promise((fulfill, reject) => {
            if (records.length != 0) {
                let recordArrayObj: any = {};
                records.forEach((record: any) => {
                    let key: string = "";
                    grouping.forEach((group: string) => { return key += record[group] });
                    if (recordArrayObj[key]) {
                        recordArrayObj[key].push(record);
                    }
                    else {
                        recordArrayObj[key] = [];
                        recordArrayObj[key].push(record);
                    }
                });
                fulfill(recordArrayObj);
            }
            else {
                reject({
                    code: 400,
                    body: {
                        "error": "No records found"
                    }
                });
            }
        })
    }

    applyTransform(records: [Object], transform: string, columnOn: string, finalName: string): Promise<Object> {
        return new Promise((fulfill, reject) => {
            let recordToKeep: any;
            switch (transform) {
                case 'MAX': {
                    let max = 0;
                    records.forEach((rec: any) => {
                        if (rec[columnOn] > max) {
                            recordToKeep = rec;
                            max = rec[columnOn];
                        }
                    });
                    if (finalName) {
                        recordToKeep[finalName] = recordToKeep[columnOn];
                    }
                    break;
                }
                case 'MIN': {
                    let min = Number.MAX_SAFE_INTEGER;
                    records.forEach((rec: any) => {
                        if (rec[columnOn] < min) {
                            recordToKeep = rec;
                            min = rec[columnOn];
                        }
                    });
                    if (finalName) {
                        recordToKeep[finalName] = recordToKeep[columnOn];
                    }
                    break;
                }
                case 'COUNT': {
                    recordToKeep = records[0];
                    recordToKeep.COUNT = records.length;
                    // console.log(records.length, records);
                    if (finalName) {
                        recordToKeep[finalName] = recordToKeep.COUNT;
                    }
                    break;
                }
                case 'SUM': {
                    let runningTotal = 0;
                    records.forEach((rec: any) => {
                        runningTotal += rec[columnOn];
                    });
                    recordToKeep = records[0];
                    recordToKeep.SUM = runningTotal;
                    if (finalName) {
                        recordToKeep[finalName] = recordToKeep.SUM;
                    }
                    break;
                }
                case 'AVG': {
                    let runningTotal = 0;
                    records.forEach((rec: any) => {
                        let x: number = rec[columnOn] * 10;
                        x = Number(x.toFixed(0));
                        runningTotal += x;
                    });
                    let avg = runningTotal / records.length;
                    avg = avg / 10;
                    let res = Number(avg.toFixed(2))
                    recordToKeep = records[0];
                    recordToKeep.AVG = res;
                    if (finalName) {
                        recordToKeep[finalName] = recordToKeep.AVG;
                    }
                    break;
                }
                default: {
                    recordToKeep = records[0];
                }
            }
            fulfill(recordToKeep);
        })
    }

    runForAllTransforms(records: [Object], apply: Object[]): Promise<Object> {
        let self = this;
        return new Promise((fulfill, reject) => {
            let promiseArray: Promise<Object>[] = [];
            if (apply.length > 0) {
                try {
                    apply.forEach(trans => {
                        let obj: any = apply.length > 0 ? trans : null;
                        let keys = obj ? Object.keys(trans) : null;
                        let actualTransformObj = obj ? obj[keys[0]] : null;
                        let actObjKeys = actualTransformObj ? Object.keys(actualTransformObj) : null;
                        let val = actualTransformObj ? actualTransformObj[actObjKeys[0]] : null;
                        let transform = actObjKeys ? actObjKeys[0] : null;
                        let name = keys ? keys[0] : null;
                        return promiseArray.push(self.applyTransform(records, transform, val, name));
                    })
                } catch (e) {
                    console.log(e);
                    reject({
                        code: 400,
                        body: {
                            "error": e
                        }
                    });
                }
                Promise.all(promiseArray)
                    .then(res => {
                        let recordToSend: any = res[0];
                        res.forEach((rec: any) => {
                            apply.forEach(trans => {
                                let obj: any = apply.length > 0 ? trans : null;
                                let keys = obj ? Object.keys(trans) : null;
                                let name = keys ? keys[0] : null;
                                if (rec[name]) {
                                    recordToSend[name] = rec[name];
                                }
                            });
                        });
                        fulfill(recordToSend);
                    })
            }
            else {
                return self.applyTransform(records, null, null, null)
                    .then(res => {
                        fulfill(res);
                    });
            }
        })

    }

    transform(records: [Object], transformations: TRANSFORMATIONS): Promise<[Object]> {
        let self = this;
        return new Promise((fulfill, reject) => {
            if (transformations) {
                let group = transformations.GROUP;
                let apply = transformations.APPLY;
                let finalRecords: Object[] = [];
                // console.log(transformations);
                return self.groupBy(group, records)
                    .then((res: any) => {
                        let resKeys: string[] = Object.keys(res);
                        let promiseArray: Promise<Object>[] = [];
                        resKeys.forEach((key: string) => {
                            promiseArray.push(self.runForAllTransforms(res[key], apply))
                        });
                        Promise.all(promiseArray)
                            .then(res => {
                                fulfill(res);
                            })
                    })
            }
            else {
                fulfill(records);
            }
        });
    }

    runForOptions(records: any[], options: OPTIONS): Promise<[Object]> {
        let self = this;
        return new Promise((fulfill, reject) => {
            // console.log("BEFORE OPTIONS", records.length);
            let columns = options.COLUMNS;
            let order = options.ORDER;
            let form = options.FORM;
            let finalRecords: any = [];
            for (let i = 0; i < records.length; i++) {
                let recordObj: any = {};
                columns.forEach((column: any) => {
                    recordObj[column] = records[i][column];
                });
                finalRecords.push(recordObj);
            }
            if (typeof order === 'object') {
                var fields = order.keys;
                finalRecords.sort(
                    (a: any, b: any) =>
                        fields.map((o: any) => {
                            return a[o] > b[o] ? 1 : a[o] < b[o] ? -1 : 0;
                        })
                            .reduce((p: any, n: any) => p ? p : n, 0));
                if (order.dir.includes("DOWN")) {
                    finalRecords.reverse();
                }
            }
            else if (typeof order === 'string') {
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