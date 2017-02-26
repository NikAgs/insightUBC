import { GeoResponse, InsightResponse, QueryRequest, FILTER, OPTIONS, LOGICCOMPARISON, MCOMPARISON, SCOMPARISON, NEGATION, courseRecord } from "./IInsightFacade";

export default class Validate {
    public columnNames: [String] =
    ["courses_dept",
        "courses_id",
        "courses_avg",
        "courses_instructor",
        "courses_title",
        "courses_pass",
        "courses_fail",
        "courses_audit",
        "courses_uuid",
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
        "rooms_href",];

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

    public coursesColumns: [String] = [
        "courses_dept",
        "courses_id",
        "courses_avg",
        "courses_instructor",
        "courses_title",
        "courses_pass",
        "courses_fail",
        "courses_audit",
        "courses_uuid"
    ]

    union(a: any, b: any): Promise<any> {
        return a.concat(b.filter(function (r: any) {
            return a.indexOf(r) < 0;
        }));
    };

    checkForFields(query: QueryRequest) {
        let options = query.OPTIONS;
        let columns = options.COLUMNS;
        let courseQuery = true;
        columns.forEach(column => {
            if (this.coursesColumns.indexOf(column) == -1) {
                courseQuery = false;
            }
        });
        if (courseQuery) {
            return 'courses';
        }
        else {
            columns.forEach(column => {
                if (this.roomsColumns.indexOf(column) == -1) {
                    return false;
                }
            });
            return 'rooms';
        }
    }

    checkForQuery(query: QueryRequest) {
        return new Promise((fulfill, reject) => {
            let filter = query.WHERE;
            let optionsRequest = query.OPTIONS;
            if (filter && optionsRequest) {
                this.checkForOptions(optionsRequest)
                    .then(() => this.checkForWhere(filter))
                    .then(() => this.checkForFields(query))
                    .then((res) => {
                        fulfill(res);
                    })
                    .catch((err) => {
                        reject(err);
                    })
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
                    if (order) {
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
                    else
                        fulfill();
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
                                if (['courses_dept', 'courses_id', 'courses_instructor', 'courses_title',
                                    "rooms_fullname", "rooms_shortname", "rooms_number", "rooms_name", "rooms_address", "rooms_type", "rooms_furniture", "rooms_href"].indexOf(column) == -1) {
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
                                ['courses_avg', 'courses_pass', 'courses_fail', 'courses_audit', 'courses_id'
                                    , "rooms_lat", "rooms_lon", "rooms_seats",
                                ].indexOf(column) == -1) {
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