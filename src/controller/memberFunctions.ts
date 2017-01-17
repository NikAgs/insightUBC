import * as JSZip from 'jszip'
import Log from "../Util";

export default class Helpers {

    constructor() {
        Log.trace('HelpersImpl::init()');
    }

    uncompressFile(file: string): Promise<Object> {
        return new Promise(function (fulfill, reject) {
            console.log("Filename", file);
            var new_zip = new JSZip();
            new_zip.loadAsync(file)
                .then(function (zip) {
                    console.log(zip);
                    // you now have every files contained in the loaded zip
                    // new_zip.file("hello.txt").async("string"); // a promise of "Hello World\n"
                })
                .catch((err) => {
                    console.log(err);
                })
        });
    }
}