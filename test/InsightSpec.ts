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
                return insFac.addDataset("courses", data)
                    .then(res => {
                        console.log(res, "204");
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

    it("Should add to existing dataSet", (done) => {
        fs.readFile("coursesBase64", 'utf8', (err: any, data: any) => {
            if (!err) {
                return insFac.addDataset("courses", data)
                    .then(res => {
                        console.log(res, "201");
                        expect(res).to.deep.equal(
                            {
                                code: 201,
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
            })
            .catch(err => {
                console.log(err);
                expect.fail();
            });
    });

    it("Should return 200 [EQ]", function () {
        let query: QueryRequest = {
            "WHERE": {
                "EQ": {
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
                console.log(res);
            })
            .catch(err => {
                console.log(err);
                expect(err.code).to.equal(400);
            });
    });

    it("Wrong number of filter", function () {
        let query: QueryRequest = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "course_dept": 'cpsc'
                    }
                }]
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
                console.log(err);
                expect(err.code).to.equal(400);
            });
    });

    it("Wrong Options COLUMNS", function () {
        let query: QueryRequest = {
            "WHERE": {

                "NOT":
                {
                    "LT": {
                        "courses_avg": 95
                    }
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "test123",
                    "helllo",
                    "courses_avg"
                ],
                "ORDER": "courses_dept",
                "FORM": "TABLE"
            }
        }
        return insFac.performQuery(query)
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
                expect(err.code).to.equal(400);
            });
    });

    it("Wrong FORM", function () {
        let query: any = {
            "WHERE": {

                "NOT":
                {
                    "LT": {
                        "courses_avg": 95
                    }
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER": "course_title",
                "FORM": "CHAIR"
            }
        }
        return insFac.performQuery(query)
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
                expect(err.code).to.equal(400);
            });
    });

    it("Wrong Sort", function () {
        let query: QueryRequest = {
            "WHERE": {

                "NOT":
                {
                    "LT": {
                        "courses_avg": 95
                    }
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER": "course_title",
                "FORM": "TABLE"
            }
        }
        return insFac.performQuery(query)
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
                expect(err.code).to.equal(400);
            });
        // return null;
    });

    it("Wrong filter", function () {
        let query: any = {
            "WHERE": {
                "HE": {
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
                console.log(res);
            })
            .catch(err => {
                console.log(err);
                expect(err.code).to.equal(400);
            });
    });

    it("Wrong ColumnName", function () {
        let query: QueryRequest = {
            "WHERE": {
                "IS": {
                    "timeout": 'cpsc'
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
                console.log(err);
                expect(err.code).to.equal(400);
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

    it("Should return code 400", function () {
        let query: QueryRequest = {
            "WHERE": {
                "AND": [
                    {
                        "GT": {
                            "HELL": 90
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
                // console.log(res.body);
            })
            .catch(err => {
                console.log(err);
                expect(err.code).to.equal(400);
            });
        // return null;
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
