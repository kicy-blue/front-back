'use strict'

const Controller = require('egg').Controller

class HomeController extends Controller {
  async index() {
    const { ctx } = this
    ctx.body = 'hi, egg'
  }
  async article(){
    let list = [
        {_id:1, title:'test',author:'kicy',like:99,views:100}
    ]
    const { ctx } = this
    ctx.body = list
}
}

module.exports = HomeController
