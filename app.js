async function getStoreById(ctx){
  try {
    logger.info(`get store by storeId: ${ctx.query.storeId}`)
    const store = await sbu.getStoreById(ctx.query.storeId)
    console.log('store', store)
    ctx.status = 200
    ctx.body = store
  } catch (error) {
    ctx.status = 400
    ctx.body = error
  }
}

let restName = "Cafe Meridian & Catering Company";
let printer = require('./src/printer');
const http = require('http');
function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}
const bodyParser = require('koa-bodyparser');
var Koa = require('koa')
var cors = require('koa2-cors')
var Router = require('koa-router');
const app = new Koa()
var router = new Router();
 
app.use(cors())
router.post('/print-order/', (ctx) => {
  return Promise.resolve().then(() => {
    printer.printOrder(ctx.request.body)
  })
})
router.get('/get-store-by-id/', getStoreById)

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())
app.listen(8081, function () {
  console.log('CORS-enabled web server listening on port 8081')
})

console.log("printer address:",process.argv[2]," version: 1.0");
console.log('Listen on: '+8081);
printer.print([["println","Baba Ghannouj Restaurant & Catering"],["println","Printer connect success."]]);
//printer.checkServer();
//printer.printOrder('URTaYyCjAyxLnSLfZnvI');
//printer.printOrder('xyDZvZ7imoh68HoQbzIz');