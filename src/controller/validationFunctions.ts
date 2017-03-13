import { GeoResponse, InsightResponse, QueryRequest, FILTER, TRANSFORMATIONS, OPTIONS, LOGICCOMPARISON, MCOMPARISON, SCOMPARISON, NEGATION, courseRecord } from "./IInsightFacade";

export default class Validate {

    public roomsColumns: [string] = [
        "rooms_fullname",
        "rooms_shortname",
        "rooms_number",
        "rooms_name",
        "rooms_address",
        "rooms_lat",
        "rooms_lon",
        "rooms_seats",
        "rooms_type",
        "rooms_furniture",
        "rooms_href"
    ]

    public coursesColumns: [string] = [
        "courses_dept",
        "courses_id",
        "courses_avg",
        "courses_instructor",
        "courses_title",
        "courses_pass",
        "courses_fail",
        "courses_audit",
        "courses_uuid",
        "courses_year"
    ]

    public columnNames: string[] = this.roomsColumns.concat(this.coursesColumns);


    public numericColumns: [string] = ['courses_avg', 'courses_pass', 'courses_fail', 'courses_audit', 'courses_id', 'courses_year'
        , "rooms_lat", "rooms_lon", "rooms_seats"]

    public stringColumns: [string] = ['courses_dept', 'courses_id', 'courses_instructor', 'courses_title',
        "rooms_fullname", "rooms_shortname", "rooms_number", "rooms_name", "rooms_address", "rooms_type", "rooms_furniture", "rooms_href"]


    public numberTransforms: [string] = ['MAX', 'MIN', 'AVG', 'SUM'];

    public acceptableTranforms: string[] = this.numberTransforms.concat(['COUNT']);

    union(a: any, b: any): Promise<any> {
        return a.concat(b.filter(function (r: any) {
            return a.indexOf(r) < 0;
        }));
    };

    findDataset(query: QueryRequest) {
        return new Promise((fulfill, reject) => {
            let options = query.OPTIONS;
            let columns = options.COLUMNS;
            let courseQuery = true;
            if (columns.length > 0) {
                let id = '';
                columns.forEach(column => {
                    let sub = column.substr(0, column.indexOf('_'));
                    if (sub !== '') {
                        id = sub;
                    }
                });
                if (id !== '') {
                    fulfill(id);
                } else {
                    reject({
                        code: 400,
                        body: {
                            "error": "Invalid Columns"
                        }
                    })
                }

            }
            else
                reject({
                    code: 400,
                    body: {
                        "error": "Empty Columns"
                    }
                })
        })

    }

    checkForQuery(query: QueryRequest) {
        return new Promise((fulfill, reject) => {
            let filter = query.WHERE;
            let optionsRequest = query.OPTIONS;
            let transformationRequest = query.TRANSFORMATIONS;
            if (filter && optionsRequest) {
                if (transformationRequest) {
                    this.checkForTransformations(query)
                        .then((applyKeys: [any]) => this.checkForOptions(optionsRequest, applyKeys))
                        .then(() => this.checkForWhere(filter))
                        .then(() => fulfill())
                        .catch((err) => {
                            reject(err);
                        });

                } else {
                    this.checkForOptions(optionsRequest, undefined)
                        .then(() => this.checkForWhere(filter))
                        .then(() => fulfill())
                        .catch((err) => {
                            reject(err);
                        });
                }
            }
            else {
                reject({
                    code: 400,
                    body: {
                        "error": "Invalid QueryRequest"
                    }
                });
            }

        })
    }

    checkForWhere(filter: FILTER) {
        return new Promise((fulfill, reject) => {
            let addedFilters = Object.keys(filter);
            let acceptedFilters = ['AND', 'OR', "NOT", 'EQ', 'GT', 'LT', 'IS']
            addedFilters.forEach((fil) => {
                if (acceptedFilters.indexOf(fil) == -1) {
                    reject({
                        code: 400,
                        body: {
                            "error": "Invalid QueryRequest"
                        }
                    });
                }
            });
            fulfill();
        });
    }

