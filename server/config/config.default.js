/* eslint valid-jsdoc: "off" */

'use strict'
const path = require('path')

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {}

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1592196254750_1957'

  //注意：上传文件需要打开白名单
  config.multipart = {
      mode:'file',
      whitelist:()=>true
  }
  //将文件移到我们想要的目录下
  config.UPLOAD_DIR = path.resolve(__dirname,'..','app/public')

  // add your middleware config here
  config.middleware = []

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  }

  return {
    ...config,
    ...userConfig,
    security:{
        csrf:{
            enable:false
        }
    },
    mongoose:{
        client:{
            url:"mongodb://127.0.0.1:27017/testhub",
            options:{

            }
        },
    },
    jwt:{
        secret:"kicylan@bule@123"
    }
  }
}
