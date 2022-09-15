const axios = require("axios");
const csv = require("csv");
const fs = require("fs");
const moment = require("moment");
const cliProgress = require("cli-progress");

// create a new progress bar instance and use shades_classic theme
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
const bar2 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

(async () => {
  const tickets = [];
  const month = moment(process.argv[2]);
  console.log(
    "start export zendesk ticket created between " +
      month.format("YYYY-MM") +
      " to " +
      month.clone().add(1, "month").format("YYYY-MM")
  );
  var hasNext = true;
  while (hasNext) {
    let first = typeof hasNext !== "string";
    await axios
      .get(first ? "https://bachelorapp.zendesk.com/api/v2/search" : hasNext, {
        params: first
          ? {
              query:
                "type:ticket created<" +
                month.clone().add(1, "month").format("YYYY-MM-01") +
                " created>=" +
                month.format("YYYY-MM-01"),
            }
          : null,
        auth: {
          username: "bachelor.management@gmail.com",
          password: "Bachelor123+",
        },
      })
      .then((response) => {
        var data = response.data;
        first ? bar1.start(data.count) : null;
        for (let index = 0; index < data.results.length; index++) {
          let ticket = data.results[index];
          tickets.push({
            id: ticket.id,
            created: ticket.created_at,
            write: ticket.custom_fields.filter(
              (field) => field.id === 900007777103
            )[0].value,
            check: ticket.custom_fields.filter(
              (field) => field.id === 900007776943
            )[0].value,
            category: ticket.custom_fields.filter(
              (field) => field.id === 900009238863
            )[0].value,
            comment0: null,
            comment1: null,
            comment2: null,
            comment3: null,
            comment4: null,
            comment5: null,
            comment6: null,
            comment7: null,
            comment8: null,
            comment9: null,
          });
        }
        hasNext = data.next_page;
        bar1.update(tickets.length);
      })
      .catch((error) => {
        hasNext = false;
        console.log(error);
        console.log(error.response.statusText);
      });
  }
  bar1.stop();

  bar2.start(tickets.length);
  for (let index = 0; index < tickets.length; index++) {
    //get comments
    await axios
      .get(
        "https://bachelorapp.zendesk.com/api/v2/tickets/" +
          tickets[index].id +
          "/comments",
        {
          auth: {
            username: "bachelor.management@gmail.com",
            password: "Bachelor123+",
          },
        }
      )
      .then((response) => {
        let comments = response.data.comments
          .filter((comment) => comment.public)
          .map((comment) => {
            if (comment.public) {
              return [comment.body];
            }
            return;
          });
        for (let i = 0; i < comments.length; i++) {
          tickets[index]["comment" + i] = comments[i].toString();
        }
      })
      .catch((error) => {
        console.log(error);
        console.log(error.response.statusText);
      });
    bar2.update(index + 1);
  }
  bar2.stop();
  await csv.stringify(
    tickets,
    {
      header: true,
      columns: {
        id: "id",
        created: "created",
        write: "write",
        check: "check",
        category: "category",
        comment0: "comment0",
        comment1: "comment1",
        comment2: "comment2",
        comment3: "comment3",
        comment4: "comment4",
        comment5: "comment5",
        comment6: "comment6",
        comment7: "comment7",
        comment8: "comment8",
        comment9: "comment9",
      },
    },
    (err, output) => {
      var filename = "tickets" + month.format("YYYYMM") + ".csv";
      fs.writeFile(filename, output, (error) => {
        console.log("exported csv file " + filename);
      });
    }
  );
})();
