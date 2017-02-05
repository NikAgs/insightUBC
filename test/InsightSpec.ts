/**
 * Created by rtholmes on 2016-10-31.
 */

import Server from "../src/rest/Server";
import { expect } from 'chai';
import Log from "../src/Util";
import InsightFacade from "../src/controller/InsightFacade";
import { IInsightFacade, InsightResponse, QueryRequest } from "../src/controller/IInsightFacade";
import * as fs from 'fs';


describe("InsightSpec", function () {
    var insFac: InsightFacade = null;

    before(function () {
        Log.test('Before: ' + (<any>this).test.parent.title);
        insFac = new InsightFacade();
    });

    beforeEach(function () {
        Log.test('BeforeTest: ' + (<any>this).currentTest.title);
    });

    after(function () {
        Log.test('After: ' + (<any>this).test.parent.title);
        insFac = null;
    });

    afterEach(function () {
        Log.test('AfterTest: ' + (<any>this).currentTest.title);
    });

    it("Should add new dataSet", () => {
        return fs.readFile("coursesBase64", 'utf8', (err: any, data: any) => {
            if (!err) {
                insFac.addDataset("courses", data)
                    .then(res => {
                        console.log(res, "Res");
                        expect(res).to.deep.equal(
                            {
                                code: 204,
                                body: {}
                            }
                        )
                    })
                    .catch(err => {
                        console.error(err);
                    });
            }
            else {
                console.log(err, "here");
                expect.fail();
            }
        });
    });

    it("Should add to existing dataSet", (done) => {
        return fs.readFile("coursesBase64", 'utf8', (err: any, data: any) => {
            if (!err) {
                insFac.addDataset("courses", data)
                    .then(res => {
                        console.log(res);
                        expect(res).to.deep.equal(
                            {
                                code: 201,
                                body: {}
                            }
                        )
                        done();
                    })
                    .catch(err => {
                        console.error(err);
                        done();
                    });
            }
            else {
                console.log(err);
                expect.fail();
            }
        });
    });

    it("Should return code 200", function () {
        let query: QueryRequest = {
            "WHERE": {
                "GT": {
                    "courses_avg": 98
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        }
        return insFac.performQuery(query)
            .then(res => {
                expect(res.code).to.equal(200);
                console.log(res);
            })
            .catch(err => {
                console.log(err);
                expect.fail();
            });
    });


    it("Should return code 400", function () {
        let query: QueryRequest = {
            "WHERE": {
                "GT": {
                    "test": 98
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        }
        return insFac.performQuery(query)
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                // console.log(err);
                expect(err.code).to.equal(400);
                console.log(err);
            });
    });

    it("Should return code 200", function () {
        let query: QueryRequest = {
            "WHERE": {
                "AND": [
                    {
                        "GT": {
                            "courses_avg": 90
                        }
                    },
                    {
                        "IS": {
                            "courses_dept": "adhe"
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        }
        return insFac.performQuery(query)
            .then(res => {
                expect(res.code).to.equal(200);
                // console.log(res.body);
            })
            .catch(err => {
                console.log(err);
                expect.fail();
            });
        // return null;
    });

    it("Should return code 200", function () {
        let query: QueryRequest = {
            "WHERE": {
                "OR": [
                    {
                        "AND": [
                            {
                                "GT": {
                                    "courses_avg": 90
                                }
                            },
                            {
                                "IS": {
                                    "courses_dept": "adhe"
                                }
                            }
                        ]
                    },
                    {
                        "NOT":
                        {
                            "LT": {
                                "courses_avg": 95
                            }
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER": "courses_dept",
                "FORM": "TABLE"
            }
        }
        return insFac.performQuery(query)
            .then(res => {
                expect(res.code).to.equal(200);
                // console.log(res.body);
            })
            .catch(err => {
                console.log(err);
                expect.fail();
            });
        // return null;
    });

    it("Should removeDataSet", () => {
        return insFac.removeDataset("courses")
            .then(res => {
                expect(res.code).to.equal(204);
            })
            .catch(err => {
                console.log(err);
                expect.fail();
            });
    });

});
