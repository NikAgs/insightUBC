/**
 * This is the main programmatic entry point for the project.
 */
import { IInsightFacade, InsightResponse, FILTER, LOGICCOMPARISON, MCOMPARISON, SCOMPARISON, NEGATION } from "./IInsightFacade";
import Log from "../Util";
import * as fs from "fs";
import InsightFacade from "./InsightFacade";

import _ = require('lodash');
let geodist = require('geodist');
let schedule = require('schedulejs');
let later = require('later');

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
            if (distance > 0) {
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
            }
            else {
                fulfill(query);
            }

        });
    }

    findSchedule(roomsResponse: any, courses: any) {
        let self = this;
        let rooms = roomsResponse.body.result;
        return new Promise((fulfill, reject) => {
            //create resources
            let resourcesData: any = [];
            _.forEach(rooms, (room) => {
                let tempObj: any = {};
                tempObj.id = room.rooms_name;
                // tempObj.isNotReservable = false;
                tempObj.available = later.parse.text('every weekday after 8am');
                resourcesData.push(tempObj);
            })

            let tasksData: any = [];
            let count = 0;
            courses.sort((a: any, b: any) => {
                return a["size"] > b["size"] ? 1 : -1;
            });
            _.forEach(courses, (course) => {
                _.times(course.sections, (i) => {
                    let availableRooms: {}[] = _.map(_.filter(rooms, (o: any) => {
                        return o.rooms_seats > course.size
                    }), "rooms_name");
                    // console.log(availableRooms);
                    let tempObj = self.makeTaskObj(count, course, i, availableRooms);
                    if (tempObj) {
                        tasksData.push(tempObj);
                    }
                    count++;
                })
            })
            // console.log(resourcesData, tasksData);
            var start = new Date(2017, 3, 6);
            schedule.date.localTime();
            let finalSchedule = schedule.create(tasksData, resourcesData, later.parse.text('every weekday'), new Date());
            // console.log(finalSchedule);
            let returnObj: any = {};
            returnObj.schedule = finalSchedule;
            returnObj.rooms = rooms;
            returnObj.courses = courses;
            fulfill(returnObj);
        })
    }

    makeTaskObj(count: number, course: any, iterator: number, availableRooms: {}[]) {
        let tempObj: any = {};
        if (availableRooms.length > 0) {
            if (count % 5 < 3) {
                tempObj.id = course.courseId + "_" + (iterator + 1);
                tempObj.duration = 60;
                tempObj.minLength = 60;
                tempObj.resources = [availableRooms];
                tempObj.available = later.parse.text('on Monday');
                tempObj.size = course.size;
            } else {
                tempObj.id = course.courseId + "_" + iterator;
                tempObj.duration = 90;
                tempObj.minLength = 90;
                tempObj.resources = [availableRooms];
                tempObj.available = later.parse.text('on Tuesday');
                tempObj.size = course.size;
            }
            return tempObj;
        }
        return null;
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
                    fulfill(courseData);
                })
                .catch(err => {
                    console.log(err);
                    reject(err);
                })
        })
    }
}