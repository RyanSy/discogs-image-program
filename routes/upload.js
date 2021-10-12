const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './tmp');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });
const readXlsxFile = require('read-excel-file/node');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

router.post('/', upload.single('spreadsheet'), async function(req, res) {
  if (process.env.ENVIRONMENT === 'production') {
    var spreadsheetFilePath = path.join(__dirname, 'tmp', req.file.originalname);
  }
  if (process.env.ENVIRONMENT === 'development') {
    var spreadsheetFilePath = `./tmp/${req.file.originalname}`
  }
  // upload and read Excel spreadsheet
  function uploadExcelSpreadsheet() {
    // create object schema from excel spreadsheet
    const schema = {
      'ID': {
        prop: 'id',
        type: Number
      },
      'ARTIST': {
        prop: 'artist',
        type: String
      },
      'TITLE': {
        prop: 'title',
        type: String
      },
      'EDITION': {
        prop: 'edition',
        type: String
      }
    };

    // read excel file
    return readXlsxFile(spreadsheetFilePath, {schema} )
      .then((rows, errors) => {
        if (errors) {
          console.log(errors);
          res.send('Error. Please try again.');
        }
        const rowsArray = rows.rows;
        const rowsArrayLength = rowsArray.length;
        for (var i = 0; i < rowsArrayLength; i++) {
          if (!rowsArray[i].artist) {
            rowsArray[i].artist = '';
          }
        }
        return rowsArray;
      });
  }

  // search for image on Discogs
  function getImage(artist, title) {
    let uri = `https://api.discogs.com/database/search?q={${artist} ${title}}&format=vinyl&token=${process.env.DISCOGS_USER_TOKEN}`
    let encodedURI = encodeURI(uri);

    return axios({
      method: 'get',
      url: encodedURI,
      headers: {'User-Agent': 'Discogs Image Program/1.0'}
    }).then(function(response) {
      var release = response.data.results[0];
      if (typeof release === 'undefined') {
        var image = null;
      } else {
        var image = response.data.results[0].cover_image;
      }
      return image;
    }).catch(function(error) {
        console.log(error);
        // res.send('Error searching Discogs, please try again.')
    });
  }

  var releaseArray = await uploadExcelSpreadsheet();
  var releaseArrayLength = releaseArray.length;

  async function start() {
    for (var i = 0; i < releaseArrayLength; i++) {
      var cover_image = await getImage(releaseArray[i].artist, releaseArray[i].title);
      releaseArray[i].cover_image = cover_image;
    }
    // delete spreadsheet from tmp
    const filePath = spreadsheetFilePath;
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    res.render('results', { releaseArray });
  };

  start();
});

module.exports = router;
