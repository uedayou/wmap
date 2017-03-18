/**
 * Gulp plugin to convert external csv/tsv files into csv files.
 * @file
 */

'use strict'

const through = require('through2')
const path = require('path')
const parse = require('csv-parse')

const _ = require('underscore')
const request = require('then-request');
const Promise = require('promise');

/**
 * wnew anycsv2csv
 * @return {Stream} [description]
 */
module.exports = function(option) {

    /**
     * Transform
     * @param  {Vinyl}    file     [description]
     * @param  {string}   encode   [description]
     * @param  {Function} callback [description]
     */
    function transform(file, encode, callback) {

        // convert csv text into nested arrays, sometimes being jaggy
        parse(file.contents.toString(), (err, rows) => {

            // handle parsing error
            if (err) {
                this.emit('error', err)
                return callback()
            }

            const conf_header = _.invert(rows[0])

            const body = rows.splice(1)
                .filter(row => row !== '')

            var requests = []

            body.forEach(conf_data => {
                const url = conf_data[conf_header["url"]]
                console.log(url)
                requests.push(getExternalCSV(url, conf_data, conf_header))
            });

            var self = this

            Promise.all(requests)
                .then(function(results) {
                    results.forEach(function(result) {
                        const csvpath = `${file.base}/${path.basename( file.path, path.extname( file.path ) )}_${ result.basename }.csv`
                        const csv = file.clone()
                        csv.path = csvpath
                        csv.contents = new Buffer(result.data)
                        self.push(csv)
                    });
                    return callback();
                })
        })
    }

    function getExternalCSV(url, conf_data, conf_header) {
        return new Promise(function(resolve, reject) {
            const extension = path.extname(url)
            const basename = path.basename(url)
            // 拡張子が.tsv なら TSV、それ以外は CSV として扱う
            var delimiter = extension == '.tsv' ? '\t' : ','
            //delimiter = '\t'
            request('GET', url).done(function(response) {
                if (response.statusCode == 200) {
                    var text = response.getBody()
                    parse(text, { delimiter: delimiter }, (err, rows) => {
                        if (err) {
                            this.emit('error', err)
                            reject(err)
                        }

                        const header = _.invert(rows[0])
                        const body = rows.splice(1).filter(row => row !== '')

                        const menu = conf_data[conf_header["menu"]];

                        const item = body.map(d => {
                            var _menu = (typeof d[header[menu]] === "undefined") ? menu : d[header[menu]]
                            return _menu + "," +
                                d[header[conf_data[conf_header["title"]]]] + "," +
                                d[header[conf_data[conf_header["lat"]]]] + "," +
                                d[header[conf_data[conf_header["lng"]]]] + "," +
                                d[header[conf_data[conf_header["content"]]]]
                        })

                        item.unshift("menu,title,lat,lng,content")
                        const contents = item.join("\n")
                        resolve({ data: contents, filename: basename })
                    })
                }
            })
        })
    }

    /**
     * Flush
     * @param  {Function} callback [description]
     * @return {Void}              [description]
     */
    function flush(callback) {
        return callback()
    }

    return through.obj(transform, flush)
}
