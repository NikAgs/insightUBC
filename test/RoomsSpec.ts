/**
 * Created by rtholmes on 2016-10-31.
 */

import Server from "../src/rest/Server";
import { expect } from 'chai';
import Log from "../src/Util";
import InsightFacade from "../src/controller/InsightFacade";
import { IInsightFacade, InsightResponse, QueryRequest } from "../src/controller/IInsightFacade";
import * as fs from 'fs';

describe("RoomsSpec", function () {
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

    it("Should add new rooms dataSet", (done) => {
        fs.readFile("roomsBase64", 'utf8', (err: any, data: any) => {
            if (!err) {
                return insFac.addDataset("rooms", data)
                    .then(res => {
                        //console.log(res, "204");
                        expect(res).to.deep.equal(
                            {
                                code: 204,
                                body: {}
                            }
                        );
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
                "IS": {
                    "rooms_name": "DMP_*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }
        return insFac.performQuery(query)
            .then(res => {
                // console.log(res.body);
                expect(res.code).to.equal(200);
            })
            .catch(err => {
                console.log(err);
                expect.fail();
            });
    });

    it("Should return code 200", function () {
        let query: QueryRequest = {
            "WHERE": {
                "IS": {
                    "rooms_address": "*Agrono*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address", "rooms_name"
                ],
                "FORM": "TABLE"
            }
        }
        return insFac.performQuery(query)
            .then(res => {
                // console.log(res.body);
                expect(res.code).to.equal(200);
            })
            .catch(err => {
                console.log(err);
                expect.fail();
            });
    });

    it("Should be able to find rooms with more than a certain number of seats.", function () {
        let query: QueryRequest = {
            "WHERE": {
                "GT": {
                    "rooms_seats": 200
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address", "rooms_name", "rooms_seats", "rooms_furniture"
                ],
                "FORM": "TABLE"
            }
        }
        return insFac.performQuery(query)
            .then(res => {
                // console.log(res.body);
                expect(res.code).to.equal(200);
            })
            .catch(err => {
                console.log(err);
                expect.fail();
            });
    });


    it("Should be able to find rooms with more than a certain number of seats.", function () {
        let query: QueryRequest = {
            "WHERE": {
                "GT": {
                    "rooms_seats": 200
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address", "rooms_name", "rooms_seats", "rooms_furniture"
                ],
                "FORM": "TABLE"
            }
        }
        return insFac.performQuery(query)
            .then(res => {
                // console.log(res.body);
                expect(res.code).to.equal(200);
            })
            .catch(err => {
                console.log(err);
                expect.fail();
            });
    });

    it("Should removeDataSet", () => {
        return insFac.removeDataset("rooms")
            .then(res => {
                expect(res.code).to.equal(204);
            })
            .catch(err => {
                console.log(err);
                expect.fail();
            });
    });
});
