const spawn = require('child_process').spawn;
var Table = require('cli-table');
var moment = require('moment');
var cl = console.log;
var colors = require('colors');

var started = moment();

const microservices = [
    {
        name:"MIB",
        dirname:"MIB/",
        type:"server",
        path:"MIB/mib_server.js",
        delay:0,
        activate:true
    },
    {
        name:"FETCHER",
        dirname:"FETCHER/",
        type:"client",
        path:"FETCHER/fetcher_client.js",
        delay:0,
        activate:true
    },
    {
        name:"MAB",
        dirname:"MAB/",
        type:"server",
        path:"MAB/mab_server.js",
        delay:0,
        activate:true
    }
];


var clearScreen = function(){
    console.log('\x1Bc');
};

var displayOutputScreen = function(data){
    clearScreen();
    var head = []; var headRow2 = [];
    var colWidths = []; var colWidthsRow2 = [];
    var values = []; var valuesRow2 = [];
    
    
    var i =0;
    for(var index in output){
        var data = [];
        i++;
        var service = output[index];
        // var width = parseInt(200/parseInt(Object.keys(output).length));
        var width = parseInt(110);
    
        for(var elIndex in service.std){
            for(var objIndex in service.std[elIndex]){
                if(service.std[elIndex].type=="stdout"){
                    data.push(service.std[elIndex].data.toString().green);
                }
                if(service.std[elIndex].type=="stderr"){
                    data.push(service.std[elIndex].data.toString().red);
                }
            }
        
        }
        
        if(i<=2){
            head.push(service.serviceName);
            colWidths.push(width);
            values.push(data);
    
        }else{
            headRow2.push(service.serviceName);
            colWidthsRow2.push(width);
            valuesRow2.push(data);
    
        }
        
        // head.push(service.serviceName);
        //
        // colWidths.push(width);
       
        // values.push(data);
        // values.push(service.stderr.toString().red);
    }
    
    var table = new Table({
        head: head
        , colWidths: colWidths
    });
    table.push(values);    
    console.log(table.toString());
    
    if(i>=2){
    
        var table2 = new Table({
            head: headRow2
            , colWidths: colWidthsRow2
        });
        table.push(valuesRow2);
        console.log(table2.toString());
    }
    console.log('Started : ', started.format('YYYY-MM-DD HH:mm:ss'),'-', moment().diff(started,'minutes'), 'minutes ago.');
    console.log('Now :',moment().format('YYYY-MM-DD HH:mm:ss'));
    
};
var startDisplayer = function(){
    setInterval(displayOutputScreen,1000);
};
var parseOutput=function(serviceName, outputType, outputBody){
  if(output){
      var exist = false;
      for(var index in output){
          var service = output[index];
          if(service.serviceName == serviceName){
              exist=true;
              service['std'].push({type:outputType, data:outputBody});
              
              if(service['std'].length>6){
                  service['std'].shift();
              }
          }
      }
  }  
};
// startDisplayer();

var output = {};
for(var obj in microservices){
    let service = microservices[obj];
    let child = spawn('node',[service.path]);
    output[service.name]={
        serviceName:service.name,
        std:[],
        child:child
    };
    child.stdout.on('data', (data) => {
        parseOutput(service.name, 'stdout', data);
        displayOutputScreen();
        
    });
    child.stderr.on('data', (data) => {
        parseOutput(service.name, 'stderr', data);
        displayOutputScreen();
        
    });
};