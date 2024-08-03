const fs = require("fs");
const { parse } = require("csv-parse");

const p1 = () => {
  const connections = [];
  const result = {};
  const casePopulus = {};
  const allCases = new Set();
  fs.createReadStream("./data/p1_cross_references.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", function (row) {
    if (row[4] !== 'cousin') {
      connections.push([row[0], row[1]].sort());
    }
    casePopulus[row[0]] = row[2];
    casePopulus[row[1]] = row[3];
    allCases.add(row[0]);
    allCases.add(row[1]);
  })
  .on('end', () => {
    const uniqueConnections = connections.filter(( t={}, a=> !(t[a]=a in t) ));
    const sortedUniqueConnections = uniqueConnections.sort((a, b) => a[0] - b[0])
    for (const connection of sortedUniqueConnections) {
      // if there's a new case, add both relations (should be ok bc of sorting)
      if (!result[connection[0]]) {
        result[connection[0]] = {
          group_id: connection[0],
          cases: [
            {
              case_id: connection[0],
              num_individuals: casePopulus[connection[0]]
            },
            {
              case_id: connection[1],
              num_individuals: casePopulus[connection[1]]
            }
          ]
        }

        // add an int showing it's existing group
        result[connection[1]] = connection[0]; 
        // remove from set
        allCases.delete(connection[0]);
        allCases.delete(connection[1]);
      }
      // from is already in a group, so just add the to to it
      else if (typeof result[connection[0]] === "string") {
        const existingGroupId = result[connection[0]];
        if (!(result[existingGroupId].cases.map(c => c.case_id).includes(connection[1].toString()))) {
          result[existingGroupId].cases = [
            ...result[existingGroupId].cases,
            {
              case_id: connection[1],
              num_individuals: casePopulus[connection[1]],
            }
          ];
        }
        
        // add an int showing it's existing group
        result[connection[1]] = existingGroupId; 
        // remove from set
        allCases.delete(connection[0]);
        allCases.delete(connection[1]);
      }
      // from already IS a group, so add the to
      else {
        if (!(result[connection[0]].cases.map(c => c.case_id).includes(connection[1].toString()))) {
          result[connection[0]].cases = [
            ...result[connection[0]].cases,
            {
              case_id: connection[1],
              num_individuals: casePopulus[connection[1]],
            }
          ];
        }
        // add an int showing it's existing group
        result[connection[1]] = connection[0]; 
        // remove from set
        allCases.delete(connection[0]);
        allCases.delete(connection[1]);
      }
    }
    const jsonResult = Object.values(result).filter(x => typeof result[x] !== 'object')
    for (const soloGroup of allCases) {
      jsonResult.push({
        group_id: soloGroup,
        cases: [{
          case_id: soloGroup,
          num_individuals: casePopulus[soloGroup],
        }]
      })
    }
    fs.writeFile('./output/p1_case_groups.json', JSON.stringify(jsonResult, null, 2), err => {
      if (err) {
        console.error(err);
      } else {
        // file written successfully
      }
    });
  })
};

// p1();

const p2 = () => {
  // get-group, link, unlink
  const jsonList = [];
  // pretend this is seeded from p1 and stored in another table in db
  // async means it isn't seeded properly (right now) in p1
  const allCases = [
    1,
    2,
    4,
    3,
    5,
    6,
    7,
    13,
    8,
    9,
    10,
    11,
    12
  ]
  let datastore = JSON.parse(fs.readFileSync('./datastore.json', 'utf8'));
  let actions = JSON.parse(fs.readFileSync('./data/p2_requests.json', 'utf8'));
  for (const action of actions) {
    switch(action.operation) {
      case '/get-group':
        const existingGroup = groupExists(datastore, action.body.group_id);
        if (existingGroup === undefined) {
          jsonList.push({ status: 400 });
        } 
        else {
          existingGroup.status = 200
          jsonList.push(existingGroup);
        }
        break;
        
        case '/link':
          if (!action.body.case_ids.every(case_id => allCases.includes(case_id))) {
            jsonList.push({ status: 400 });
          }
          else {
            // find groups
            // edit groups
            const tmpCases = [];
            for (const caseId of action.body.case_ids) {
              const foundGroup = datastore.find(group => group.cases.some(obj => obj.case_id === caseId));
              tmpCases.push(...foundGroup.cases.filter(x => x.case_id === caseId))
              if (foundGroup.cases.length > 1) {
                foundGroup.cases = foundGroup.cases.filter(x => x.case_id !== caseId)
                foundGroup.group_id = Math.min(...foundGroup.cases.map(x => x.case_id));
              }
              else {
                datastore.filter(group => group !== foundGroup);
              }
            }
            const new_group_id = Math.min(...action.body.case_ids);
            datastore.push({
              group_id: new_group_id,
              cases: tmpCases,
            })
            jsonList.push({
              status: 200,
              new_group_id,
            })
          }
          break;
          
        case '/unlink':
          const currentGroup = groupExists(datastore, action.body.group_id);
          if (currentGroup === undefined) {
            jsonList.push({ status: 400 });
          } 
          else {
            // delete currentGroup, make new
            const soloCases = currentGroup.cases;
            datastore.filter(group => group !== currentGroup);
            for (const soloCase of soloCases) {
              datastore.push({
                group_id: soloCase.case_id,
                cases: [soloCase],
              })
            }
            jsonList.push({
              status: 200,
              new_group_ids: currentGroup.cases.map(caseObj => caseObj.case_id)
            });
          }
          break;
      }
    }

    fs.writeFile('./output/p2_responses.json', JSON.stringify(jsonList, null, 2), err => {
      if (err) {
        console.error(err);
      } else {
        // file written successfully
      }
    });
    

};

const groupExists = (datastore, groupId) => {
  return datastore.find(group => group.group_id === groupId);
}


p2();