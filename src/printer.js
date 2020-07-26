const ThermalPrinter = require("./node-thermal-printer").printer;
const Types = require("./node-thermal-printer").types;
const OrderType = require("@dxj/tasti-lib/lib/order").OrderType;
let db = null //require('./fb');

function sendCommand(printer, command){
    //console.log('command:',command);
    
    if(!command)
    {
        return {result:false,msg:'Error: command is null'};
    }
    if(!command[0])
    {
        return {result:false,msg:'Error: command.type is null'};
    }
    res={};
    //console.log(command[0]+command[0].length,";",command[1]);
    switch (command[0]) {//type
        case 'set font bold':
                printer.bold(true);
                res = {result:true};
                break;
        case 'set font unbold':
            printer.bold(false);
            res = {result:true};
            break;
        case 'set font big':
            printer.setTypeFontA();
            res = {result:true};
            break;
        case 'set font small':
            printer.setTypeFontB();
            res = {result:true};
            break;
        case 'set width':
            printer.setWidth(command[1]);
            res = {result:true};
            break;
        case 'align':
            if(command[1]==='center')
                printer.alignCenter();
            else if(command[1]==='right')
                printer.alignRight();
            else
                printer.alignLeft();
            res = {result:true};
            break;
        case 'println':
            if(command[1]){//text string
                printer.println(command[1]);
                res = {result:true};
            }
            else
            {
                res = {result:false,msg:'Error: println - command.text is null'};
            }
            break;
        case 'draw line':
            printer.drawLine();
            res = {result:true};
            break;
        case 'printlr':
            var left='';
            var right='';
            if(command[1]) left=command[1];
            if(command[2]) right=command[2];
            printer.leftRight(left, right);
            res = {result:true};
            break;
        case 'table3c':
            //console.log(JSON.stringify(command));
            if(command[1]){//aligns
                if(command[2]){//widths
                    if(command[3]){//data
                        for(i=0; i<command[3].length; i++)
                        {
                            data=[];
                            var str = "";
                            if(i==0){ //only the first row has first column data
                                //console.log('before:',command[3][i][0],';',command[3][i][0].length,';',command[2][0]);
                                command[3][i][0] = command[4]+command[3][i][0];
                                command[3][i][0] = command[3][i][0].substr(0,command[2][0]-1)+':';
                                if(command[3][i][0].trim()===":") command[3][i][0]=" ";
                                //console.log('after:',command[3][i][0],';');
                                if(command[3][i][0].length<command[2][0]){
                                    length2col=command[2][0]+command[2][1];
                                    command[2][0] = command[3][i][0].length;
                                    command[2][1] = length2col-command[3][i][0].length;
                                    //console.log('afteraaaa:',command[2][0],';',command[2][1],';');
                                }
                            }
                            for(j=0; j<3; j++){
                                if(j==0)
                                    str = command[3][i][j];
                                else
                                    str = " "+command[3][i][j];
                                str = str.substr(0,command[2][j]);
                                data.push({
                                    text:str,
                                    align:command[1][j],
                                    cols:command[2][j]
                                })
                                /*if(j==0)
                                    data.push({
                                        text:str,
                                        align:command[1][j],
                                        cols:command[2][j],
                                        bold:true
                                    })
                                else
                                    data.push({
                                        text:str,
                                        align:command[1][j],
                                        cols:command[2][j]
                                    })*/
                            };
                            printer.tableCustom(data);
                            //console.log("1111111111111111111122",JSON.stringify(data));
                        }
                        //console.log(JSON.stringify(data)+"1111111111111111111111\n");
                        res = {result:true};
                    }
                    else{
                        res = {result:false,msg:'Error: c-table missing data'}; 
                    }
                }
                else{
                    res = {result:false,msg:'Error: c-table missing widths'}; 
                }
            }
            else{
                res = {result:false,msg:'Error: c-table missing aligns'}; 
            }
            break;
                                                                                                                                                                   
        default:
            res = {result:false, msg:'Error: command type ['+command[0]+'] was undefined.'};
    }
    return res;
}
var time = '';
var oldOrderID = '';

