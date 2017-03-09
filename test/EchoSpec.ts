/**
 * Created by rtholmes on 2016-10-31.
 */
import restify = require('restify');
import Server from "../src/rest/Server";
import { expect } from 'chai';
import Log from "../src/Util";
import { InsightResponse } from "../src/controller/IInsightFacade";
import * as fs from 'fs';
var chai = require('chai')
    , chaiHttp = require('chai-http');

chai.use(chaiHttp);

describe("EchoSpec", function () {
    let ServerS: Server = null;

    function sanityCheck(response: InsightResponse) {
        expect(response).to.have.property('code');
        expect(response).to.have.property('body');
        expect(response.code).to.be.a('number');
    }

    before(function () {
        ServerS = new Server(3000);
        Log.test('Before: ' + (<any>this).test.parent.title);
    });

    beforeEach(function () {
        Log.test('BeforeTest: ' + (<any>this).currentTest.title);
    });

    after(function () {
        Log.test('After: ' + (<any>this).test.parent.title);
    });

    afterEach(function () {
        Log.test('AfterTest: ' + (<any>this).currentTest.title);
    });

    it("Should be able to start server", function () {
        return ServerS.start()
            .then((res) => {
                expect(res).to.equal(true);
            })
            .catch(err => {
                console.log(err);
            })
    });

    it("PUT description fail", function () {
        return chai.request("localhost:3000")
            .put('/dataset/hello')
            .attach("body", fs.readFileSync("./rooms.zip"), "rooms.zip")
            .then(function (res: any) {
                Log.trace('then:');
                // some assertions
                console.log(res.status);
                expect.fail();
                // console.log(res.body);
            })
            .catch(function (err: any) {
                Log.trace('catch:');
                // some assertions
                console.log(err.status)
            });
    });

    it("PUT description", function () {
        return chai.request("localhost:3000")
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync("./rooms.zip"), "rooms.zip")
            .then(function (res: any) {
                Log.trace('then:');
                // some assertions
                console.log(res.status);
                // console.log(res.body);
            })
            .catch(function (err: any) {
                Log.trace('catch:');
                // some assertions
                console.log(err.status)
                expect.fail();
            });
    });


    it("POST description", function () {
        let queryJSONObject = {
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
        return chai.request("localhost:3000")
            .post('/query')
            .send(queryJSONObject)
            .then(function (res: any) {
                Log.trace('then:');
                // some assertions
                console.log(res.status);
                console.log(res.body);
            })
            .catch(function (err: any) {
                Log.trace('catch:');
                // some assertions
                console.log(err.status)
                expect.fail();
            });
    });

    it("DELETE description", function () {
        return chai.request("localhost:3000")
            .del('/dataset/rooms')
            .then(function (res: any) {
                Log.trace('then:');
                // some assertions
                console.log(res.status);
                // console.log(res.body);
            })
            .catch(function (err: any) {
                Log.trace('catch:');
                // some assertions
                console.log(err.status)
                expect.fail();
            });
    });

    it("Should be able to stop server", function () {
        return ServerS.stop()
            .then((res) => {
                expect(res).to.equal(true);
            })
            .catch(err => {
                console.log(err);
            })
    });

    it("Should be able to echo", function () {
        let out = Server.performEcho('echo');
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(200);
        expect(out.body).to.deep.equal({ message: 'echo...echo' });
    });

    it("Should be able to echo silence", function () {
        let out = Server.performEcho('');
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(200);
        expect(out.body).to.deep.equal({ message: '...' });
    });

    it("Should be able to handle a missing echo message sensibly", function () {
        let out = Server.performEcho(undefined);
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(400);
        expect(out.body).to.deep.equal({ error: 'Message not provided' });
    });

    it("Should be able to handle a null echo message sensibly", function () {
        let out = Server.performEcho(null);
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(400);
        expect(out.body).to.have.property('error');
        expect(out.body).to.deep.equal({ error: 'Message not provided' });
    });

});
