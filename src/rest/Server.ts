/**
 * This is the REST entry point for the project.
 * Restify is configured here.
 */

import restify = require('restify');

import Log from "../Util";
import { InsightResponse } from "../controller/IInsightFacade";
import InsightFacade from "../controller/InsightFacade";
import RestFacade from "../controller/RestFacade";
import * as fs from 'fs';

/**
 * This configures the REST endpoints for the server.
 */
export default class Server {

    private port: number;
    private rest: restify.Server;
    private insFac: InsightFacade = null;
    private restFac: RestFacade = null;


    constructor(port: number) {
        Log.info("Server::<init>( " + port + " )");
        this.port = port;
        this.insFac = new InsightFacade();
        this.restFac = new RestFacade(this.insFac);
    }

    /**
     * Stops the server. Again returns a promise so we know when the connections have
     * actually been fully closed and the port has been released.
     *
     * @returns {Promise<boolean>}
     */
    public stop(): Promise<boolean> {
        Log.info('Server::close()');
        let that = this;
        return new Promise(function (fulfill) {
            that.rest.close(function () {
                fulfill(true);
            });
        });
    }

    /**
     * Starts the server. Returns a promise with a boolean value. Promises are used
     * here because starting the server takes some time and we want to know when it
     * is done (and if it worked).
     *
     * @returns {Promise<boolean>}
     */
    public start(): Promise<boolean> {
        let that = this;
        return new Promise(function (fulfill, reject) {
            try {
                Log.info('Server::start() - start');

                that.rest = restify.createServer({
                    name: 'insightUBC'
                });

                that.rest.use(restify.CORS());

                fs.readFile("roomsBase64", 'utf8', (err: any, data: any) => {
                    if (!err) {
                        return that.insFac.addDataset("rooms", data)
                            .then(res => {
                                Log.info('Added rooms ' + res);
                            })
                            .catch(err => {
                                Log.error(err);
                            })
                    }
                    else {
                        console.log(err);
                    }
                });

                fs.readFile("coursesBase64", 'utf8', (err: any, data: any) => {
                    if (!err) {
                        return that.insFac.addDataset("courses", data)
                            .then(res => {
                                Log.info('Added courses ' + res);
                            })
                            .catch(err => {
                                Log.error(err);
                            })
                    }
                    else {
                        console.log(err);
                    }
                });

                that.rest.get('/', function (req: restify.Request, res: restify.Response, next: restify.Next) {
                    res.send(200);
                    return next();
                });

                that.rest.use(restify.bodyParser({ mapParams: true, mapFiles: true }));

                that.rest.put('/dataset/:id', (req: restify.Request, res: restify.Response, next: restify.Next) => {
                    if (req.params.body) {
                        console.log(req.params.body);
                        let dataStr = new Buffer(req.params.body).toString('base64');
                        return that.insFac.addDataset(req.params.id, dataStr)
                            .then(sol => {
                                console.log("Res", sol);
                                // res.code = sol.code;
                                res.send(sol.code, sol.body);
                                return next();
                            })
                            .catch((err) => {
                                // console.log("Err", err);
                                res.code = err.code;
                                res.send(err.code, err.body);
                                return next();
                            })
                    }
                    else {
                        res.send(400, { "error": "No real data" });
                        return next();
                    }

                });

                that.rest.post('/query', function (req: restify.Request, res: restify.Response, next: restify.Next) {
                    return that.insFac.performQuery(JSON.parse(req.body))
                        .then(sol => {
                            // console.log("Res", sol);
                            // res.code = sol.code;
                            res.send(sol.code, sol.body);
                            return next();
                        })
                        .catch((err) => {
                            console.log("Err", err);
                            res.send(err.code, err.body);
                            return next();
                        })
                });

                that.rest.post('/distanceQuery', function (req: restify.Request, res: restify.Response, next: restify.Next) {
                    let dataRec = JSON.parse(req.body)
                    return that.insFac.performQuery(dataRec.query)
                        .then((sol: any) => {
                            return that.restFac.filterByDistance(sol, dataRec.buildingName, dataRec.maxDistance);
                        })
                        .then((sol: any) => {
                            res.send(sol.code, sol.body);
                            return next();
                        })
                        .catch((err) => {
                            console.log("Err", err);
                            res.send(err.code, err.body);
                            return next();
                        })
                });

                that.rest.post('/schedule', function (req: restify.Request, res: restify.Response, next: restify.Next) {
                    let dataRec = JSON.parse(req.body);
                    let roomsQuery: Object;
                    console.log(dataRec);
                    if (dataRec.distance > 0) {
                        roomsQuery = {
                            WHERE: {},
                            OPTIONS: {
                                COLUMNS: ["rooms_seats",
                                    "rooms_lat",
                                    "rooms_lon",
                                    "rooms_fullname",
                                    "rooms_shortname",
                                    "rooms_number",
                                    "rooms_name"],
                                FORM: "TABLE"
                            }
                        }
                    }
                    else {
                        roomsQuery = {
                            WHERE: { IS: dataRec.buildingQuery },
                            OPTIONS: {
                                COLUMNS: ["rooms_seats",
                                    "rooms_lat",
                                    "rooms_lon",
                                    "rooms_fullname",
                                    "rooms_shortname",
                                    "rooms_number",
                                    "rooms_name"],
                                FORM: "TABLE"
                            }
                        }
                        // console.log(roomsQuery);
                    }
                    let coursesData: any;
                    return that.restFac.scheduleCourses(dataRec)
                        .then((sol: any) => {
                            coursesData = sol;
                            return that.insFac.performQuery(roomsQuery)
                        })
                        .then((sol: any) => that.restFac.filterByDistance(sol, dataRec.buildingName, dataRec.distance))
                        .then((rooms: any) => that.restFac.findSchedule(rooms, coursesData))
                        .then((sol: any) => {
                            // console.log(sol);
                            res.send(sol);
                            return next();
                        })
                        .catch((err) => {
                            console.log("Err", err);
                            res.send(err.code, err.body);
                            return next();
                        })
                });


                that.rest.del('/dataset/:id', function (req: restify.Request, res: restify.Response, next: restify.Next) {
                    return that.insFac.removeDataset(req.params.id)
                        .then(sol => {
                            console.log("Res", sol);
                            // res.code = sol.code;
                            res.send(sol.code, sol.body);
                            return next();
                        })
                        .catch((err) => {
                            // console.log("Err", err);
                            res.code = err.code;
                            res.send(err.code, err.body);
                            return next();
                        })
                });

                // provides the echo service
                // curl -is  http://localhost:4321/echo/myMessage
                that.rest.get('/echo/:msg', Server.echo);

                // Other endpoints will go here

                that.rest.listen(that.port, function () {
                    Log.info('Server::start() - restify listening: ' + that.rest.url);
                    fulfill(true);
                });

                that.rest.on('error', function (err: string) {
                    // catches errors in restify start; unusual syntax due to internal node not using normal exceptions here
                    Log.info('Server::start() - restify ERROR: ' + err);
                    reject(err);
                });
            } catch (err) {
                Log.error('Server::start() - ERROR: ' + err);
                reject(err);
            }
        });
    }

    // The next two methods handle the echo service.
    // These are almost certainly not the best place to put these, but are here for your reference.
    // By updating the Server.echo function pointer above, these methods can be easily moved.

    public static echo(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('Server::echo(..) - params: ' + JSON.stringify(req.params));
        try {
            let result = Server.performEcho(req.params.msg);
            Log.info('Server::echo(..) - responding ' + result.code);
            res.json(result.code, result.body);
        } catch (err) {
            Log.error('Server::echo(..) - responding 400');
            res.json(400, { error: err.message });
        }
        return next();
    }

    public static performEcho(msg: string): InsightResponse {
        if (typeof msg !== 'undefined' && msg !== null) {
            return { code: 200, body: { message: msg + '...' + msg } };
        } else {
            return { code: 400, body: { error: 'Message not provided' } };
        }
    }

}