async function print (data) {
    let printer = new ThermalPrinter({
        type: Types.EPSON,  // 'star' or 'epson'
        interface: 'tcp://'+ process.argv[2],//'tcp://192.168.0.60',
        options: {
          timeout: 5000
        },
        width: 48,                         // Number of characters in one line - default: 48
        characterSet: 'PC437_USA',          // Character set - default: SLOVENIA
        removeSpecialCharacters: false,    // Removes special characters - default: false
        lineCharacter: "-",                // Use custom character for drawing lines - default: -
    });
    let isConnected = await printer.isPrinterConnected();
    console.log("Printer connected:", isConnected);
    //await printer.printImage('../assets/olaii-logo-black-small.png');
    line = 0;
    data.forEach(command => {
    var res={};
    res = sendCommand(printer,command);
    if(!res.result)
    {
        console.log('Result:' + res.result);
    }
    return;
    line++;
  });
  printer.cut();
  //printer.openCashDrawer();
  //console.log(printer.getText());
  try {
    var res = await printer.execute();
    console.log("Printed:",res);
  } catch (error) {
    console.error("Print error:", error);
  }
}

function printOrder(data){
try{
    const order = data.order;
    console.log('order:', JSON.stringify(order, null, '  '))
    //return
    var pData=[];
    //console.log('order:', JSON.stringify(order,null,"   "));
    pData.push(["align","center"]);
    pData.push(["set font big"]);
    pData.push(["set font bold"]);
    pData.push(["println","Tasti"]);
    pData.push(["println",OrderType[order.orderType]]);
    pData.push(["set font unbold"]);
    pData.push(["align","left"]);
    pData.push(["println","Order#: "+order.readableOrderNum]);
    pData.push(["println","Customer Info:"]);
    pData.push(["printlr","Name:"+order.userFullName, "Phone:"+order.userPhone]);
    pData.push(["println","Placed: "+new Date(order.orderTime).toLocaleTimeString('en-US')]);
    console.log('order.orderType != OrderType.DIRECT_PAY', order.orderType != OrderType.DIRECT_PAY, order.orderType, OrderType.DIRECT_PAY)
    if(order.orderType != OrderType.DIRECT_PAY){
        //if(o.OrderType[order.orderType] === "DELIVERY"){
        //    pData.push(["println","Address: "+order.customerAddress]);
        //}
        //else { //if(order.orderType.toLowerCase()==="pickup"){
            pData.push(["align","center"]);
            pData.push(["println","Pickup Time"]);
            var pickupTime = order.orderTime;
            //pickupTime.setMinutes(pickupTime.getMinutes()+20);
            //var dateStr = pickupTime.toLocaleDateString('en-US');
            //dateStr = dateStr.slice(0,dateStr.length-5);
            //pData.push(["println",dateStr+" "+pickupTime.toLocaleTimeString('en-US')]);
            pData.push(["println",new Date(pickupTime).toLocaleTimeString('en-US')]);
        //}
        pData.push(["align","left"]);
        pData.push(["println","Order Details:"]);
        var total=0;
        //console.log('aaaaaaaaaaaaa',order)
        //pData.push(["align","center"]);
        order.ticket.cartSnapshot.products.forEach(product => {
            mainItemPrice = product.productTotalPrice / product.productCount
            let options = product.options?product.options:[]
            options.forEach(option => {
                mainItemPrice -= option.additionalOptionPrice
            })
            var optionsTotal=0;
            var optionsArr="";
            if(product.productCount==1)
                optionsArr=[[['Main item', product.productName, mainItemPrice.toFixed(2)]]];
            else
                optionsArr=[[['Main item', product.productName, mainItemPrice.toFixed(2)+' x '+product.productCount]]];
            var optionCategoryName="        ";
            var categoryCount = 0;
            options.sort(function(a, b){
                if(a.optionCategoryName){
                    if(b.optionCategoryName){
                        return a.optionCategoryName > b.optionCategoryName
                    }
                    else{
                        return 1
                    }
                } 
                else{
                    return -1
                }
            });
            for(var i = 0; i < options.length; i++) {
                const option = options[i]
                if(optionCategoryName !== option.optionCategoryName){
                    if(option.optionPortions == undefined || option.optionPortions == 1)
                        optionsArr.push([[
                            option.optionCategoryName?option.optionCategoryName:'        +',
                            option.subOptionShortName?option.optionName + '('+option.subOptionShortName+')':option.optionName, 
                            option.additionalOptionPrice?option.additionalOptionPrice.toFixed(2):'0'
                        ]]);
                    else
                        optionsArr.push([[
                            option.optionCategoryName?option.optionCategoryName:'        +',
                            option.subOptionShortName?option.optionName + '('+option.subOptionShortName+')':option.optionName, 
                            option.additionalOptionPrice?option.additionalOptionPrice.toFixed(2):'0'+' x '+option.optionPortions
                        ]]);
                    optionCategoryName=option.optionCategoryName;
                    categoryCount++;
                }
                else{
                    if(option.optionPortions==1){//console.log("option.name, option.price:",option.name, option.price);
                        optionsArr[categoryCount].push(['',option.subOptionShortName?option.optionName + '('+option.subOptionShortName+')':option.optionName, option.additionalOptionPrice?option.additionalOptionPrice.toFixed(2):'0'])}
                    else
                        optionsArr[categoryCount].push(['',option.subOptionShortName?option.optionName + '('+option.subOptionShortName+')':option.optionName, option.additionalOptionPrice?option.additionalOptionPrice.toFixed(2):'0'+' x '+option.optionPortions])
                }
            };
            if(product.productNotes)
                optionsArr=[[['Dish note', product.productNotes.replace('\n',' '), '']]];
        
            pData.push(["set font big"]);
            pData.push(["printlr",product.productName,product.productTotalPrice?product.productTotalPrice.toFixed(2):'0']);
            pData.push(["set font small"]);
            var mainItem = [""]
            //console.log('bbbbbbbbbbbbbb',optionsArr,'cccccccccccccccc');
            pData.push(["set width",60]);
            var leadingSpace='   ';
            for(var i=0;i<optionsArr.length;i++){
                pData.push(["table3c", 
                    ['LEFT','LEFT','RIGHT'],
                    [23,23,10],
                    optionsArr[i],
                    '   ',
                ]); 
            }
            pData.push(["set width",48]);  
        });
        pData.push(["set font big"]);
        pData.push(["align","LEFT"]);
        pData.push(["println","Notes:"]);
        var note=order.ticket.cartSnapshot.orderNotes;
        var len = parseInt(note.length/48);
        var nodes=[];
        for(var i=0; i<len; i++)
        {
            if(len>8){
                note="";
                break;
            }
            pData.push(["println",note.subStr(0,48)]);
            node = note.slice(48);
        }
        if(note!=='')
            pData.push(["println",note]);
        pData.push(["draw line"]);
    }
    pData.push(["printlr","Subtotal:",order.ticket.cartSnapshot.subTotal.toFixed(2)]);
    pData.push(["printlr","Tax", order.ticket.salesTax.toFixed(2)]);
    pData.push(["printlr","Tip", order.ticket.tip.toFixed(2)]);
    pData.push(["printlr","Total", order.ticket.total.toFixed(2)]);
    pData.push(["set font small"]);
    pData.push(["align","center"]);
    var restName=data.storeName+" "+data.userPhone;
    pData.push(["println",restName]);
    //pData.push(["println",order.address]);
    print(pData);
    //console.log("Document data:", JSON.stringify(pData, null, "   "));

} catch(error) {
    console.log("Error getting document:", error);
};
}

var fs = require('fs');
var restName = "Baba Ghannouj Restaurant & Catering";

module.exports.print = print;
module.exports.printOrder = printOrder;
