import { ChildProcess } from "child_process";

var spawn = require('child_process').spawn;
var slang = require('slang');
var isStream = require('is-stream');

function quote(val: string) {
    // escape and quote the value if it is a string and this isn't windows
    if (typeof val === 'string' && process.platform !== 'win32') {
        val = '"' + val.replace(/(["\\$`])/g, '\\$1') + '"';
    }

    return val;
}

let command = 'wkhtmltoimage';
let shell = '/bin/bash';

export function setCommant(value: string) {
    command = value;
}

export function wkHtmlToImage(input: string | any, options: any = {}) {
    const output = options.output;
    delete options.output;

    options['custom-header'] = '"User-Agent" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36"',

    options['custom-header-propagation'] = true;

    // make sure the special keys are last
    const extraKeys: string[] = [];
    let keys = Object.keys(options).filter(function (key) {
        if (key === 'toc' || key === 'cover' || key === 'page') {
            extraKeys.push(key);
            return false;
        }

        return true;
    }).concat(extraKeys);

    // make sure toc specific args appear after toc arg
    if (keys.indexOf('toc') >= 0) {
        const tocArgs = ['disableDottedLines', 'tocHeaderText', 'tocLevelIndentation', 'disableTocLinks', 'tocTextSizeShrink', 'xslStyleSheet'];
        const myTocArgs: string[] = [];
        keys = keys.filter(function (key) {
            if (tocArgs.find(function (tkey) { return tkey === key })) {
                myTocArgs.push(key);
                return false;
            }
            return true;
        });
        const spliceArgs = ([keys.indexOf('toc') + 1, 0] as any as string[]).concat(myTocArgs) as any;
        Array.prototype.splice.apply(keys, spliceArgs);
    }

    const args = [command];
    if (!options.debug) {
        args.push('--quiet');
    }

    keys.forEach(function (key) {
        var val = options[key];
        if (key === 'ignore' || key === 'debug' || key === 'debugStdOut') { // skip adding the ignore/debug keys
            return false;
        }

        if (key !== 'toc' && key !== 'cover' && key !== 'page') {
            key = key.length === 1 ? '-' + key : '--' + slang.dasherize(key);
        }

        if (Array.isArray(val)) { // add repeatable args
            val.forEach(function (valueStr) {
                args.push(key);
                if (Array.isArray(valueStr)) { // if repeatable args has key/value pair
                    valueStr.forEach(function (keyOrValueStr) {
                        args.push(quote(keyOrValueStr));
                    });
                } else {
                    args.push(quote(valueStr));
                }
            });
        } else { // add normal args
            if (val !== false) {
                args.push(key);
            }

            if (typeof val !== 'boolean') {
                args.push(quote(val));
            }
        }
    });

    var isUrl = /^(https?|file):\/\//.test(input);
    args.push(isUrl ? quote(input) : '-');    // stdin if HTML given directly
    args.push(output ? quote(output) : '-');  // stdout if no output file

    // show the command that is being run if debug opion is passed
    if (options.debug && !(options instanceof Function)) {
        console.log('[node-wkhtmltopdf] [debug] [command] ' + args.join(' '));
    }

    let child: ChildProcess;
    if (process.platform === 'win32') {
        child = spawn(args[0], args.slice(1));
    } else if (process.platform === 'darwin') {
        child = spawn('/bin/sh', ['-c', args.join(' ') + ' | cat ; exit ${PIPESTATUS[0]}']);
    } else {
        // this nasty business prevents piping problems on linux
        // The return code should be that of wkhtmltopdf and not of cat
        // http://stackoverflow.com/a/18295541/1705056
        child = spawn(shell, ['-c', args.join(' ') + ' | cat ; exit ${PIPESTATUS[0]}']);
    }

    const stream = child.stdout;
    const stderrMessages: string[] = [];

    // call the callback with null error when the process exits successfully
    child.on('exit', function (code) {
        if (code !== 0) {
            stderrMessages.push('wkhtmltopdf exited with code ' + code);
            handleError(stderrMessages);
        }
    });

    // setup error handling

    function handleError(err: any) {
        var errObj = null;
        if (Array.isArray(err)) {
            // check ignore warnings array before killing child
            if (options.ignore && options.ignore instanceof Array) {
                var ignoreError = false;
                options.ignore.forEach(function (opt: any) {
                    err.forEach(function (error) {
                        if (typeof opt === 'string' && opt === error) {
                            ignoreError = true;
                        }
                        if (opt instanceof RegExp && error.match(opt)) {
                            ignoreError = true;
                        }
                    });
                });
                if (ignoreError) {
                    return true;
                }
            }
            errObj = new Error(err.join('\n'));
        } else if (err) {
            errObj = new Error(err);
        }
        child.removeAllListeners('exit');
        child.kill();

        // there are listeners for errors, emit the error event
        if (stream.listeners('error').length > 0) {
            stream.emit('error', errObj);
        }
    }

    child.once('error', function (err) {
        throw err;
    });

    child.stderr.on('data', function (data) {
        stderrMessages.push((data || '').toString());
        if (options.debug instanceof Function) {
            options.debug(data);
        } else if (options.debug) {
            console.log('[node-wkhtmltopdf] [debug] ' + data.toString());
        }
    });

    if (options.debugStdOut && !output) {
        throw new Error('debugStdOut may not be used when wkhtmltopdf\'s output is stdout');
    }

    if (options.debugStdOut && output) {
        child.stdout.on('data', function (data) {
            if (options.debug instanceof Function) {
                options.debug(data);
            } else if (options.debug) {
                console.log('[node-wkhtmltopdf] [debugStdOut] ' + data.toString());
            }
        });
    }

    // write input to stdin if it isn't a url
    if (!isUrl) {
        // Handle errors on the input stream (happens when command cannot run)
        child.stdin.on('error', handleError);
        if (isStream(input)) {
            input.pipe(child.stdin);
        } else {
            child.stdin.end(input);
        }
    }

    // return stdout stream so we can pipe
    return stream;
}
