/**
 * This is the main programmatic entry point for the project.
 */
import { IInsightFacade, InsightResponse, FILTER, LOGICCOMPARISON, MCOMPARISON, SCOMPARISON, NEGATION } from "./IInsightFacade";
import Log from "../Util";
import * as fs from "fs";
import InsightFacade from "./InsightFacade";

import _ = require('lodash');
var geodist = require('geodist');


export default class RestFacade {

    private insFac: InsightFacade = null;

    constructor(insFac: InsightFacade) {
        this.insFac = insFac;
    }


    filterByDistance(query: any, buildingName: string, distance: number): Promise<InsightResponse> {
        return new Promise((fulfill, reject) => {
            let records = query.body.result;
            let givenRec = _.find(records, (o: any) => {
                return o["rooms_shortname"] == buildingName || o["rooms_fullname"] == buildingName;
            });
            // console.log(givenRec, buildingName, distance);
            let latLon: any = {};
            if (givenRec) {
                latLon.lat = givenRec.rooms_lat;
                latLon.lon = givenRec.rooms_lon;
                // console.log(givenRec, maxDistance);
                let finalRecords: Object[] = [];
                records.forEach((rec: any) => {
                    let tempObj = _.pick(rec, ['rooms_lat', 'rooms_lon']);
                    if (geodist(latLon, tempObj, { unit: "meters", limit: distance })) {
                        finalRecords.push(_.omit(rec, ['rooms_lat', 'rooms_lon']));
                    }
                });
                query.body.result = finalRecords;
                fulfill(query);
            }
            else {
                reject({
                    code: 400,
                    body: { "error": "Cannot find the given building" }
                });
            }
        });
    }

    scheduleCourses(query: any) {
        let courseData: any = [];
        let self = this;
        return new Promise((fulfill, reject) => {
            let courseQuery = {
                "WHERE": {
                    "AND": [
                        {
                            "IS": {
                                "courses_dept": query.department
                            }
                        }, {
                            "EQ": {
                                "courses_year": 2014
                            }
                        }]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_id",
                        "courses_pass",
                        "courses_fail"
                    ],
                    "FORM": "TABLE"
                }
            }
            self.insFac.performQuery(courseQuery)
                .then((res: any) => {
                    let records = res.body.result;
                    let sectionGroups = _.groupBy(records, function (value: any) {
                        return value.courses_dept + '#' + value.courses_id;
                    });
                    _.forEach(sectionGroups, (values: any) => {
                        let tempObj: any = {};
                        // console.log(values);
                        tempObj.courseId = values[0].courses_dept + values[0].courses_id;
                        tempObj.sections = Math.ceil(values.length / 3);
                        let maxRec = _.maxBy(values, (o: any) => {
                            return o.courses_pass + o.courses_fail;
                        });
                        tempObj.size = maxRec.courses_pass + maxRec.courses_fail;
                        tempObj.courses_dept = values[0].courses_dept;
                        tempObj.courses_id = values[0].courses_id;
                        courseData.push(tempObj);
                    })
                    // FINAL COURSE DATA THAT IS REQUIRED
                    return;
                })
                .then(() => {
                    let buildingName = query.buildingName;
                    if (query.distance) {
                        let roomsQuery = {
                            "WHERE": {
                            },
                            "OPTIONS": {
                                "COLUMNS": [
                                    "rooms_seats",
                                    "rooms_lat",
                                    "rooms_lon",
                                    "rooms_fullname",
                                    "rooms_shortname",
                                    "rooms_number",
                                    "rooms_name"
                                ],
                                "FORM": "TABLE"
                            }
                        }
                        return self.insFac.performQuery(roomsQuery)
                            .then(res => self.filterByDistance(res, buildingName, query.distance))
                    }
                    else {
                        let roomsQuery = {
                            "WHERE": {
                                "IS": query.buildingQuery
                            },
                            "OPTIONS": {
                                "COLUMNS": [
                                    "rooms_seats",
                                    "rooms_lat",
                                    "rooms_lon",
                                    "rooms_fullname",
                                    "rooms_shortname",
                                    "rooms_number",
                                    "rooms_name"
                                ],
                                "FORM": "TABLE"
                            }
                        }
                        return self.insFac.performQuery(roomsQuery)
                    }
                })
                .then((res: any) => {
                    // console.log(res.body.result, courseData);
                    let roomsData = res.body.result;
                    
                    fulfill(res);
                })
                .catch(err => {
                    console.log(err);
                    reject(err);
                })
        })
    }
}