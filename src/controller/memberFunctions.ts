import * as JSZip from 'jszip'
import Log from "../Util";
import * as fs from 'fs';
export default class Helpers {

    constructor() {
        Log.trace('HelpersImpl::init()');
    }

    convertToBase64(file: string): Promise<string> {
        return new Promise(function (fulfill, reject) {
            fs.open(file, 'r', function (err, fd) {
                console.log(fd);
                if (fd) {
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
                        fulfill(result);
                    });
                }
                else {
                    reject(err);
                }
            });

        });
    }

    uncompressFile(fileString: any): Promise<any> {
        return new Promise((fulfill, reject) => {
            let zip = JSZip(fileString, { "base64": true });
            zip.folder("courses/").forEach(function (relativePath, file) {
                console.log("iterating over", relativePath);
            });
            console.log(zip);
        });
    }
}