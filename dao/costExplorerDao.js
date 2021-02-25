
var {connection} = require('../mysql');

var connection = connection.getInstance();

module.exports.getProjectCost = function(filters){
    return new Promise ((resolve,reject)=>{
        query = 'select cnt.id as clientId, cnt.name as clientName, '
        +' prj.id as projectId,prj.title as projectTitle, '
        +' cst.id as costId,cst.amount as costAmount, '
        +' ctype.name as costTypeName,ctype.parent_id as costTypeParentId,ctype.id as costTypeId,ctyperoot.parent_id as root '
        +' from clients as cnt '
        +' left join projects as prj on cnt.id = prj.client_id '
        +' left join costs as cst on prj.id = cst.project_id '
        +' left join cost_types as ctype on  cst.cost_type_id = ctype.id '
        +' left join cost_types as ctyperoot on  ctype.parent_id = ctyperoot.id '
        +' filter '
        +' order by clientId,projectId,costTypeParentId,costTypeId '
        let filter = "";
        if(filters.client_id!=undefined){
             filter += filter!=''?" and cnt.id IN("+filters.client_id+")":"where clientId IN("+filters.client_id+")";
        }

        if(filters.cost_type_id!=undefined){
            filter += filter!=''?" and cst.cost_type_id IN("+filters.cost_type_id+")":"where cst.cost_type_id IN("+filters.cost_type_id+")";
        }

        if(filters.project_id!=undefined){
            filter += filter!=''?" and cst.project_id IN("+filters.project_id+")":"where cst.project_id IN("+filters.project_id+")";
        }

        query = query.replace("filter",filter);

        connection.query(query, function (err, rows, fields) {
        if (err) reject(err)
        console.log("Query Output: "+JSON.stringify(rows))
            resolve(rows)
        })
    })
}