import * as JSZip from 'jszip'
import Log from "../Util";
import * as fs from 'fs';
export default class Helpers {

    constructor() {
        Log.trace('HelpersImpl::init()');
    }

    convertToBase64(file: string): Promise<Object> {
        return new Promise(function (fulfill, reject) {
            fs.open(file, 'r', function (err, fd) {
                // console.log(fd, err);
                fs.fstat(fd, function (err, stats) {
                    var bufferSize = stats.size,
                        chunkSize = 512,
                        buffer = new Buffer(bufferSize),
                        bytesRead = 0;

                    while (bytesRead < bufferSize) {
                        if ((bytesRead + chunkSize) > bufferSize) {
                            chunkSize = (bufferSize - bytesRead);
                        }
                        fs.read(fd, buffer, bytesRead, chunkSize, bytesRead);
                        bytesRead += chunkSize;
                    }
                    let result = buffer.toString('base64', 0, bufferSize);
                    fs.close(fd);
                    fulfill({ code: '200', body: {result} });
                });
            });
            // console.log("Filename", file);
            // var new_zip = new JSZip();
            // new_zip.loadAsync(file)
            //     .then(function (zip) {
            //         console.log(zip);
            //         // you now have every files contained in the loaded zip
            //         // new_zip.file("hello.txt").async("string"); // a promise of "Hello World\n"
            //     })
            //     .catch((err) => {
            //         console.log(err);
            //         reject(err);
            //     })
        });
    }
}