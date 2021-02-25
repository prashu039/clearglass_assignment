var async = require('async');
const { response } = require('express');
var costExplorerDao = require('../dao/costExplorerDao');
module.exports.getProjectCost = function(filters){
    return new Promise ((resolve,reject)=>{
        let data = [];
        costExplorerDao.getProjectCost(filters).then(response=>{
            return prepareProjectCostJson(response);  
        }).then((response)=>{
            resolve(data);
        }).catch(err=>{
            reject(err);
        })
    })
}

function createData(id,name,amount,type){
    this.id = id;
    this.name = name;
    this.amount = amount;
    this.type = type;
    this.childrens = new Map();
    let children = new Map();
    return {
        id,name,amount,type,children
    }
}

let prepareProjectCostJson = module.exports.prepareProjectCostJson = (_data)=>{

    return new Promise ((resolve,reject)=>{

        try{
            let clientMap = new Map();
            async.each(_data,function(value,cb){
                if(!clientMap.has(value.clientId)){
            
                    let _clientData = new createData(value.clientId,value.clientName,0,"client");
                    let _projectData = new createData(value.projectId,value.projectTitle,0,"project");
                    let projectMap = new Map();
                    
                    if(value.costTypeParentId==null){
                        let costChildGroupMap = new Map();
                        let _costGroupData = new createData(value.costId,value.costTypeName,value.costAmount,"cost");
                        
                        costChildGroupMap.set(value.projectId+"_"+value.costTypeId,_costGroupData);
                        _projectData.children = costChildGroupMap

                    }
                    
                    projectMap.set(value.projectId,_projectData);
                    _clientData.children = projectMap                
                    clientMap.set(value.clientId,_clientData)
                    cb();

                }else{
                    let _projectData;
                    let _costGroupData;

                    let _clientData = clientMap.get(value.clientId);
                    let projectMap = _clientData.children;
                    
                    if(!projectMap.has(value.projectId)){
                        _projectData = new createData(value.projectId,value.projectTitle,0,"project");
                    }else{
                        _projectData = projectMap.get(value.projectId)
                    }

                    let costChildGroupMap = _projectData.children;

                    if(value.costTypeParentId==null && !costChildGroupMap.has(value.projectId+value.costTypeId)){

                        _costGroupData = new createData(value.costId,value.costTypeName,value.costAmount,"cost");
                        costChildGroupMap.set(value.projectId+"_"+value.costTypeId,_costGroupData);
                    }else{
                        
                        if(value.root!=null){
                            _rootcostGroupData = costChildGroupMap.get(value.projectId+"_"+value.root);
                            let rootcostMap = _rootcostGroupData.children;
                            _costGroupData = rootcostMap.get(value.projectId+"_"+value.costTypeParentId);
                            let costMap = _costGroupData.children;

                            let _costData = new createData(value.costId,value.costTypeName,value.costAmount,"cost");
                            costMap.set(value.projectId+"_"+value.costTypeParentId,_costData); 
                            _costGroupData.children = costMap;
                            rootcostMap.set(value.projectId+"_"+value.costTypeParentId,_costGroupData);
                        }else{
                            _costGroupData = costChildGroupMap.get(value.projectId+"_"+value.costTypeParentId);
                            let costMap = _costGroupData.children;

                            let _costData = new createData(value.costId,value.costTypeName,value.costAmount,"cost");
                            costMap.set(value.projectId+"_"+value.costTypeId,_costData); 
                            _costGroupData.children = costMap;
                            costChildGroupMap.set(value.projectId+"_"+value.costTypeParentId,_costGroupData);
                        } 
                        
                    }
                    
                    _projectData.children = costChildGroupMap;
                        
                    projectMap.set(value.projectId,_projectData);
                    _clientData.children = projectMap;
                    
                    clientMap.set(value.clientId,_clientData);
                    cb();
                    
                } 
            },
            function(err){
                resolve(clientMap);
            })
        }catch(err){
            console.log(`Error in costExplorerService:prepareProjectCostJson:${err}`)
            reject(err);  
        }
        
    })
}