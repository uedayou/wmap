/**
 * Gulp plugin to convert tsv files from linkdata.org into csv files.
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
 * wnew linkdata2csv
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
                const ldset = conf_data[conf_header["dataset"]]
                const ldfile = conf_data[conf_header["filename"]]
                requests.push(getCSVFromLinkData(ldset, ldfile, conf_data, conf_header))
            });

            var self = this

            Promise.all(requests)
                .then(function(results) {
                    results.forEach(function(result) {
                        const csvpath = `${file.base}/${path.basename( file.path, path.extname( file.path ) )}_${ result.filename }.csv`
                        const csv = file.clone()
                        csv.path = csvpath
                        csv.contents = new Buffer(result.data)
                        self.push(csv)
                    });
                    return callback();
                })
        })
    }

    function getCSVFromLinkData(ldset, ldfile, conf_data, conf_header) {
        return new Promise(function(resolve, reject) {
            // http://linkdata.org/api/1/rdf1s3571i/takatsuki_city_floralcalendar_tsv_uri.txt
            const url = "http://linkdata.org/api/1/" + ldset + "/" + ldfile + "_tsv_uri.txt"
            console.log(url)
            request('GET', url).done(function(response) {
                if (response.statusCode == 200) {
                    parse(response.getBody(), { delimiter: '\t' }, (err, rows) => {
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
                        resolve({ data: contents, dataname: ldset, filename: ldfile })
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
