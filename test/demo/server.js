const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')

const app = new Koa()
const router = new Router()

app.use(bodyParser())

router.get('/demo2/test', ctx => {
    ctx.cookies.set('I_AM_SERVER1', 'THIS_IS_THE_VALUE', {
        maxAge: 10 * 60 * 1000,
        httpOnly: false,
        path: '/',
    })
    ctx.cookies.set('I_AM_SERVER2', 'THIS_IS_THE_ANOTHER_VALUE', {
        maxAge: 10 * 60 * 1000,
        httpOnly: false,
        path: '/',
    })
    ctx.body = {}
})

router.post('/action', ctx => {
    const needDo = ctx.request.body.needDo

    if (needDo === 'showRequestCookie') {
        const header = ctx.request.header
        ctx.body = {
            cookie: header.cookie,
        }
    } else {
        ctx.body = {}
    }
})

app.use(router.routes())
app.use(router.allowedMethods())
app.listen(9420)

console.log('server listen 9420')
