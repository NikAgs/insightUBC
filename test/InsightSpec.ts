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

    it("Should add new dataSet", (done) => {
        fs.readFile("coursesBase64", 'utf8', (err: any, data: any) => {
            if (!err) {
                insFac.addDataset("courses", data)
                    .then(res => {
                        console.log(res);
                        expect(res).to.deep.equal(
                            {
                                code: 204,
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

    it("Should add to existing dataSet", (done) => {
        fs.readFile("coursesBase64", 'utf8', (err: any, data: any) => {
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

    it("Should return code 200", function (done) {
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
        insFac.performQuery(query)
            .then(res => {
                expect(res.code).to.equal(200);
                console.log(res.body);
                done();
            })
            .catch(err=>{
                console.log(err);
                expect.fail();
            });
    });


    it("Should return code 400", function (done) {
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
        insFac.performQuery(query)
            .then(res => {
                console.log(res);
                done();
            })
            .catch(err=>{
                console.log(err);
                expect(err.code).to.equal(400);
                done();
            });
    });

    it("Should return code 200", function (done) {
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
        insFac.performQuery(query)
            .then(res => {
                expect(res.code).to.equal(200);
                // console.log(res.body);
                done();
            })
            .catch(err=>{
                console.log(err);
                expect.fail();
            });
        // return null;
    });

    it("Should return code 200", function (done) {
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
        insFac.performQuery(query)
            .then(res => {
                expect(res.code).to.equal(200);
                // console.log(res.body);
                done();
            })
            .catch(err=>{
                console.log(err);
                expect.fail();
            });
        // return null;
    });

    it("Should removeDataSet", (done) => {
        insFac.removeDataset("courses")
            .then(res => {
                expect(res.code).to.equal(204);
                done();
            })
            .catch(err=>{
                console.log(err);
                expect.fail();
            });
    });
});
