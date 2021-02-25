var express = require('express');
var router = express.Router();
var costExplorerService = require('../service/costExplorerService');

router.get('/', function(req, res, next) {
    let client_id_filters = req.query.client_id;
    let cost_type_id_filters = req.query.cost_type_id;
    let project_id_filters = req.query.project_id;
    filters={
       client_id: client_id_filters,
       cost_type_id: cost_type_id_filters,
       project_id:project_id_filters
    }
    costExplorerService.getProjectCost(filters).then(response=>{
      res.send(response);
    }).catch(err=>{
      res.send([]);
    })
});


module.exports = router;