    checkForOptions(options: OPTIONS, applyKeys: [any]) {
        let self = this;
        return new Promise((fulfill, reject) => {
            let columns: string[] = options.COLUMNS;
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
            let filtered = columns;
            if (applyKeys != undefined) {
                filtered = columns.filter(function (col) {
                    return (applyKeys.indexOf(col) == -1);
                });
            }
            self.checkColumnIsValid(filtered, '')
                .then(() => {
                    if (order) {
                        return self.checkForOrder(order, columns);
                    }
                    else
                        fulfill();
                })
                .then(() => fulfill())
                .catch(err => {
                    // console.log(err);
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

    checkForTransformations(query: QueryRequest) {
        let trans = query.TRANSFORMATIONS;
        let cols = query.OPTIONS.COLUMNS
        let self = this;
        return new Promise((fulfill, reject) => {
            let group = trans.GROUP;
            let apply = trans.APPLY;
            self.checkColumnIsValid(group, '')
                .then(() => {
                    if (apply.length == 0) {
                        fulfill();
                    } else {
                        apply.forEach((obj: any) => {
                            let keys = Object.keys(obj);
                            if (keys.length > 1) {
                                reject({
                                    code: 400,
                                    body: {
                                        "error": "Not more than one key in APPLY TOKEN"
                                    }
                                })
                            }
                            else {
                                if (keys[0].includes("_")) {
                                    reject({
                                        code: 400,
                                        body: {
                                            "error": "Cannot include _"
                                        }
                                    })
                                }
                                let actualTransform = obj[keys[0]];
                                let actObjKeys = Object.keys(actualTransform);
                                if (self.acceptableTranforms.indexOf(actObjKeys[0]) == -1) {
                                    reject({
                                        code: 400,
                                        body: {
                                            "error": "Not a permissable transform"
                                        }
                                    })
                                }
                                else {
                                    if (self.numberTransforms.indexOf(actObjKeys[0]) > -1) {
                                        return self.checkColumnIsValid([actualTransform[actObjKeys[0]]], 'integer')
                                            .then(() => {
                                                fulfill(keys);
                                            })
                                            .catch((err) => {
                                                reject(err);
                                            })
                                    }
                                    else {
                                        fulfill(keys);
                                    }
                                }
                            }
                        })
                    }
                })
                .catch((err) => {
                    reject(err);
                })
        })
    }

    checkForOrder(order: any, columns: string[]) {
        return new Promise((fulfill, reject) => {
            if (typeof order === 'object') {
                if (order.dir === 'DOWN' || order.dir === 'UP') {
                    (order.keys).forEach((key: string) => {
                        if (columns.indexOf(key) == -1) {
                            reject(
                                {
                                    code: 400,
                                    body: {
                                        "error": "You can only sort on column declared in options"
                                    }
                                });
                        }
                    });
                    fulfill();
                } else {
                    reject(
                        {
                            code: 400,
                            body: {
                                "error": "You can only sort in order up or down"
                            }
                        });
                }
            }
            else {
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
            }
        })
    }

    //TODO: Modify to work with Apply columns
    checkColumnIsValid(columnNames: string[], type: string): Promise<{}> {
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
                                if (self.stringColumns.indexOf(column) == -1) {
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
                            if (
                                self.numericColumns.indexOf(column) == -1) {
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

    comparePartial(str: string, partial: string): Boolean {
        let clean = partial.replace(/\*/g, '');
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

    index(recordObj: string[], past: string[]) {
        let ind = -1;
        past.forEach((criteria: any) => {
            if (this.sameArrays(recordObj, criteria)) {
                ind = past.indexOf(criteria);
            }
        })
        return ind;
    }

    sameArrays(arr1: any, arr2: any) {
        let bool = true;
        arr1.forEach((data: any) => {
            if (arr2.indexOf(data) == -1) {
                bool = false;
            }
        })
        return bool;
    }

    /*
        getGeoCode(address: string): Promise<GeoResponse> {
            let parsedAddress = encodeURI(address);
            let options = {
                uri: 'http://skaha.cs.ubc.ca:11316/api/v1/team114/' + parsedAddress,
                json: true
            };
            return new Promise((fulfill, reject) => {
                rp(options).
                    then((res: GeoResponse) => {
                        console.log(res);
                        if (res.error) {
                            reject(res.error);
                        }
                        else {
                            fulfill(res);
                        }
                    })
            });
        }
        */

}