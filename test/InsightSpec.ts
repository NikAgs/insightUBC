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

    it("performQuery 424 no dataSet", function () {
        let query: any = {
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
                console.log(res);
                expect.fail();
            })
            .catch(err => {
                //console.log(err);
                expect(err.code).to.equal(424);
            });
    });

    it("Should return error on invalid dataSet", (done) => {
        fs.readFile("coursesBase64", 'utf8', (err: any, data: any) => {
            if (!err) {
                return insFac.addDataset("fail", data)
                    .then(res => {
                        //console.log(res, "204");
                        expect.fail();
                        done();
                    })
                    .catch(err => {
                        //console.error(err);
                        expect(err.code).to.equal(400);
                        done();
                    });
            }
            else {
                console.log(err);
                expect.fail();
                done();
            }
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
                done();
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
                done();
            }
        });
    });

    it("Aurora: performQuery 424.", function () {
        var query: QueryRequest = {
            "WHERE": {
                "NOT":
                {
                    "LT": {
                        "courses_avg": 50
                    }
                }

            },
            "OPTIONS": {
                "COLUMNS": [
                    "stub_id",
                    "daddy_avg",
                    "courses_dept"
                ],
                "ORDER": "courses_dept",
                "FORM": "TABLE"
            }
        };
        return insFac.performQuery(query)
            .then(res => {
                console.log(res);
                expect.fail();
            })
            .catch(err => {
                console.log(err);
                expect(err.code).to.equal(424);
            });
    });

    it("performQuery 424", function () {
        var query: QueryRequest = {
            "WHERE": {
                "NOT":
                {
                    "LT": {
                        "courses_avg": 50
                    }
                }

            },
            "OPTIONS": {
                "COLUMNS": [
                    "yes_dept",
                    "stub_id",
                    "daddy_avg"
                ],
                "ORDER": "yes_dept",
                "FORM": "TABLE"
            }
        };
        return insFac.performQuery(query)
            .then(res => {
                console.log(res);
                expect.fail();
            })
            .catch(err => {
                console.log(err);
                expect(err.code).to.equal(424);
            });
    });

    it("Should be able to filter courses for given year", function () {
        let query: QueryRequest = {
            "WHERE": {
                "EQ": {
                    "courses_year": 2016
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_year"
                ],
                "ORDER": "courses_year",
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

    it("Should not set empty dataSet", () => {
        return insFac.addDataset("courses", "")
            .then(res => {
                expect.fail();
            })
            .catch(err => {
                //console.error(err);
                expect(err.code).to.equal(400);
            });
    });

    it("Should not set invalid dataSet", (done) => {
        fs.readFile("coursesInvalidBase64", 'utf8', (err: any, data: any) => {
            if (!err) {
                return insFac.addDataset("courses", data)
                    .then(res => {
                        //console.log(res, "204");
                        expect.fail();
                        done();
                    })
                    .catch(err => {
                        //console.error(err);
                        expect(err.code).to.equal(400);
                        done();
                    });
            }
            else {
                console.log(err);
                expect.fail();
                done();
            }
        });
    });

    it("performQuery 424 invalid dataSet", function () {
        let query: any = {
            "WHERE": {
                "GT": {
                    "instructor_avg": 98
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "instructor_dept",
                    "instructor_avg"
                ],
                "ORDER": "instructor_avg",
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

    it("Should return code 200", function () {
        let query: QueryRequest = {
            "WHERE": {
                "IS": {
                    "courses_dept": "adhe"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER": "courses_id",
                "FORM": "TABLE"
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
                    "courses_year": 2011
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_avg",
                    "courses_year"
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
                    "courses_avg",
                    "courses_year"
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
                expect.fail();
            })
            .catch(err => {
                // console.log(err);
                expect(err.code).to.equal(400);
            });
    });

    it("Only 1 filter in AND", function () {
        let query: QueryRequest = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "courses_dept": "cpsc"
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
                console.log(res.body);
                expect(res.code).to.equal(200);
            })
            .catch(err => {
                console.log(err);
                expect.fail();
            });
    });

    it("Invalid Query: Multiple filters in WHERE", function () {
        let query: QueryRequest = {
            "WHERE": {
                "IS": {
                    "courses_dept": "cpsc"
                },
                "EQ": {
                    "courses_avg": "90"
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
                expect.fail();
            })
            .catch(err => {
                // console.log(err);
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
                    "course"
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

    it("Missing FORM", function () {
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
                "ORDER": "course_title"
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

    it("Empty COLUMNS", function () {
        let query: any = {
            "WHERE": {
                "IS": {
                    "courses_dept": "cpsc"
                },
                "EQ": {
                    "courses_avg": "90"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
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

    it("Should remove courses dataSet", () => {
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

