/**
 * Created by rtholmes on 2016-10-31.
 */

import Server from "../src/rest/Server";
import { expect } from 'chai';
import Log from "../src/Util";
import InsightFacade from "../src/controller/InsightFacade";
import { IInsightFacade, InsightResponse, QueryRequest } from "../src/controller/IInsightFacade";
import * as fs from 'fs';

describe("QuerySpec", function () {
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

    xit("Should return code 200", function () {
        let query: QueryRequest = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 300
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "string": {
                        "MAX": "rooms_seats"
                    }
                }]
            }
        }
        return insFac.performQuery(query)
            .then(res => {
                //console.log(JSON.stringify(res));
                expect(res.code).to.equal(200);
            })
            .catch(err => {
                console.log(err);
                expect.fail();
            });
    });

    xit("Should return code 200", function () {
        let query: QueryRequest = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_furniture"
                ],
                "ORDER": "rooms_furniture",
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_furniture"],
                "APPLY": []
            }
        }
        return insFac.performQuery(query)
            .then(res => {
                //console.log(JSON.stringify(res));
                expect(res.code).to.equal(200);
            })
            .catch(err => {
                console.log(err);
                expect.fail();
            });
    });


});
