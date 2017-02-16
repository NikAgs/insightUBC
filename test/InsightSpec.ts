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

    it("performQuery 424", function () {
        let query: any = {
            "WHERE": {
                "HE": {
                    "class_avg": 98
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "class_dept",
                    "class_avg"
                ],
                "ORDER": "class_avg",
                "FORM": "TABLE"
            }
        }
        return insFac.performQuery(query)
            .then(res => {
                console.log(res);
                expect.fail();
            })
            .catch(err => {
                //console.log(err);
                expect(err.code).to.equal(424);
            });
    });

    it("Should add new dataSet", (done) => {
        fs.readFile("coursesBase64", 'utf8', (err: any, data: any) => {
            if (!err) {
                return insFac.addDataset("courses", data)
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

    it("Should add to existing dataSet", (done) => {
        fs.readFile("coursesBase64", 'utf8', (err: any, data: any) => {
            if (!err) {
                return insFac.addDataset("courses", data)
                    .then(res => {
                        //console.log(res, "201");
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
                //console.log(res);
                expect(res.code).to.equal(200);
            })
            .catch(err => {
                console.log(err);
                expect.fail();
            });
    });

    it("Missing WHERE", function () {
        let query: any = {
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
                console.log("Here", res);
                expect.fail();
            })
            .catch(err => {
                console.log("Here", err);
                expect(err.code).to.equal(400);
            });
    });

    it("Wrong number of filters", function () {
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
                expect.fail();
            })
            .catch(err => {
                //console.log(err);
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
                expect.fail();
            })
            .catch(err => {
                //console.log(err);
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
                expect.fail();
            })
            .catch(err => {
                //console.log(err);
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
                expect.fail();
            })
            .catch(err => {
                //console.log(err);
                expect(err.code).to.equal(400);
            });
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
                expect.fail();
            })
            .catch(err => {
                //console.log(err);
                expect(err.code).to.equal(400);
            });
    });

    it("Wrong ColumnName", function () {
        let query: QueryRequest = {
            "WHERE": {
                "IS": {
                    "timeout": "cpsc"
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
                expect.fail();
            })
            .catch(err => {
                //console.log(err);
                expect(err.code).to.equal(400);
            });
    });

    it("GT with string", function () {
        let query: QueryRequest = {
            "WHERE": {
                "GT": {
                    "courses_avg": "98"
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
                expect.fail();
            })
            .catch(err => {
                // console.log(err);
                expect(err.code).to.equal(400);
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
                console.log(res);
                expect.fail();
            })
            .catch(err => {
                //console.log(err);
                expect(err.code).to.equal(400);
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
                //console.log(res.body);
                expect(res.code).to.equal(200);
            })
            .catch(err => {
                console.log(err);
                expect.fail();
            });
    });

    it("Should return for partial name", function () {
        let query: QueryRequest = {
            "WHERE": {
                "AND": [
                    {
                        "GT": {
                            "courses_avg": 95
                        }
                    },
                    {
                        "IS": {
                            "courses_dept": "*sc"
                        }
                    }
                ]
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
                // console.log(res.body);
                expect(res.code).to.equal(200);
            })
            .catch(err => {
                console.log(err);
                expect.fail();
            });
    });

    it("Should return for partial name #2", function () {
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
                            "courses_dept": "an*"
                        }
                    }
                ]
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
                // console.log(res.body);
                expect(res.code).to.equal(200);
            })
            .catch(err => {
                console.log(err);
                expect.fail();
            });
    });

    it("Should return for partial name #3", function () {
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
                            "courses_dept": "*dh*"
                        }
                    }
                ]
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
                // console.log(res.body);
                expect(res.code).to.equal(200);
            })
            .catch(err => {
                console.log(err);
                expect.fail();
            });
    });

    it("Should be able to find all instructurs in a dept with a partial name.", function () {
        let query: QueryRequest = {
            "WHERE": {
                "AND": [
                    {
                        "IS": {
                            "courses_instructor": "*holmes*"
                        }
                    },
                    {
                        "IS": {
                            "courses_dept": "cpsc"
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_instructor",
                    "courses_avg"
                ],
                "ORDER": "courses_instructor",
                "FORM": "TABLE"
            }
        }
        return insFac.performQuery(query)
            .then(res => {
                let answer = {
                    "render": "TABLE",
                    "result": [
                        { "courses_instructor": "holmes, reid", "courses_avg": 81.17 },
                        { "courses_instructor": "holmes, reid", "courses_avg": 79 },
                        { "courses_instructor": "holmes, reid", "courses_avg": 89 }
                    ]
                }
                let response = res.body;
                expect(response).to.deep.equal(answer);
            })
            .catch(err => {
                console.log(err);
                expect.fail();
            });
    });

    it("Should be able to find all sections in a dept not taught by a specific person.", function () {
        let query: QueryRequest = {
            "WHERE": {
                "AND": [
                    {
                        "NOT": {
                            "IS": {
                                "courses_instructor": "*holmes*"
                            }
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
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        }
        return insFac.performQuery(query)
            .then((res: any) => {
                // console.log(res.body);
                let answer = {
                    "render": "TABLE",
                    "result": [
                        {
                            "courses_id": "327",
                            "courses_avg": 82.96
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 85.64
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 86.65
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 85.6
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 86.16
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 75.71
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 79.88
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 77.74
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 83.57
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 86.59
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 85.12
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 78.41
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 79.47
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 81.45
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 76.59
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 88.23
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 80.76
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 84.14
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 79.19
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 81.67
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 84.3
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 83.41
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 81.45
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 85.04
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 83.47
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 88.53
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 88.53
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 72.55
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 83.33
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 89.28
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 83.91
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 89.51
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 78
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 86.2
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 86.17
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 84.52
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 84
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 84.9
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 87.5
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 83.66
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 76.54
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 79.04
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 80.86
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 83.71
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 81.89
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 81.62
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 83.83
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 82.73
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 84.87
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 83.07
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 83.9
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 86.59
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 86.59
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 85.81
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 85.81
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 78.21
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 76.63
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 77.42
                        },
                        {
                            "courses_id": "327",
                            "courses_avg": 87.15
                        },
                        {
                            "courses_id": "328",
                            "courses_avg": 79.33
                        },
                        {
                            "courses_id": "328",
                            "courses_avg": 79.33
                        },
                        {
                            "courses_id": "328",
                            "courses_avg": 78.91
                        },
                        {
                            "courses_id": "328",
                            "courses_avg": 78.91
                        },
                        {
                            "courses_id": "328",
                            "courses_avg": 78.09
                        },
                        {
                            "courses_id": "328",
                            "courses_avg": 87.14
                        },
                        {
                            "courses_id": "328",
                            "courses_avg": 82.82
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 85.86
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 80.35
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 81.71
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 81.75
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 86.04
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 85.39
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 85.7
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 93.33
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 86.24
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 90.02
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 81.71
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 72.29
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 77
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 78.24
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 86.64
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 89.3
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 77.77
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 86.59
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 83.34
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 86.44
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 83.45
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 84.78
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 80.44
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 67.5
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 77.59
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 75.91
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 75.67
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 89
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 89
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 79.84
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 96.11
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 92.54
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 83.48
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 85.03
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 90.82
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 87.71
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 84.57
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 82.78
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 80.33
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 82.49
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 85.58
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 82.84
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 86.19
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 84.83
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 82.76
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 70.56
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 73.79
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 79.83
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 77.5
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 81.85
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 86
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 83.69
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 89.38
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 89.38
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 86.26
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 86.26
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 79
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 67.95
                        },
                        {
                            "courses_id": "329",
                            "courses_avg": 72.93
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 82.25
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 83
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 82
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 88
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 83.16
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 85.72
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 85.41
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 83.87
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 91.29
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 86.72
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 86.5
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 88.56
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 87.47
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 83.68
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 78.85
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 80.4
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 87.68
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 79.5
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 87.17
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 82.81
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 91.48
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 89.55
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 90.85
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 86.13
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 83.29
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 83.74
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 85.06
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 85
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 86.78
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 85.04
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 85.78
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 85.78
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 84.42
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 85.14
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 84.71
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 82.79
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 78.94
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 88.03
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 83.96
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 86.22
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 90.17
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 88.27
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 77
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 77.07
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 77.04
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 90.5
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 89.74
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 83.64
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 88.03
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 87.37
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 91.33
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 91.33
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 82.25
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 81.4
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 85.8
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 85.8
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 82
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 83.45
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 90.72
                        },
                        {
                            "courses_id": "330",
                            "courses_avg": 85.2
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 85.2
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 81.2
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 82.9
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 86.33
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 83.05
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 84.07
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 72.96
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 78.2
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 75.43
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 77.58
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 77.58
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 76.22
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 78.77
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 68.89
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 76.17
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 75.68
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 86.45
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 89.08
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 87.88
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 80.25
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 78.57
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 78
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 78.9
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 84.45
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 85.2
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 76.74
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 68.29
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 76.05
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 76.35
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 72.63
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 90.16
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 77.54
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 85.29
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 80.55
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 83.02
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 90.18
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 88.91
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 89.55
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 84.04
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 69.96
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 77.28
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 78.81
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 78.81
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 88.25
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 88.25
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 70.53
                        },
                        {
                            "courses_id": "412",
                            "courses_avg": 70.53
                        }
                    ]
                }
                let response = res.body;
                // expect(response).to.deep.equal(answer);
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
                "OR": [
                    {
                        "AND": [
                            {
                                "GT": {
                                    "courses_avg": 80
                                }
                            },
                            {
                                "LT": {
                                    "courses_avg": 90.6
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
                                "courses_avg": 99
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
                //console.log(res.body);
                expect(res.code).to.equal(200);
            })
            .catch(err => {
                console.log(err);
                expect.fail();
            });
    });

    it("Should return code 200", function () {
        let query: QueryRequest =
            {
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
                            "EQ": {
                                "courses_avg": 95
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_audit",
                        "courses_fail",
                        "courses_pass",
                        "courses_title",
                        "courses_instructor",
                        "courses_uuid"
                    ],
                    "ORDER": "courses_dept",
                    "FORM": "TABLE"
                }
            }
        return insFac.performQuery(query)
            .then(res => {
                //console.log(res);
                expect(res.code).to.equal(200);
            })
            .catch(err => {
                console.log(err);
                expect.fail();
            });
    });

    it("Should return code 200 without ORDER", function () {
        let query: QueryRequest =
            {
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
                            "EQ": {
                                "courses_avg": 95
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_audit",
                        "courses_fail",
                    ],
                    "FORM": "TABLE"
                }
            }
        return insFac.performQuery(query)
            .then(res => {
                //console.log(res);
                expect(res.code).to.equal(200);
            })
            .catch(err => {
                console.log(err);
                expect.fail();
            });
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

