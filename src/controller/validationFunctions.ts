import { IInsightFacade, InsightResponse, QueryRequest, FILTER, OPTIONS, LOGICCOMPARISON, MCOMPARISON, SCOMPARISON, NEGATION, courseRecord } from "./IInsightFacade";

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
        "courses_uuid"];

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

}