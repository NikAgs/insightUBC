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


/*
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
                    "rooms_furniture"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["rooms_shortname", "rooms_furniture"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname", "rooms_furniture"],
                "APPLY": [{
                    "stringMax": {
                        "COUNT": "rooms_shortname"
                    }
                }]
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
                    "maxSeats": {
                        "MAX": "rooms_seats"
                    }
                }]
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
        let query: QueryRequest = {
            "WHERE": {
                "IS": {
                    "rooms_furniture": "*Tables*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats",
                    "minSeats"
                ],
                "ORDER": "maxSeats",
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": [
                    "rooms_shortname"
                ],
                "APPLY": [
                    {
                        "maxSeats": {
                            "MAX": "rooms_seats"
                        }
                    },
                    {
                        "minSeats": {
                            "MIN": "rooms_seats"
                        }
                    }
                ]
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
        let query: QueryRequest = {
            "WHERE": {
                "IS": {
                    "rooms_furniture": "*Tables*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats",
                    "sumSeats"
                ],
                "ORDER": "sumSeats",
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": [
                    "rooms_shortname"
                ],
                "APPLY": [
                    {
                        "maxSeats": {
                            "MAX": "rooms_seats"
                        }
                    },
                    {
                        "sumSeats": {
                            "SUM": "rooms_seats"
                        }
                    }
                ]
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
                //console.log(res.body);
                expect(res.code).to.equal(200);
            })
            .catch(err => {
                console.log(err);
                expect.fail();
            });
    });

    it("Order key not in columns", function () {
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
                    "rooms_shortname"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["rooms_shortname", "rooms_furniture"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname", "rooms_furniture"],
                "APPLY": []
            }
        }
        return insFac.performQuery(query)
            .then(res => {
                console.log(res.body);
                expect.fail();

            })
            .catch(err => {
                //console.log(err);
                expect(err.code).to.equal(400);
            });
    });

    it("All COLUMNS keys need to be either in GROUP or in APPLY", function () {
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
                    "rooms_shortname"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["rooms_shortname", "rooms_furniture"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": []
            }
        }
        return insFac.performQuery(query)
            .then(res => {
                console.log(res.body);
                expect.fail();
            })
            .catch(err => {
                //console.log(err);
                expect(err.code).to.equal(400);
            });
    });

    it("Column not in Group or Apply", function () {
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
                    "rooms_seats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["rooms_shortname", "rooms_furniture"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname", "rooms_furniture"],
                "APPLY": []
            }
        }
        return insFac.performQuery(query)
            .then(res => {
                console.log(res.body);
                expect.fail();

            })
            .catch(err => {
                //console.log(err);
                expect(err.code).to.equal(400);
            });
    });

    it("Empty WHERE", function () {
        let query: QueryRequest = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_furniture"
                ],
                "ORDER": "rooms_furniture",
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
    */
});
