// The final version of the exporter that is used on the website can be found in the
// Search.js file in the src/containers folder. 

<button id="exportButton">Export</button>

  <script>

    const objectToCsv = function(data) {

      // Array that will be used to create csv
      const csvRows = [];

      // First element in the passed in data
      const headers = Object.keys(data[0]);

      // Pushing the first elements of the data to the csv file which will
      // be the column titles. We use the ',' to separate these values.
      csvRows.push(headers.join(','));

      // loop over rows
      for (const row of data) {
        const values = headers.map(header => {

          // Force the data into a string by using ''+ and use replace
          // to prevent any data with a comma in it from being separated (i.e. article_text).
          const escaped = (''+row[header]).replace(/(\n])/gm, " ")
          const escaped2 = (escaped).replace(/"/g, "''")
          return '"'+escaped2+'"
        });

        csvRows.push(values.join(','));
      }

      return csvRows.join('\n');
    };

    const download = function(data) {
      const Blob = new Blob([data], {type: 'text/csv'});

      // Creates URL version of the csv file
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', 'export_results.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    const getResults = async function() {
      //const jsonUrl = ;
      //const res = await fetch(jsonUrl);
      const json = await res.json();

      // Retrieves only the article metadata from the JSON
      const data = json.map(row => ({
        Title: row.article_title,
        Text: row.article_text,
        Newspaper: row.newspaper,
        Publisher: row.publisher,
        Published_Date: row.publish_date,
        City: row.city,
        State: row.state,
        Latitude: row.latitude,
        Longitude: row.longitude,
        Article_Link: row.article_url
      }));

      // Prints the contents of the rows we mapped above
      //console.log(data);

      const csvData = objectToCsv(json);

      // Should output a proper csv file format
      // console.log(csvData)

      download(csvData);
    };

    (function()  {
      const button = document.getElementById('exportButton');
      button.addEventListener('click', getResults);
    })();

  </script>
